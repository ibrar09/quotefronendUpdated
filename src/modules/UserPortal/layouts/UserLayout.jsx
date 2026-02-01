import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { Home, Briefcase, MapPin, User, Bell, MessageSquare, LayoutGrid } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';

const UserLayout = () => {
    const { darkMode } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadTotal, setUnreadTotal] = useState(0);

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnread = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.get(
                `${API_BASE_URL}/api/messages/unread-total`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setUnreadTotal(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread total:', error);
        }
    };

    // Mobile Bottom Navigation Items
    const navItems = [
        { path: '/user/dashboard', label: 'Home', icon: Home },
        { path: '/user/jobs', label: 'Jobs', icon: Briefcase },
        { path: '/user/hr/services', label: 'HR', icon: LayoutGrid },
        { path: '/user/chat', label: 'Chat', icon: MessageSquare },
        { path: '/user/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Mobile Header */}
            <header className={`sticky top-0 z-30 px-4 py-3 shadow-md flex justify-between items-center
                ${darkMode ? 'bg-gray-800/90 border-b border-gray-700' : 'bg-white/90 border-b border-gray-200'} backdrop-blur-md`}>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/selection')} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <LayoutGrid size={20} className="text-blue-600" />
                    </button>
                    <span className="font-bold text-lg tracking-tight">Field Portal</span>
                </div>
                <button className="p-2 relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Bell size={20} />
                    {/* Reuse unreadTotal for bell too if generic notifications? Or separate system? 
                        User said "notification on the messages". 
                        I'll leave Bell alone (it has hardcoded red dot). */}
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 pb-20 overflow-y-auto w-full max-w-md mx-auto relative">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className={`fixed bottom-0 left-0 right-0 z-40 px-6 py-3 pb-safe border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center max-w-md mx-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 transition-all duration-300 relative
                                    ${isActive
                                        ? 'text-blue-600 scale-110'
                                        : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}`}
                            >
                                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-transparent'}`}>
                                    <item.icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
                                    {/* Unread Badge for Chat */}
                                    {item.label === 'Chat' && unreadTotal > 0 && (
                                        <span className="absolute top-0 right-3 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-gray-800"></span>
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default UserLayout;
