import React from 'react';
import { Search, X } from 'lucide-react';

const ManualEntryModal = ({
    darkMode,
    setIsManualModalOpen,
    employeeSearch,
    setEmployeeSearch,
    manualEntry,
    setManualEntry,
    employees,
    handleManualSubmit
}) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4"
        onClick={() => setIsManualModalOpen(false)}>
        <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl transform transition-all scale-100
            ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}>

            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Manual Attendance Entry</h3>
                <button onClick={() => setIsManualModalOpen(false)} className="text-gray-400 hover:text-gray-500"><X size={20} /></button>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Find Employee</label>
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 
                                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            placeholder="Type name or EMP-ID..."
                            value={employeeSearch}
                            onChange={(e) => {
                                setEmployeeSearch(e.target.value);
                                setManualEntry({ ...manualEntry, employee_id: '' });
                            }}
                        />
                    </div>

                    {employeeSearch && !manualEntry.employee_id && (
                        <div className={`absolute z-[70] w-full mt-1 max-h-48 overflow-y-auto rounded-xl shadow-2xl border animate-[fadeIn_0.1s_ease-out]
                            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            {employees
                                .filter(emp =>
                                    (`${emp.first_name} ${emp.last_name}`).toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                    emp.emp_id.toLowerCase().includes(employeeSearch.toLowerCase())
                                )
                                .map(emp => (
                                    <button
                                        key={emp.id}
                                        type="button"
                                        onClick={() => {
                                            setManualEntry({ ...manualEntry, employee_id: emp.id });
                                            setEmployeeSearch(`${emp.first_name} ${emp.last_name} (${emp.emp_id})`);
                                        }}
                                        className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between
                                            ${darkMode ? 'hover:bg-gray-700 text-gray-200 border-b border-gray-700' : 'hover:bg-blue-50 text-gray-700 border-b border-gray-100'}`}
                                    >
                                        <span className="font-medium text-sm">{emp.first_name} {emp.last_name}</span>
                                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                            {emp.emp_id}
                                        </span>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border outline-none 
                                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            value={manualEntry.type}
                            onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value })}
                        >
                            <option value="CHECK_IN">Check-In</option>
                            <option value="CHECK_OUT">Check-Out</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border outline-none
                                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            value={manualEntry.status}
                            onChange={(e) => setManualEntry({ ...manualEntry, status: e.target.value })}
                        >
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                            <option value="ABSENT">Absent</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                        <input
                            type="date"
                            className={`w-full px-4 py-2 rounded-lg border outline-none
                                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            value={manualEntry.date}
                            onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time</label>
                        <input
                            type="time"
                            className={`w-full px-4 py-2 rounded-lg border outline-none
                                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            value={manualEntry.time}
                            onChange={(e) => setManualEntry({ ...manualEntry, time: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-orange-500"
                            checked={manualEntry.is_overtime}
                            onChange={(e) => setManualEntry({ ...manualEntry, is_overtime: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-orange-700">Mark as Overtime</span>
                    </label>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        onClick={() => {
                            setIsManualModalOpen(false);
                            setEmployeeSearch('');
                            setManualEntry({
                                employee_id: '',
                                type: 'CHECK_IN',
                                date: new Date().toISOString().split('T')[0],
                                time: new Date().toTimeString().slice(0, 5),
                                status: 'PRESENT',
                                location: '',
                                is_overtime: false
                            });
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleManualSubmit}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                    >
                        Save Record
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default ManualEntryModal;
