import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Search, RotateCcw, Trash2 } from 'lucide-react';

const TerminatedEmployees = ({ employees = [], onRestore }) => {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#F9F7F1] border-gray-200'}`}>

            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                    <Trash2 size={18} className="text-red-500" />
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Terminated / Ex-Employees</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        {employees.length}
                    </span>
                </div>
                <div className={`flex items-center px-3 py-1.5 rounded-lg border text-sm focus-within:ring-2 ring-red-500/20 transition-all 
                    ${darkMode ? 'bg-gray-900/50 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none w-32 md:w-48 placeholder-gray-500 text-gray-700 dark:text-gray-200 text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-y-2 px-4 whitespace-nowrap">
                    <thead className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Position</th>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Date Terminated</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((emp) => (
                            <tr key={emp.id} className={`rounded-lg overflow-hidden transition-all duration-200 group hover:shadow-md hover:scale-[1.01]
                                ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-white'}`}>

                                <td className="px-4 py-4 rounded-l-lg border-l-4 border-transparent hover:border-red-500">
                                    <div className="flex items-center">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm grayscale opacity-70
                                            ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-500 line-through decoration-red-500/50">{emp.name}</div>
                                            <div className="text-xs text-red-500 font-medium">Terminated</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-gray-500">{emp.role}</td>
                                <td className="px-4 py-4 font-mono text-xs text-gray-400">{emp.id}</td>
                                <td className="px-4 py-4 text-gray-500 text-xs">
                                    {new Date().toLocaleDateString()}
                                </td>

                                <td className="px-4 py-4 rounded-r-lg text-right">
                                    <button
                                        onClick={() => onRestore && onRestore(emp)}
                                        className="flex items-center gap-1ML-auto ml-auto font-medium text-green-600 hover:text-green-700 transition-colors text-xs px-3 py-1.5 rounded hover:bg-green-50 border border-transparent hover:border-green-200"
                                        title="Restore Employee"
                                    >
                                        <RotateCcw size={14} />
                                        Restore
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {employees.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        No terminated employees found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerminatedEmployees;
