import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

const BatchPayroll = ({ employeesToProcess, onBack, processBulkPayment, selectedMonth }) => {
    const { darkMode } = useTheme();
    const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
    const [globalMethod, setGlobalMethod] = useState('Bank Transfer');

    // Local state to track edits for each employee in the batch
    // Map: employeeId -> { bonus: 0, deduction: 0, notes: '' }
    const [batchData, setBatchData] = useState({});

    useEffect(() => {
        const initialData = {};
        employeesToProcess.forEach(emp => {
            initialData[emp.id] = { bonus: 0, deduction: 0, notes: '' };
        });
        setBatchData(initialData);
    }, [employeesToProcess]);

    const updateBatchItem = (id, field, value) => {
        setBatchData(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const calculateNet = (empId, baseSalary) => {
        const data = batchData[empId] || { bonus: 0, deduction: 0 };
        return Number(baseSalary) + Number(data.bonus) - Number(data.deduction);
    };

    const grandTotal = employeesToProcess.reduce((sum, emp) => {
        return sum + calculateNet(emp.id, emp.salary || 0);
    }, 0);

    const handleBatchSubmit = () => {
        const records = employeesToProcess.map(emp => {
            const data = batchData[emp.id] || { bonus: 0, deduction: 0, notes: '' };
            const baseSalary = Number(emp.salary) || 0;
            return {
                id: Date.now() + Math.random(), // Unique ID
                employeeId: emp.id,
                employeeName: emp.name,
                month: selectedMonth,
                baseSalary: baseSalary,
                bonus: Number(data.bonus),
                deduction: Number(data.deduction),
                netPay: baseSalary + Number(data.bonus) - Number(data.deduction),
                paymentDate: globalDate,
                method: globalMethod,
                notes: data.notes,
                status: 'Paid'
            };
        });
        processBulkPayment(records);
        onBack();
    };

    return (
        <div className="h-full flex flex-col animate-[fadeIn_0.3s_ease-out] overflow-hidden">
            {/* Header Strip */}
            <div className="bg-[#3A4D4E] text-white p-6 shadow-md flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users size={24} className="text-yellow-400" />
                            Bulk Payroll Processing
                        </h2>
                        <p className="text-sm text-gray-300 opacity-80">Processing {employeesToProcess.length} employees for {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-gray-400 uppercase">Total Payout</p>
                        <p className="text-2xl font-mono font-bold text-yellow-500">SAR {grandTotal.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={handleBatchSubmit}
                        className="px-6 py-2.5 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2">
                        <CheckCircle size={20} /> Confirm All
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar Controls (Global Settings) */}
                <div className={`w-full md:w-64 p-6 border-r flex flex-col gap-6 shrink-0 z-0 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Global Settings</label>
                        <p className="text-xs text-gray-500 mb-4">Apply to all transactions</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Payment Date</label>
                                <input
                                    type="date"
                                    value={globalDate}
                                    onChange={e => setGlobalDate(e.target.value)}
                                    className={`w-full p-2 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Payment Method</label>
                                <select
                                    value={globalMethod}
                                    onChange={e => setGlobalMethod(e.target.value)}
                                    className={`w-full p-2 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                                    <option>Bank Transfer</option>
                                    <option>Cash</option>
                                    <option>Cheque</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs leading-relaxed`}>
                        <p><strong>Note:</strong> Verify all bonus and deduction amounts before confirming. Once processed, slips will be generated automatically.</p>
                    </div>
                </div>

                {/* Table Area */}
                <div className={`flex-1 overflow-auto p-4 md:p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className={`rounded-xl border overflow-hidden shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={`text-xs uppercase tracking-wider border-b ${darkMode ? 'bg-gray-900/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                        <th className="px-4 py-3 font-semibold">Employee</th>
                                        <th className="px-4 py-3 font-semibold text-right">Basic Salary</th>
                                        <th className="px-4 py-3 font-semibold w-32">Bonus (+)</th>
                                        <th className="px-4 py-3 font-semibold w-32">Deduction (-)</th>
                                        <th className="px-4 py-3 font-semibold w-48">Remarks</th>
                                        <th className="px-4 py-3 font-semibold text-right">Net Pay</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {employeesToProcess.map(emp => {
                                        const baseSalary = Number(emp.salary) || 0;
                                        const currentData = batchData[emp.id] || { bonus: 0, deduction: 0, notes: '' };
                                        const net = calculateNet(emp.id, baseSalary);

                                        return (
                                            <tr key={emp.id} className={`group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors`}>
                                                <td className="px-4 py-2">
                                                    <div className="font-medium text-sm dark:text-gray-200">{emp.name}</div>
                                                    <div className="text-xs text-gray-400">{emp.role}</div>
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono text-sm dark:text-gray-300">
                                                    {baseSalary.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={currentData.bonus}
                                                        onChange={e => updateBatchItem(emp.id, 'bonus', e.target.value)}
                                                        className={`w-full p-1.5 rounded border text-sm text-right focus:ring-1 focus:ring-green-500 outline-none
                                                        ${darkMode ? 'bg-gray-900 border-gray-600 text-green-400' : 'bg-white border-gray-300 text-green-600'}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={currentData.deduction}
                                                        onChange={e => updateBatchItem(emp.id, 'deduction', e.target.value)}
                                                        className={`w-full p-1.5 rounded border text-sm text-right focus:ring-1 focus:ring-red-500 outline-none
                                                        ${darkMode ? 'bg-gray-900 border-gray-600 text-red-400' : 'bg-white border-gray-300 text-red-600'}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Note..."
                                                        value={currentData.notes}
                                                        onChange={e => updateBatchItem(emp.id, 'notes', e.target.value)}
                                                        className={`w-full p-1.5 rounded border text-sm focus:ring-1 focus:ring-blue-500 outline-none
                                                        ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-600'}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right font-bold font-mono text-sm dark:text-yellow-400 text-gray-800">
                                                    {net.toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchPayroll;
