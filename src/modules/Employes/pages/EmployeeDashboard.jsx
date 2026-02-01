import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../config/api';
import { useTheme } from '../../../context/ThemeContext';
import {
    Users, Clock, AlertTriangle, FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';


const EmployeeDashboard = () => {
    const { darkMode } = useTheme();
    const [statsData, setStatsData] = useState({
        totalEmployees: 0,
        pendingLeaves: 0,
        pendingExpenses: 0,
        onLeaveToday: 0,
        expiringDocuments: [],
        weeklyAttendance: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/hr-mgmt/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStatsData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    // Mock Data no longer needed for charts, using statsData.weeklyAttendance

    const stats = [
        { title: 'Total Employees', value: statsData.totalEmployees || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', change: 'Active' },
        { title: 'On Leave Today', value: statsData.onLeaveToday || 0, icon: () => <Clock size={24} className="text-orange-500" />, color: 'text-orange-500', bg: 'bg-orange-50', change: 'Away' },
        { title: 'Pending Leaves', value: statsData.pendingLeaves || 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', change: 'To Review' },
        { title: 'Pending Expenses', value: statsData.pendingExpenses || 0, icon: FileText, color: 'text-yellow-500', bg: 'bg-yellow-50', change: 'Claims' },
    ];

    const StatCard = ({ title, value, icon: Icon, color, bg, change }) => (
        <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : bg}`}>
                    {typeof Icon === 'function' ? Icon() : <Icon size={24} className={color} />}
                </div>
                {change && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${color.includes('red') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {change}
                    </span>
                )}
            </div>
            <h3 className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{loading ? '...' : value}</h3>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out] overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>HR Dashboard</h1>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Overview of your organization's workforce and performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Charts & Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Attendance Chart (2 Cols) */}
                <div className={`col-span-1 lg:col-span-2 p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekly Attendance</h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Present</span>
                            <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-red-400"></div> Absent</span>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData.weeklyAttendance || []} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: darkMode ? '#1F2937' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: darkMode ? '#fff' : '#111' }}
                                />
                                <Bar dataKey="present" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="leave" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Important Notices / Expiry (1 Col) */}
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Important Notices</h3>
                        <button className="text-blue-500 text-sm hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {statsData.expiringDocuments && statsData.expiringDocuments.length > 0 ? (
                            statsData.expiringDocuments.map((item, i) => (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                    <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 
                                    ${item.type === 'critical' ? 'bg-red-100 text-red-500' :
                                            item.type === 'warning' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'}`}>
                                        {item.type === 'critical' || item.type === 'warning' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.title}</h4>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                    <span className={`text-xs font-medium whitespace-nowrap ${item.type === 'critical' ? 'text-red-500' : 'text-gray-400'}`}>{item.date}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">No urgent notices.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeDashboard;
