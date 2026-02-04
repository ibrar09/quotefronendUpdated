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
import { resolveUrl } from '../../../utils/url';
import { UI_AVATARS_BASE_URL } from '../../../config/constants';
import SelfieCaptureModal from '../components/SelfieCaptureModal';

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

    const [selfieModalOpen, setSelfieModalOpen] = useState(false);
    const [pendingAttendance, setPendingAttendance] = useState({ type: null, isOvertime: false });

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
    const handleAttendance = async (type, isOvertime = false, photo = null) => {
        // If it's a check-in and no photo is provided, open modal first
        if (type === 'CHECK_IN' && !photo) {
            setPendingAttendance({ type, isOvertime });
            setSelfieModalOpen(true);
            return;
        }

        const loadingToast = toast.loading(type === 'CHECK_IN' ? (isOvertime ? 'Starting OT...' : 'Starting shift...') : 'Stopping shift...');
        try {
            // Get Location with Retry Logic
            let location = null;
            if (navigator.geolocation) {
                const getPosition = (options) => {
                    return new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, options);
                    });
                };

                try {
                    // Attempt 1: High Accuracy (GPS) - 20s timeout
                    // console.log("📍 Attempting High Accuracy Location...");
                    const pos = await getPosition({ timeout: 20000, enableHighAccuracy: true });
                    location = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    };
                } catch (err) {
                    // console.warn("❌ High Accuracy Failed:", err);

                    // Attempt 2: Low Accuracy (Network/Cell) - 20s timeout
                    try {
                        // console.log("⚠️ Retrying with Low Accuracy...");
                        toast.loading("GPS weak, trying network location...", { id: loadingToast });
                        const pos = await getPosition({ timeout: 20000, enableHighAccuracy: false });
                        location = {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: pos.coords.accuracy
                        };
                    } catch (finalErr) {
                        console.error("❌ Location Failed Completely:", finalErr);
                        let errorMsg = "Location failed.";
                        if (finalErr.code === 1) errorMsg = "Location permission denied. Please enable it in browser settings.";
                        else if (finalErr.code === 2) errorMsg = "Location unavailable. Check GPS/Network.";
                        else if (finalErr.code === 3) errorMsg = "Location request timed out. Please move outdoors.";

                        toast.error(errorMsg, { id: loadingToast });
                        return; // Block if location fails completely (Business Rule)
                    }
                }
            }

            const res = await markAttendance({
                type,
                location: location ? { lat: location.lat, lng: location.lng } : null,
                accuracy: location?.accuracy,
                image: photo,
                device_info: navigator.userAgent,
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
            className={`relative overflow-hidden p-4 rounded-2xl flex-1 min-w-[100px] flex flex-col items-center justify-center gap-1 border transition-all hover:scale-[1.02] cursor-pointer active:scale-95
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
        >
            <div className={`absolute top-0 right-0 p-2 opacity-10 ${color.text}`}>
                <Icon size={32} />
            </div>
            <h3 className={`text-xl font-black ${color.text}`}>{value}</h3>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold text-center">{label}</p>
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
        <div className="flex flex-col h-full animate-[fadeIn_0.4s_ease-out] pb-24">
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
                            className={`w-14 h-14 rounded-full border-2 shadow-lg overflow-hidden cursor-pointer active:scale-95 transition-all relative
                                ${darkMode ? 'border-gray-700' : 'border-white'}`}
                        >
                            {resolveUrl(userData.avatar) ? (
                                <img
                                    src={resolveUrl(userData.avatar)}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">${userData.employeeName.charAt(0)}</div>`;
                                    }}
                                />
                            ) : (
                                <img
                                    src={`${UI_AVATARS_BASE_URL}?name=${userData.employeeName.replace(' ', '+')}`}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Shift Status Card (Advanced Gradient) */}
                <div className={`p-6 rounded-[2rem] relative overflow-hidden transition-all duration-500
                    ${darkMode
                        ? 'bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border border-white/10 shadow-2xl shadow-black/50'
                        : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-500/40'}`}
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex h-3 w-3 relative">
                                        {userData.stats.attendanceStatus === 'Present' && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-3 w-3 border border-white/20
                                            ${userData.stats.attendanceStatus === 'Present'
                                                ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                                                : 'bg-red-500'}`}></span>
                                    </div>
                                    <p className="text-blue-50 text-[10px] font-black uppercase tracking-widest opacity-90">
                                        {userData.stats.attendanceStatus === 'Present'
                                            ? (userData.stats.attendanceDetails?.tag === 'OVERTIME' ? 'Overtime Active' : 'Shift Active')
                                            : 'System Offline'}
                                    </p>
                                </div>
                                <h2 className="text-3xl font-mono font-bold tracking-tighter">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </h2>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                {userData.stats.attendanceStatus === 'Present' ? (
                                    <button
                                        onClick={() => handleAttendance('CHECK_OUT')}
                                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl font-bold text-xs shadow-lg flex-1 sm:flex-none flex items-center justify-center gap-2 transition-transform active:scale-95"
                                    >
                                        <Pause size={16} fill="white" />
                                        STOP {userData.stats.attendanceDetails?.tag === 'OVERTIME' ? 'OT' : 'SHIFT'}
                                    </button>
                                ) : (
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => handleAttendance('CHECK_IN', false)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold text-xs shadow-lg flex-1 flex items-center justify-center gap-2 transition-transform active:scale-95"
                                        >
                                            <Zap size={16} fill="white" />
                                            SHIFT
                                        </button>
                                        <button
                                            onClick={() => handleAttendance('CHECK_IN', true)}
                                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold text-xs shadow-lg flex-1 flex items-center justify-center gap-2 transition-transform active:scale-95"
                                        >
                                            <Clock size={16} />
                                            OT
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
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
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

            {/* Selfie Verification Modal */}
            <SelfieCaptureModal
                isOpen={selfieModalOpen}
                onClose={() => setSelfieModalOpen(false)}
                title={pendingAttendance?.isOvertime ? "Overtime Verification" : "Shift Verification"}
                onCapture={(photo) => {
                    handleAttendance(pendingAttendance.type, pendingAttendance.isOvertime, photo);
                }}
            />
        </div>
    );
};

export default FieldDashboard;
