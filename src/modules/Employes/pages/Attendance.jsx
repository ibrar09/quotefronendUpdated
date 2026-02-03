import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Clock, Calendar, Download, PenTool, Layers, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Hook
import { useAttendance } from '../hooks/useAttendance';

// Sub-Components
import AttendanceStats from '../components/AttendanceStats';
import AttendanceList from '../components/AttendanceList';
import AttendanceMap from '../components/AttendanceMap';
import ManualEntryModal from '../components/ManualEntryModal';

const Attendance = ({ employees = [] }) => {
    const { darkMode } = useTheme();
    const [currentTime, setCurrentTime] = useState(new Date());

    // UI State
    const [viewMode, setViewMode] = useState('live'); // 'live' | 'history'
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'map'
    const [showStats, setShowStats] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Map State
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // History Filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Manual Entry State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [manualEntry, setManualEntry] = useState({
        employee_id: '',
        type: 'CHECK_IN',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        status: 'PRESENT',
        location: '',
        is_overtime: false
    });

    // Data Hook
    const {
        isLoading,
        teamAttendance,
        historyData,
        fetchHistoryData,
        submitManualEntry
    } = useAttendance(viewMode, selectedMonth, selectedYear);

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Handlers
    const handleManualSubmit = async () => {
        if (!manualEntry.employee_id) {
            toast.error("Please select a valid employee from the list");
            return;
        }
        if (!manualEntry.date || !manualEntry.time) {
            toast.error("Please provide both date and time");
            return;
        }

        const success = await submitManualEntry(manualEntry);
        if (success) {
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
        }
    };

    const currentData = viewMode === 'live' ? teamAttendance : historyData;

    return (
        <div className="h-full flex flex-col overflow-y-auto pb-10 max-w-7xl mx-auto animate-[fadeIn_0.4s_ease-out]">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 px-2 pt-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-white to-gray-400' : 'from-gray-900 to-gray-600'}`}>
                            {viewMode === 'live' ? 'Attendance Monitor' : 'Attendance History'}
                        </h2>
                        {viewMode === 'history' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded uppercase tracking-wide">
                                Archive Mode
                            </span>
                        )}
                    </div>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {viewMode === 'live' ? 'Real-time workforce tracking & insights' : 'Reviewing past attendance records'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Mode Toggle (Live/History) */}
                    <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <button
                            onClick={() => setViewMode('live')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
                            ${viewMode === 'live'
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            Live
                        </button>
                        <button
                            onClick={() => setViewMode('history')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
                            ${viewMode === 'history'
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            History
                        </button>
                    </div>

                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                    {/* Manual Entry Button */}
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors shadow-sm
                        ${darkMode ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-100'}`}
                    >
                        <PenTool size={16} />
                        <span className="hidden md:inline">Manual Entry</span>
                    </button>

                    {/* Time Display or Date Picker */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm backdrop-blur-sm
                        ${darkMode ? 'bg-gray-800/80 border-gray-700 text-gray-300' : 'bg-white/90 border-gray-200 text-gray-700'}`}>

                        {viewMode === 'live' ? (
                            <>
                                <Clock size={18} className="text-blue-500 animate-pulse" />
                                <span className="text-xl font-mono font-bold tracking-widest">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className={`px-2 py-1 rounded-lg text-sm font-bold border-0 outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className={`px-2 py-1 rounded-lg text-sm font-bold border-0 outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    {[2024, 2025, 2026].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={fetchHistoryData}
                                    className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Sub-Tabs (Only for Live) */}
            {viewMode === 'live' && (
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all shadow-sm
                            ${activeTab === 'list'
                                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                                    : (darkMode ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}`}
                        >
                            Active List
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'list' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                {teamAttendance.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all shadow-sm
                            ${activeTab === 'map'
                                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                                    : (darkMode ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}`}
                        >
                            Live Map
                            <div className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'map' ? 'bg-white' : 'bg-green-500'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${!showStats ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <Layers size={18} />
                            Insights
                        </button>
                        <button className={`p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}>
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Section */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showStats ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
                <AttendanceStats
                    darkMode={darkMode}
                    viewMode={viewMode}
                    data={currentData}
                />
            </div>

            {/* Main Content Area */}
            <div className="min-h-[500px]">
                {viewMode === 'history' ? (
                    <AttendanceList
                        darkMode={darkMode}
                        viewMode={viewMode}
                        data={historyData}
                        expandedId={expandedId}
                        setExpandedId={setExpandedId}
                        fullWidth={true}
                    />
                ) : (
                    activeTab === 'list' ? (
                        <AttendanceList
                            darkMode={darkMode}
                            viewMode={viewMode}
                            data={teamAttendance}
                            expandedId={expandedId}
                            setExpandedId={setExpandedId}
                            onLocationClick={(emp) => {
                                setSelectedEmployee(emp);
                                setActiveTab('map');
                            }}
                            fullWidth={true}
                        />
                    ) : (
                        <AttendanceMap
                            darkMode={darkMode}
                            data={teamAttendance}
                            selectedEmployee={selectedEmployee}
                            fullWidth={true}
                        />
                    )
                )}
            </div>

            {/* Modal */}
            {isManualModalOpen && (
                <ManualEntryModal
                    darkMode={darkMode}
                    setIsManualModalOpen={setIsManualModalOpen}
                    employeeSearch={employeeSearch}
                    setEmployeeSearch={setEmployeeSearch}
                    manualEntry={manualEntry}
                    setManualEntry={setManualEntry}
                    employees={employees}
                    handleManualSubmit={handleManualSubmit}
                />
            )}
        </div>
    );
};

export default Attendance;
