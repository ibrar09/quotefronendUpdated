import React, { useState } from 'react';
import { DollarSign, CheckCircle, Calendar, Search, CreditCard, CheckSquare, Square, Building2, FileText, Users } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import API_BASE_URL from '../../../../config/api';
import { resolveUrl } from '../../../../utils/url';

const PayrollList = ({
    employees,
    payrollHistory,
    selectedMonth,
    setSelectedMonth,
    onBatchStart,
    onSingleProcess,
    onEditPayment,
    onViewSlip,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    onGenerate, // New Prop
    onMarkPaid // New Prop
}) => {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');


    // --- 1. Enhanced Mock Data Generator ---
    const enhanceEmployeeData = (emp) => {
        // Find DB Record
        const payment = payrollHistory.find(p => p.employee_id === emp.id);

        const base = Number(payment?.basic_salary || emp.basic_salary) || 0;

        // Use DB values if Payroll exists, otherwise Employee Defaults
        const housing = payment ? Number(payment.housing_allowance) : (Number(emp.housing_allowance) || 0);
        const transport = payment ? Number(payment.transport_allowance) : (Number(emp.transport_allowance) || 0);
        const other = payment ? Number(payment.other_allowance) : (Number(emp.other_allowance) || 0);

        const overtime = payment ? Number(payment.overtime_pay) : 0;
        const overtimeHours = payment ? Number(payment.overtime_hours) : 0;

        const deductions = payment ? Number(payment.deductions) : 0;

        // Calculate Gross/Net based on available data
        const gross = base + housing + transport + other + overtime;
        const net = gross - deductions;

        const isPaid = payment?.status === 'PAID' || payment?.status === 'Paid';

        return {
            ...emp,
            breakdown: {
                basic: base,
                housing: housing,
                transport: transport,
                other: other, // Add this
                overtime: overtime,
                overtimeHours: overtimeHours, // Pass this to CreatePayroll
                deductions: deductions,
                gross: gross,
                net: Number(payment?.net_salary || net) // Ensure Number
            },
            paymentRecord: payment, // This is the 'Payroll' object from DB
            isPaid: isPaid
        };
    };

    const enhancedEmployees = employees.map(enhanceEmployeeData);

    const filteredEmployees = enhancedEmployees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats Calculation - Use enhancedEmployees (All) instead of filteredEmployees
    const stats = enhancedEmployees.reduce((acc, emp) => {
        const netVal = Number(emp.breakdown.net) || 0;
        if (emp.isPaid) {
            acc.paidAmount += netVal;
            acc.paidCount++;
        } else {
            acc.pendingAmount += netVal;
            acc.pendingCount++;
        }
        acc.totalEst += netVal;
        return acc;
    }, { paidAmount: 0, paidCount: 0, pendingAmount: 0, pendingCount: 0, totalEst: 0 });


    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out] overflow-hidden" >

            {/* --- Header & Controls --- */}
            < div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8" >
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payroll Management</h1>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Overview of salaries, overtime, and monthly disbursements.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    {/* Process Button */}
                    {selectedIds.size > 0 && (
                        <button
                            onClick={() => onBatchStart(enhancedEmployees.filter(e => selectedIds.has(e.id)))}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 animate-[pulse_3s_infinite]">
                            <CreditCard size={18} /> Process Selected ({selectedIds.size})
                        </button>
                    )}

                    {/* WPS Export Button */}
                    <button
                        onClick={() => {
                            // Generate WPS CSV
                            const headers = ["Employee ID,Name,IBAN,Amount,Payment Date,Remarks\n"];
                            const rows = enhancedEmployees.filter(e => e.isPaid).map(e => {
                                const iban = e.iban || "SA0000000000000000000000"; // Placeholder if missing
                                return `${e.id},"${e.name}",${iban},${e.breakdown.net},${e.paymentRecord.payment_date || new Date().toISOString().split('T')[0]},Salary`;
                            });

                            if (rows.length === 0) {
                                alert("No paid records to export.");
                                return;
                            }

                            const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `WPS_Payroll_${selectedMonth}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all border flex items-center gap-2
                            ${darkMode ? 'bg-gray-800 border-gray-700 text-green-400 hover:bg-gray-700' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'}`}>
                        <FileText size={16} /> Export WPS
                    </button>

                    {/* Month Picker & Generate */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Calendar size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className={`pl-12 pr-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-auto transition-all
                                    ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                            />
                        </div>
                        <button
                            onClick={onGenerate}
                            className={`px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95
                             ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                            Generate
                        </button>
                    </div>
                </div>
            </div >

            {/* --- Stats Cards --- */}
            < div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" >
                {/* Total Estimated */}
                < div className={`p-6 rounded-2xl border relative overflow-hidden group transition-all duration-300
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100 hover:shadow-lg'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Estimated</p>
                            <h3 className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stats.totalEst.toLocaleString()} <span className="text-sm font-normal text-gray-500">SAR</span>
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div >

                {/* Paid */}
                < div className={`p-6 rounded-2xl border relative overflow-hidden group transition-all duration-300
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100 hover:shadow-lg'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid this Month</p>
                            <h3 className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stats.paidAmount.toLocaleString()} <span className="text-sm font-normal text-gray-500">SAR</span>
                            </h3>
                            <p className="text-xs text-green-500 font-medium mt-1">{stats.paidCount} Employees Paid</p>
                        </div>
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div >

                {/* Pending */}
                < div className={`p-6 rounded-2xl border relative overflow-hidden group transition-all duration-300
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100 hover:shadow-lg'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Payments</p>
                            <h3 className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stats.pendingAmount.toLocaleString()} <span className="text-sm font-normal text-gray-500">SAR</span>
                            </h3>
                            <p className="text-xs text-orange-500 font-medium mt-1">{stats.pendingCount} Employees Pending</p>
                        </div>
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                            <Calendar size={24} />
                        </div>
                    </div>
                </div >
            </div >

            {/* --- Main Table Container --- */}
            < div className={`flex-1 rounded-2xl border overflow-hidden flex flex-col min-h-0 shadow-sm
                ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>

                {/* Toolbar */}
                < div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border w-full max-w-md transition-all focus-within:ring-2 focus-within:ring-blue-500/10
                        ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, role or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`bg-transparent outline-none text-sm w-full ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        />
                    </div>
                </div >

                {/* Table Header */}
                < div className={`grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b
                    ${darkMode ? 'bg-gray-800/50 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    <div className="col-span-1 flex items-center">
                        <button onClick={() => toggleSelectAll(filteredEmployees)} className="hover:text-blue-500 transition-colors">
                            {selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0 ?
                                <CheckSquare size={18} className="text-blue-600" /> :
                                <Square size={18} />
                            }
                        </button>
                    </div>
                    <div className="col-span-3">Employee</div>
                    <div className="col-span-5 grid grid-cols-5 gap-2 text-center">
                        <span className="text-right">Basic</span>
                        <span className="text-right hidden sm:block">House</span>
                        <span className="text-right hidden sm:block">Trans</span>
                        <span className="text-right text-green-600">OT</span>
                        <span className="text-right text-red-500">Ded</span>
                    </div>
                    <div className="col-span-2 text-right">Net Pay</div>
                    <div className="col-span-1 text-right">Action</div>
                </div >

                {/* Table Body */}
                < div className="flex-1 overflow-y-auto custom-scrollbar" >
                    {
                        filteredEmployees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                <Users size={48} className="mb-4 opacity-20" />
                                <p>No employees found matching your search.</p>
                            </div>
                        ) : (
                            filteredEmployees.map(emp => {
                                const isSelected = selectedIds.has(emp.id);

                                return (
                                    <div key={emp.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b last:border-0 transition-all duration-200
                                    ${isSelected ? (darkMode ? 'bg-blue-900/10' : 'bg-blue-50/50') : (darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50')}
                                    ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>

                                        {/* Checkbox */}
                                        <div className="col-span-1">
                                            <button onClick={() => toggleSelection(emp.id)} className={`transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-300 hover:text-gray-400'}`}>
                                                {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </button>
                                        </div>

                                        {/* Employee Info */}
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border-2 overflow-hidden
                                            ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-white text-blue-600 ring-1 ring-gray-100'}`}>
                                                {resolveUrl(emp.avatar_url || emp.avatar) ? (
                                                    <img
                                                        src={resolveUrl(emp.avatar_url || emp.avatar)}
                                                        alt={emp.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = `<span>${emp.name.charAt(0)}</span>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <span>{emp.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-semibold text-sm truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{emp.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}>{emp.role}</span>
                                                    {emp.isPaid && <CheckCircle size={12} className="text-green-500" />}
                                                    {!emp.isPaid && emp.paymentRecord && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium">Draft</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Breakdown Columns */}
                                        <div className="col-span-5 grid grid-cols-5 gap-2 text-xs font-mono">
                                            <div className={`text-right ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{emp.breakdown.basic.toLocaleString()}</div>
                                            <div className={`text-right hidden sm:block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{emp.breakdown.housing.toLocaleString()}</div>
                                            <div className={`text-right hidden sm:block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{emp.breakdown.transport.toLocaleString()}</div>
                                            <div className="text-right text-green-600 font-medium">+{emp.breakdown.overtime.toLocaleString()}</div>
                                            <div className="text-right text-red-500 font-medium">-{emp.breakdown.deductions.toLocaleString()}</div>
                                        </div>

                                        {/* Net Pay */}
                                        <div className="col-span-2 text-right">
                                            <div className={`font-bold font-mono text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {emp.breakdown.net.toLocaleString()}
                                            </div>
                                            <p className="text-[10px] text-gray-400">SAR</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-1 flex justify-end">
                                            {!emp.isPaid ? (
                                                <div className="flex gap-2">
                                                    {emp.paymentRecord && !emp.isPaid && (
                                                        <button
                                                            onClick={() => onMarkPaid && onMarkPaid(emp)}
                                                            className={`p-2 rounded-lg transition-colors border shadow-sm
                                                        ${darkMode ? 'bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20' : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'}`}
                                                            title="Mark as Paid">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onSingleProcess(emp)}
                                                        className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm
                                                ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                        title={emp.paymentRecord ? "Update/Finalize Record" : "Create Record"}>
                                                        {emp.paymentRecord ? <div className="w-4 h-4">✏️</div> : <CreditCard size={16} />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => onEditPayment && onEditPayment(emp)}
                                                        className={`p-2 rounded-lg transition-colors border
                                                    ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-blue-400' : 'border-gray-200 hover:bg-gray-50 text-blue-600'}`}
                                                        title="Edit Record">
                                                        <div className="w-4 h-4">✏️</div>
                                                    </button>
                                                    <button
                                                        onClick={() => onViewSlip(emp)}
                                                        className={`p-2 rounded-lg transition-colors border
                                                    ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                                                        title="View Slip">
                                                        <FileText size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )
                    }
                </div >
            </div >
        </div >
    );
};

export default PayrollList;
