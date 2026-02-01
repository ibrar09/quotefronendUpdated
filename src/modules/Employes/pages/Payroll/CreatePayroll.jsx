import React, { useState, useEffect } from 'react';
import { Plus, Minus, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

const CreatePayroll = ({ employee, onBack, processPayment, updatePayment, selectedMonth, initialData }) => {
    const { darkMode } = useTheme();

    if (!employee) return null;

    // Use breakdown if available (from PayrollList), otherwise fallback to raw DB fields
    const baseSalary = employee.breakdown?.basic || Number(employee.basic_salary) || 0;

    // Initial State - Prefill if editing (initialData has priority)
    const [housing, setHousing] = useState(initialData?.housing_allowance ? Number(initialData.housing_allowance) : (employee.breakdown?.housing || Number(employee.housing_allowance) || 0));
    const [transport, setTransport] = useState(initialData?.transport_allowance ? Number(initialData.transport_allowance) : (employee.breakdown?.transport || Number(employee.transport_allowance) || 0));

    const [overtime, setOvertime] = useState(initialData?.overtime_pay ? Number(initialData.overtime_pay) : (employee.breakdown?.overtime || Number(employee.overtime_pay) || 0));
    const [overtimeHours, setOvertimeHours] = useState(initialData?.overtime_hours ? Number(initialData.overtime_hours) : (employee.breakdown?.overtimeHours || 0));

    const [bonus, setBonus] = useState(initialData?.bonus ? Number(initialData.bonus) : (Number(employee.other_allowance) || 0));
    const [deduction, setDeduction] = useState(initialData?.deduction ? Number(initialData.deduction) : (Number(employee.breakdown?.deductions) || 0));

    const [paymentMethod, setPaymentMethod] = useState(initialData?.method || 'Bank Transfer');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [date, setDate] = useState(initialData?.paymentDate || new Date().toISOString().split('T')[0]);

    // Auto-Calculate Overtime when Hours or Rate changes
    useEffect(() => {
        const hrs = Number(overtimeHours) || 0;
        const rate = Number(employee.overtime_rate) || 0;

        // Ensure calculation logic matches: Fixed or Multiplier
        if (hrs > 0 && rate > 0) {
            let calculated = 0;
            if (rate > 5) {
                // Fixed Rate (e.g. 15 SAR/hr)
                calculated = hrs * rate;
            } else {
                // Multiplier logic (e.g. 1.5x)
                const base = Number(baseSalary) || 0;
                const hourly = base / 240; // Standard 240 hours/month
                calculated = hourly * rate * hrs;
            }
            // Update Amount
            setOvertime(parseFloat(calculated.toFixed(2)));
        } else if (hrs === 0) {
            setOvertime(0);
        }
    }, [overtimeHours, employee.overtime_rate, baseSalary]);

    const netPay = baseSalary + Number(housing) + Number(transport) + Number(overtime) + Number(bonus) - Number(deduction);

    const handleSubmit = (e, status = 'PAID') => {
        e.preventDefault();
        const paymentRecord = {
            id: initialData?.id || Date.now(), // Keep ID if editing
            employeeId: employee.id,
            employeeName: employee.name,
            month: selectedMonth,
            baseSalary: baseSalary,
            housing_allowance: Number(housing),
            transport_allowance: Number(transport),
            overtime_pay: Number(overtime),
            overtime_hours: Number(overtimeHours),
            bonus: Number(bonus),
            deduction: Number(deduction),
            netPay: netPay,
            paymentDate: date,
            method: paymentMethod,
            notes: notes,
            status: status
        };

        if (initialData && updatePayment) {
            updatePayment(paymentRecord);
        } else {
            console.log("Processing Payment...", paymentRecord);
            processPayment(paymentRecord);
        }

        onBack();
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="min-h-full flex flex-col items-center justify-center">

                <div className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>

                    {/* Left Side - Employee Info & Context (Sidebar Color) */}
                    <div className="md:w-1/3 bg-[#3A4D4E] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                        {/* Decorative Circle */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm mb-8 group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to List
                            </button>

                            <h2 className="text-2xl font-bold mb-2">{initialData ? 'Update Payroll' : 'Process Payroll'}</h2>
                            <p className="text-gray-400 text-sm mb-6">{initialData ? 'Modify payment details for this record.' : 'Enter payment details for the selected employee.'}</p>

                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Employee</p>
                                <p className="text-lg font-bold">{employee.name}</p>
                                <p className="text-sm text-gray-300">{employee.role}</p>
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Target Month</p>
                                    <p className="font-mono text-lg text-yellow-500">{new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-8 text-xs text-gray-400 opacity-60">
                            <p>StaffPortal Payroll System</p>
                            <p>Internal System Record</p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className={`md:w-2/3 p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                        <form className="space-y-6">

                            {/* Salary Summary */}

                            {/* Salary Summary */}
                            <div className={`p-4 rounded-xl border flex justify-between items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                                <div>
                                    <span className="text-sm text-gray-500 block">Basic Contract Salary</span>
                                    <span className="text-xs text-gray-400">Fixed monthly amount</span>
                                </div>
                                <span className="text-xl font-mono font-bold">SAR {baseSalary.toLocaleString()}</span>
                            </div>

                            {/* Allowances Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-xs font-semibold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Housing Allowance</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={housing}
                                        onChange={e => setHousing(e.target.value)}
                                        className={`block w-full px-3 py-3 rounded-lg border text-sm font-mono outline-none transition-all
                                    ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Transport Allowance</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={transport}
                                        onChange={e => setTransport(e.target.value)}
                                        className={`block w-full px-3 py-3 rounded-lg border text-sm font-mono outline-none transition-all
                                    ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Overtime Section - Split Inputs */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Overtime Hours</label>
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-3 rounded-lg border text-[10px] font-bold whitespace-nowrap
                                            ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                            Rate: {employee.overtime_rate > 5 ? `${employee.overtime_rate} SAR` : `${employee.overtime_rate}x`}
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={overtimeHours}
                                            onChange={e => setOvertimeHours(e.target.value)}
                                            className={`block w-full px-3 py-3 rounded-lg border text-sm font-mono outline-none transition-all
                                                ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-1">Editable</span>
                                </div>

                                <div>
                                    <label className={`block text-xs font-semibold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Overtime Amount (SAR)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Plus size={16} className="text-orange-500" />
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={overtime}
                                            onChange={e => setOvertime(e.target.value)}
                                            className={`block w-full pl-10 pr-3 py-3 rounded-lg border text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all
                                        ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900 hover:border-orange-300'}`}
                                        />
                                    </div>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Other / Bonus */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Other Allowance / Bonus</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Plus size={16} className="text-green-500" />
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={bonus}
                                            onChange={e => setBonus(e.target.value)}
                                            className={`block w-full pl-10 pr-3 py-3 rounded-lg border text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all
                                        ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900 hover:border-green-300'}`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Deduction */}
                            <div>
                                <label className={`block text-xs font-semibold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Less: Deductions</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Minus size={16} className="text-red-500" />
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={deduction}
                                        onChange={e => setDeduction(e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-3 rounded-lg border text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all
                                    ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900 hover:border-red-300'}`}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        className={`w-full p-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all
                                    ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                        <option>Bank Transfer</option>
                                        <option>Cash</option>
                                        <option>Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className={`w-full p-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all
                                    ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Remarks</label>
                                <textarea
                                    rows="2"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Add any relevant notes..."
                                    className={`w-full p-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all
                                ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-200 placeholder-gray-400 hover:border-blue-300'}`}
                                />
                            </div>

                            {/* Total & Action */}
                            <div className="pt-6 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Net Payable Amount</p>
                                    <p className={`text-3xl font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>SAR {netPay.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, 'DRAFT')}
                                        className={`px-6 py-3 rounded-xl text-sm font-bold border transition-all transform hover:-translate-y-0.5
                                        ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        Save as Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, 'PAID')}
                                        className="px-8 py-3 rounded-xl text-sm font-bold bg-[#3A4D4E] text-white hover:bg-[#2c3b3c] shadow-lg shadow-[#3A4D4E]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                                        <CheckCircle size={20} /> {initialData ? (initialData.status === 'PAID' || initialData.status === 'Paid' ? 'Update' : 'Confirm Payment') : 'Confirm Payment'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePayroll;
