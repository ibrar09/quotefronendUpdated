import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { generatePayslip } from '../../../utils/pdfGenerator';

import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import toast from 'react-hot-toast';

const Payroll = () => {
    const { darkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [payrolls, setPayrolls] = useState([]);

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Payrolls
    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/payroll`, {
                params: { month: selectedMonth, year: selectedYear },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPayrolls(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payroll data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, [selectedMonth, selectedYear]);

    // Generate Payroll
    const handleGenerate = async () => {
        if (!confirm(`Generate payroll for ${selectedMonth}/${selectedYear}? This will overwrite existing draft records.`)) return;

        setLoading(true);
        const toastId = toast.loading("Generating Payroll...");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/payroll/generate`,
                { month: selectedMonth, year: selectedYear },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setPayrolls(res.data.data);
                toast.success("Payroll Generated Successfully", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Generation failed", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // Save Changes (Manual Edit)
    const handleSaveRow = async (payrollId, updates) => {
        const toastId = toast.loading("Saving...");
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/payroll/${payrollId}`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Updated", { id: toastId });
            // Optimistic update or refetch? Refetch safer for calc
            fetchPayrolls();
        } catch (error) {
            console.error(error);
            toast.error("Save failed", { id: toastId });
        }
    };

    // Mark as Paid
    const handleMarkPaid = async (payrollId) => {
        if (!confirm("Confirm payment? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/payroll/${payrollId}/pay`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Marked as Paid");
            fetchPayrolls();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    // Filter Logic
    const filteredPayrolls = payrolls.filter(p =>
        (p.Employee?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.Employee?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (val) => `SAR ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return (
        <div className={`h-full flex flex-col p-6 overflow-hidden animate-[fadeIn_0.3s_ease-out]
            ${darkMode ? 'text-white' : 'text-gray-900'}`}>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Payroll Management
                    </h1>
                    <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Manage salaries, overtime, and payments
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 px-3 border-r dark:border-gray-700">
                        <Calendar size={18} className="text-gray-400" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent font-medium outline-none text-sm w-28"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent font-medium outline-none text-sm w-20"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Generate Payroll
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-50'} shadow-sm relative overflow-hidden group`}>
                    <div className="absolute right-0 top-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <DollarSign size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">Total Payout</p>
                        <h3 className="text-3xl font-black">
                            {formatCurrency(payrolls.reduce((sum, p) => sum + Number(p.net_salary), 0))}
                        </h3>
                        <p className="text-xs text-gray-400 mt-2">{filteredPayrolls.length} Employees processed</p>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-50'} shadow-sm`}>
                    <p className="text-sm font-medium text-orange-500 uppercase tracking-wider mb-1">Total Overtime</p>
                    <h3 className="text-3xl font-black">
                        {formatCurrency(payrolls.reduce((sum, p) => sum + Number(p.overtime_pay), 0))}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">
                        {payrolls.reduce((sum, p) => sum + Number(p.overtime_hours), 0).toFixed(1)} Total OT Hours
                    </p>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-50'} shadow-sm`}>
                    <p className="text-sm font-medium text-green-500 uppercase tracking-wider mb-1">Completion</p>
                    <h3 className="text-3xl font-black">
                        {payrolls.filter(p => p.status === 'PAID').length} / {payrolls.length}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">Paid Employees</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all
                        ${darkMode ? 'bg-gray-800 border-gray-700 focus:border-blue-500' : 'bg-white border-gray-200 focus:border-blue-400'}`}
                />
            </div>

            {/* Table */}
            <div className={`flex-1 overflow-hidden rounded-2xl border shadow-sm flex flex-col
                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>

                <div className="overflow-auto scrollbar-thin flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className={`sticky top-0 z-10 text-xs uppercase font-bold tracking-wider backdrop-blur-md
                            ${darkMode ? 'bg-gray-900/90 text-gray-400' : 'bg-gray-50/90 text-gray-500'}`}>
                            <tr>
                                <th className="p-4">Employee</th>
                                <th className="p-4">Basic + Allowances</th>
                                <th className="p-4">Overtime <span className="text-[10px] normal-case opacity-70">(Hrs * Rate)</span></th>
                                <th className="p-4">Deductions</th>
                                <th className="p-4">Net Salary</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {filteredPayrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-400">
                                        No records found. Click "Generate Payroll" to start.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayrolls.map(p => (
                                    <PayrollRow
                                        key={p.id}
                                        data={p}
                                        onSave={handleSaveRow}
                                        onPay={handleMarkPaid}
                                        darkMode={darkMode}
                                        formatCurrency={formatCurrency}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Row Component for inline editing
const PayrollRow = ({ data, onSave, onPay, darkMode, formatCurrency }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [edits, setEdits] = useState({});

    // Init edits when entering edit mode
    const startEdit = () => {
        setEdits({
            deductions: data.deductions,
            overtime_pay: data.overtime_pay
            // Can add others if needed
        });
        setIsEditing(true);
    };

    const saveEdit = () => {
        onSave(data.id, edits);
        setIsEditing(false);
    };

    const basicTotal = Number(data.basic_salary) + Number(data.housing_allowance) + Number(data.transport_allowance) + Number(data.other_allowance);

    return (
        <tr className={`group transition-colors ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-blue-50/30'}`}>
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                        ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                        {data.Employee?.name ? data.Employee.name.charAt(0) : '?'}
                    </div>
                    <div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{data.Employee?.name || 'Unknown Employee'}</div>
                        <div className="text-xs text-gray-500">{data.Employee?.email || 'No Email'}</div>
                    </div>
                </div>
            </td>

            <td className="p-4 text-gray-500">
                <div className="font-mono font-medium">{formatCurrency(basicTotal)}</div>
                <div className="text-[10px] opacity-70">Base: {Number(data.basic_salary).toLocaleString()}</div>
            </td>

            <td className="p-4">
                {isEditing ? (
                    <input
                        type="number"
                        value={edits.overtime_pay}
                        onChange={e => setEdits(prev => ({ ...prev, overtime_pay: e.target.value }))}
                        className={`w-24 px-2 py-1 rounded text-right outline-none font-mono border focus:ring-2 ring-blue-500/50
                            ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                ) : (
                    <div className="font-mono text-orange-600 font-medium">
                        {formatCurrency(data.overtime_pay)}
                        <span className="block text-[10px] text-gray-400">
                            {data.overtime_hours} hrs @ {data.overtime_rate}x
                        </span>
                    </div>
                )}
            </td>

            <td className="p-4">
                {isEditing ? (
                    <input
                        type="number"
                        value={edits.deductions}
                        onChange={e => setEdits(prev => ({ ...prev, deductions: e.target.value }))}
                        className={`w-24 px-2 py-1 rounded text-right outline-none font-mono border focus:ring-2 ring-red-500/50
                            ${darkMode ? 'bg-gray-900 border-red-900 text-red-400' : 'bg-white border-red-200 text-red-600'}`}
                    />
                ) : (
                    <div className="font-mono text-red-500 font-medium">
                        - {Number(data.deductions).toLocaleString()}
                    </div>
                )}
            </td>

            <td className="p-4">
                <div className={`text-lg font-black font-mono shadow-sm px-3 py-1 rounded-lg w-max border
                    ${darkMode ? 'bg-gray-900 border-gray-700 text-green-400' : 'bg-white border-gray-200 text-green-700'}`}>
                    {formatCurrency(data.net_salary)}
                </div>
            </td>

            <td className="p-4">
                {data.status === 'PAID' ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1 w-max">
                        <CheckCircle size={12} /> PAID
                    </span>
                ) : (
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200 w-max">
                        DRAFT
                    </span>
                )}
            </td>

            <td className="p-4 text-right">
                {data.status !== 'PAID' && (
                    <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={saveEdit} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Save size={16} /></button>
                                <button onClick={() => setIsEditing(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><XCircle size={16} /></button>
                            </>
                        ) : (
                            <>
                                <button onClick={startEdit} className={`text-sm font-medium hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Edit</button>
                                <button onClick={() => onPay(data.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95">
                                    Pay
                                </button>
                            </>
                        )}
                    </div>
                )}
                {data.status === 'PAID' && (
                    <button
                        onClick={() => generatePayslip(data)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Download Payslip"
                    >
                        <Download size={16} />
                    </button>
                )}
            </td>
        </tr>
    );
}

export default Payroll;
