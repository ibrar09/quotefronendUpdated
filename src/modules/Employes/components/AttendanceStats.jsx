import React from 'react';
import { Clock, Users, Navigation, AlertCircle } from 'lucide-react';

const StatCard = ({ darkMode, title, value, icon: Icon, colorClass, subText }) => (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-1 duration-300 group
        ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
                <p className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
            </div>
            <div className={`p-3 rounded-xl transition-colors ${colorClass.bg} ${colorClass.text} group-hover:scale-110`}>
                <Icon size={24} />
            </div>
        </div>
        {subText && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
            {subText}
        </p>}
    </div>
);

const AttendanceStats = ({ darkMode, viewMode, data }) => {
    const totalEmployees = data.length;
    const currentData = data;
    const overtimeCount = currentData.filter(e => e.otMinutes > 0).length;
    const totalOtMinutes = currentData.reduce((acc, e) => acc + (e.otMinutes || 0), 0);

    // Calculate Today's Shift completion
    // Assuming full shift is 480 minutes (8 hours)
    const shiftProgress = Math.round((currentData.filter(e => e.regMinutes >= 480).length / Math.max(1, totalEmployees)) * 100);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-[fadeIn_0.5s_ease-out]">
            <StatCard
                darkMode={darkMode}
                title="Total Employees" value={totalEmployees} icon={Users}
                colorClass={{ bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' }}
                subText={viewMode === 'live' ? "Active Workforce" : "Records Found"}
            />
            <StatCard
                darkMode={darkMode}
                title="Today's Shift" value={`${shiftProgress}%`} icon={Clock}
                colorClass={{ bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400' }}
                subText="Shift Completion Progress"
            />
            <StatCard
                darkMode={darkMode}
                title="Live Tracking" value={currentData.filter(e => e.onlineStatus === 'Online').length} icon={Navigation}
                colorClass={{ bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400' }}
                subText="Currently Moving/Active"
            />
            <StatCard
                darkMode={darkMode}
                title="Total Overtime" value={`${Math.floor(totalOtMinutes / 60)}h ${totalOtMinutes % 60}m`} icon={Clock}
                colorClass={{ bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400' }}
                subText={`${overtimeCount} Technicians on OT duty`}
            />
        </div>
    );
};

export default AttendanceStats;
