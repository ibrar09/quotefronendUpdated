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
        attendanceRate: 0,
        monthlyExpensesTotal: 0,
        lateCheckins: 0,
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
        { title: 'Total Workforce', value: statsData.totalEmployees || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: 'Organization' },
        { title: 'Attendance Rate', value: `${statsData.attendanceRate || 0}%`, icon: () => <Clock size={24} className="text-emerald-500" />, color: 'text-emerald-600', bg: 'bg-emerald-50', change: 'Daily Goal' },
        { title: 'Monthly Expenses', value: `${statsData.monthlyExpensesTotal?.toLocaleString() || 0} SAR`, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', change: 'Approved' },
        { title: 'Late Check-ins', value: statsData.lateCheckins || 0, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', change: 'Last 7 Days' },
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
                    <div className="h-64 w-full" style={{ minHeight: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%" debounce={300} minWidth={0} minHeight={0}>
                            <BarChart data={statsData.weeklyAttendance || []} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#f1f5f9'} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }}
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#0f172a' : '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid ' + (darkMode ? '#334155' : '#e2e8f0'),
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ fontWeight: 700 }}
                                />
                                <Bar dataKey="present" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={25} name="Present" />
                                <Bar dataKey="absent" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={25} name="Absent" />
                                <Bar dataKey="leave" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={25} name="On Leave" />
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
