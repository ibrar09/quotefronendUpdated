import React, { useState, useEffect } from 'react';
import {
    Clock, Calendar, Briefcase, MapPin,
    CheckCircle, TrendingUp, User,
    MessageSquare, Pause, ChevronRight, Zap, LogOut
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, markAttendance, updateLiveLocation } from '../services/portal.service';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '../../../config/api';

const FieldDashboard = () => {
    const { darkMode } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        userName: '',
        employeeName: 'User',
        designation: '',
        stats: {
            attendanceStatus: 'Absent',
            pendingJobs: 0,
            unreadMessages: 0,
            leaveBalance: 0
        }
    });

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/login');
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setUserData(data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Attendance Handler
    const handleAttendance = async (type, isOvertime = false) => {
        const loadingToast = toast.loading(type === 'CHECK_IN' ? 'Starting shift...' : 'Stopping shift...');
        try {
            // Get Location
            let location = null;
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                } catch (e) {
                    console.warn("Location failed", e);
                    toast.error("Location access required for attendance", { id: loadingToast });
                    return;
                }
            }

            const res = await markAttendance({
                type,
                location,
                is_overtime: isOvertime
            });

            if (res.attendance) {
                toast.success(res.message, { id: loadingToast });
                // Refresh Stats
                const data = await getDashboardStats();
                setUserData(data);
            } else {
                toast.error("Failed to update status", { id: loadingToast });
            }
        } catch (error) {
            console.error("Attendance Error", error);
            toast.error(error.response?.data?.message || "Error updating attendance", { id: loadingToast });
        }
    };

    const QuickAction = ({ icon: Icon, label, color, onClick }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95
            ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'}`}
        >
            <div className={`p-3 rounded-full ${color} text-white shadow-md`}>
                <Icon size={20} />
            </div>
            <span className="text-xs font-bold text-gray-500">{label}</span>
        </button>
    );

    const StatCard = ({ label, value, icon: Icon, color, onClick }) => (
        <div
            onClick={onClick}
            className={`relative overflow-hidden p-4 rounded-2xl flex-1 flex flex-col items-center justify-center gap-1 border transition-transform hover:scale-[1.02] cursor-pointer active:scale-95
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
        >
            <div className={`absolute top-0 right-0 p-2 opacity-10 ${color.text}`}>
                <Icon size={40} />
            </div>
            <h3 className={`text-2xl font-black ${color.text}`}>{value}</h3>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-[fadeIn_0.4s_ease-out] pb-20">
            {/* Header Section */}
            <div className={`p-6 pb-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden
                 ${darkMode ? 'bg-gray-900 shadow-black/40' : 'bg-white shadow-blue-100/50'}`}>

                {/* Background Decor */}
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-[20%] left-[-20px] w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex justify-between items-center mb-6">
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                            {currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                        <h1 className="text-2xl font-black tracking-tight text-black dark:text-black">
                            {userData.employeeName}
                        </h1>
                        <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">{userData.designation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLogout}
                            className={`p-2.5 rounded-full border transition-all active:scale-95
                                ${darkMode ? 'bg-red-600 hover:bg-red-700 border-red-700' : 'bg-red-500 hover:bg-red-600 border-red-400'} text-white`}
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                        <div
                            onClick={() => navigate('/user/profile')}
                            className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-700 shadow-lg overflow-hidden cursor-pointer active:scale-95 transition-transform bg-gray-200"
                        >
                            <img
                                src={userData.avatar ? `${userData.avatar.startsWith('http') ? '' : API_BASE_URL}${userData.avatar}` : "https://ui-avatars.com/api/?name=" + userData.employeeName.replace(' ', '+')}
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Shift Status Card (Glassmorphism) */}
                {/* Shift Status Card (Glassmorphism) */}
                <div className={`p-5 rounded-3xl relative overflow-hidden transition-all
                    ${darkMode
                        ? 'bg-gradient-to-br from-blue-900/80 to-indigo-900/80 border border-white/10'
                        : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'}`}
                >
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="flex h-2 w-2 relative">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${userData.stats.attendanceStatus === 'Present' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${userData.stats.attendanceStatus === 'Present' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </span>
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">
                                        {userData.stats.attendanceStatus === 'Present'
                                            ? (userData.stats.attendanceDetails?.tag === 'OVERTIME' ? 'Overtime Active' : 'Shift Active')
                                            : 'Not Clocked In'}
                                    </p>
                                </div>
                                <h2 className="text-3xl font-mono font-bold tracking-tighter">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </h2>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {userData.stats.attendanceStatus === 'Present' ? (
                                    <button
                                        onClick={() => handleAttendance('CHECK_OUT')}
                                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                                    >
                                        <Pause size={16} fill="white" />
                                        STOP {userData.stats.attendanceDetails?.tag === 'OVERTIME' ? 'OT' : 'SHIFT'}
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleAttendance('CHECK_IN', false)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                                        >
                                            <Zap size={16} fill="white" />
                                            START SHIFT
                                        </button>
                                        <button
                                            onClick={() => handleAttendance('CHECK_IN', true)}
                                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                                        >
                                            <Clock size={16} />
                                            START OVERTIME
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 relative z-10">
                            <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 border border-white/5">
                                <MapPin size={14} className="text-blue-200" />
                                <span className="text-xs font-medium truncate opacity-90">
                                    {userData.stats.attendanceDetails?.tag === 'OVERTIME' ? 'Overtime Mode' : 'Standard Shift'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Body */}
            <div className="px-5 -mt-4 relative z-20 space-y-6">

                {/* Visual Stats Grid */}
                <div className="flex gap-4">
                    <StatCard
                        label="Pending"
                        value={userData.stats.pendingJobs}
                        icon={Briefcase}
                        color={{ text: 'text-blue-500' }}
                        onClick={() => navigate('/user/jobs')}
                    />
                    <StatCard
                        label="Messages"
                        value={userData.stats.unreadMessages}
                        icon={MessageSquare}
                        color={{ text: 'text-purple-500' }}
                        onClick={() => navigate('/user/chat')}
                    />
                    <StatCard
                        label="Leave"
                        value={userData.stats.leaveBalance}
                        icon={Calendar}
                        color={{ text: 'text-emerald-500' }}
                        onClick={() => navigate('/user/hr/services')}
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-3 ml-1 uppercase tracking-wider">Quick Actions</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <QuickAction icon={Briefcase} label="Jobs" color="bg-blue-500" onClick={() => navigate('/user/jobs')} />
                        <QuickAction icon={MessageSquare} label="Chat" color="bg-purple-500" onClick={() => navigate('/user/chat')} />
                        <QuickAction
                            icon={Zap}
                            label="Sync"
                            color="bg-orange-500"
                            onClick={() => {
                                setLoading(true);
                                window.location.reload(); // Simple sync: Reload to fetch fresh data
                                // Or better: refetch fetchStats() if exposed
                            }}
                        />
                        <QuickAction icon={User} label="Profile" color="bg-gray-500" onClick={() => navigate('/user/profile')} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FieldDashboard;
