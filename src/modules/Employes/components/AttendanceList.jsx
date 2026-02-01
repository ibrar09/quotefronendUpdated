import React, { useState } from 'react';
import { Search, MapPin, Clock, ChevronRight, Maximize } from 'lucide-react';

const AttendanceList = ({
    darkMode,
    viewMode,
    data,
    expandedId,
    setExpandedId,
    onLocationClick
}) => {
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter Logic
    const filteredTeam = data.filter(employee => {
        const matchesStatus = filter === 'All' || employee.status === filter;
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.role.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className={`lg:col-span-2 space-y-6 ${viewMode === 'history' ? 'lg:col-span-3' : ''}`}>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 px-2">
                <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{viewMode === 'live' ? "Today's Activity" : "Historical Records"}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        {filteredTeam.length}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className={`flex items-center px-3 py-2 rounded-lg border text-sm focus-within:ring-2 ring-blue-500/20 transition-all shadow-sm
                            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none w-24 md:w-48 placeholder-gray-500 text-gray-700 dark:text-gray-200 text-sm"
                        />
                    </div>
                    <select onChange={(e) => setFilter(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer font-medium hover:bg-opacity-80 transition-colors shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
                        <option value="All">All Status</option>
                        <option value="PRESENT">🟢 Present</option>
                        <option value="LATE">🟠 Late</option>
                        <option value="ABSENT">🔴 Absent</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className={`rounded-xl shadow-sm border overflow-hidden
                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#F9F7F1] border-gray-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-separate border-spacing-y-2 px-4 whitespace-nowrap">
                        <thead className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Check-In</th>
                                <th className="px-4 py-3">Check-Out</th>
                                <th className="px-4 py-3">Regular Shift</th>
                                <th className="px-4 py-3">Overtime (OT)</th>
                                <th className="px-4 py-3">Total Hrs</th>
                                <th className="px-4 py-3 text-right">Location</th>
                                <th className="px-4 py-3 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeam.map((employee) => {
                                const isExpanded = expandedId === employee.id;
                                return (
                                    <React.Fragment key={employee.id}>
                                        <tr
                                            onClick={() => {
                                                const newExpandedId = isExpanded ? null : employee.id;
                                                setExpandedId(newExpandedId);
                                                if (newExpandedId && employee.lat && onLocationClick) {
                                                    onLocationClick(employee);
                                                }
                                            }}
                                            className={`rounded-lg overflow-hidden transition-all duration-200 group hover:shadow-md cursor-pointer
                                            ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-blue-50/10'}
                                            ${isExpanded ? 'border-l-4 border-blue-500 shadow-lg scale-[1.01]' : 'border-l-4 border-transparent'}`}
                                        >
                                            <td className="px-4 py-4 rounded-l-lg">
                                                <div className="flex items-center">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm flex-shrink-0 relative
                                                        ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                                        {employee.name.charAt(0)}
                                                        {viewMode === 'live' && (
                                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 rounded-full ${darkMode ? 'border-gray-700' : 'border-white'}
                                                                ${employee.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{employee.name}</div>
                                                        <div className="text-xs text-gray-500">{employee.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-white flex-shrink-0
                                                        ${employee.status === 'PRESENT' ? 'bg-green-500' :
                                                            employee.status === 'LATE' ? 'bg-orange-500' : 'bg-red-500'}`}
                                                    />
                                                    <span className="text-xs font-bold uppercase tracking-tight">{employee.status}</span>
                                                    {employee.otMinutes > 0 && (
                                                        <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black rounded shadow-sm uppercase animate-pulse">
                                                            Overtime
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 font-mono text-gray-500 text-xs text-center">
                                                {employee.timeIn !== '-' ? (
                                                    <span className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                                        {employee.timeIn}
                                                    </span>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="px-4 py-4 font-mono text-gray-500 text-xs text-center">
                                                {employee.timeOut !== '-' ? (
                                                    <span className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                                        {employee.timeOut}
                                                    </span>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="px-4 py-4 min-w-[120px]">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                                                        <span>Regular</span>
                                                        <span>{Math.floor(employee.regMinutes / 60)}h {employee.regMinutes % 60}m</span>
                                                    </div>
                                                    <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-full h-2 overflow-hidden border border-blue-100 dark:border-blue-800">
                                                        <div className="bg-blue-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (employee.regMinutes / 480) * 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 min-w-[120px]">
                                                {employee.otMinutes > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between items-center text-[10px] font-bold text-orange-600 uppercase tracking-tight">
                                                            <span className="flex items-center gap-1"><Clock size={10} /> Overtime</span>
                                                            <span>{Math.floor(employee.otMinutes / 60)}h {employee.otMinutes % 60}m</span>
                                                        </div>
                                                        <div className="w-full bg-orange-50 dark:bg-orange-900/20 rounded-full h-2 overflow-hidden border border-orange-100 dark:border-orange-800">
                                                            <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (employee.otMinutes / 120) * 100)}%` }}></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-xs italic flex items-center gap-1">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-sm font-bold shadow-sm
                                                    ${employee.otMinutes > 0 ? 'bg-orange-600 text-white' : (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800')}`}>
                                                    {Math.floor(employee.totalMinutes / 60)}h {employee.totalMinutes % 60}m
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {employee.location !== '-' ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-[10px] font-bold">
                                                            <MapPin size={12} className={employee.onlineStatus === 'Online' ? 'text-green-500 animate-bounce' : 'text-blue-500'} />
                                                            <span className="truncate max-w-[120px]">{employee.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${employee.onlineStatus === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest">{employee.onlineStatus === 'Online' ? 'Live Moving' : 'Last Seen'}</span>
                                                        </div>
                                                    </div>
                                                ) : <span className="text-gray-400 text-xs italic">Location Hidden</span>}
                                            </td>
                                            <td className="px-4 py-4 rounded-r-lg text-center">
                                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ChevronRight size={16} className="text-gray-400" />
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Slide Down Section */}
                                        {isExpanded && (
                                            <tr className="animate-[fadeIn_0.3s_ease-out]">
                                                <td colSpan="9" className="p-0">
                                                    <div className={`mx-4 mb-4 rounded-b-xl border-x border-b p-4 text-sm
                                                        ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                                        <div className="flex gap-8">
                                                            {/* Timeline */}
                                                            <div className="flex-1">
                                                                <h4 className={`text-xs font-bold uppercase mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Activity Log</h4>
                                                                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-600">
                                                                    {employee.logs.map((log, idx) => (
                                                                        <div key={idx} className="relative pl-6">
                                                                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 
                                                                                ${log.type === 'check-in' ? 'border-green-500 bg-green-100' :
                                                                                    log.type === 'check-out' ? 'border-red-500 bg-red-100' : 'border-blue-500 bg-blue-100'}`}></div>
                                                                            <div className="flex justify-between items-start">
                                                                                <div>
                                                                                    <p className={`font-semibold text-xs ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{log.action}</p>
                                                                                    <p className="text-[10px] text-gray-500">{log.location}</p>
                                                                                </div>
                                                                                <span className="font-mono text-xs text-gray-500">{log.time}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {/* Selfie Column */}
                                                            {employee.photo && (
                                                                <div className="w-32 flex-shrink-0">
                                                                    <h4 className={`text-xs font-bold uppercase mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Verification</h4>
                                                                    <div className="relative group/photo">
                                                                        <img
                                                                            src={employee.photo}
                                                                            alt="Check-in verification"
                                                                            className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                                            <Maximize size={20} className="text-white" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceList;
