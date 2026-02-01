import React from 'react';
import { Download } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

const SalarySlip = ({ employee, onClose, getPaymentRecord, selectedMonth }) => {
    const { darkMode } = useTheme();

    if (!employee) return null;

    const record = getPaymentRecord(employee.id);
    if (!record) return null;

    // Normalize Data
    const data = {
        netPay: Number(record.net_salary || 0),
        baseSalary: Number(record.basic_salary || 0),
        bonus: Number(record.housing_allowance || 0) + Number(record.transport_allowance || 0) + Number(record.other_allowance || 0) + Number(record.overtime_pay || 0),
        deduction: Number(record.deductions || 0),
        paymentDate: new Date(record.updatedAt || new Date()).toLocaleDateString(),
        employeeName: record.Employee?.name || `${employee.first_name || ''} ${employee.last_name || ''}`,
        notes: record.notes,
        // For PDF Generator
        ...record,
        Employee: record.Employee || employee
    };

    const handleDownload = () => {
        import('@/utils/pdfGenerator').then(module => {
            module.generatePayslip({
                ...record,
                Employee: record.Employee || employee,
                month: new Date(selectedMonth).getMonth() + 1,
                year: new Date(selectedMonth).getFullYear()
            });
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                <div className="bg-[#3A4D4E] p-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold">Salary Slip</h2>
                        <p className="opacity-90 text-sm mt-1">{new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-2xl font-bold">SAR {data.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                        <div className="flex justify-end gap-2 mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-white/20 font-medium">{record.status || 'PAID'}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-white/20 font-medium">{data.paymentDate}</span>
                        </div>
                    </div>
                </div>

                <div className={`p-6 space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {/* Employee Details */}
                    <div className="flex justify-between border-b pb-4 border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Employee</p>
                            <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.employeeName}</p>
                            <p className="text-xs">{employee.role}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase">Bank Account</p>
                            <p className="font-mono text-sm">{employee.account_number || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{employee.bank_name || 'Cash'}</p>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Basic Salary</span>
                            <span className="font-semibold">{data.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-green-600 bg-green-50/50 dark:bg-green-900/10 px-2 py-1 rounded">
                            <span>Allowances / Bonus</span>
                            <span>+ {data.bonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-red-500 bg-red-50/50 dark:bg-red-900/10 px-2 py-1 rounded">
                            <span>Deductions</span>
                            <span>- {data.deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>

                        {/* Notes Section */}
                        {data.notes && (
                            <div className={`text-xs p-2 rounded mt-2 border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                <span className="font-semibold block mb-1">Remarks:</span>
                                {data.notes}
                            </div>
                        )}

                        <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                        <div className={`flex justify-between text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <span>Net Paid</span>
                            <span>SAR {data.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className={`p-4  flex gap-3 justify-end ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">Close</button>
                    <button onClick={handleDownload} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#3A4D4E] text-white hover:bg-[#2c3b3c] flex items-center gap-2">
                        <Download size={16} /> Print / Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalarySlip;
