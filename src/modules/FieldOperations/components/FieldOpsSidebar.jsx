import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    MessageSquare,
    Calendar,
    Settings,
    PlusCircle,
    LogOut,
    X,
    ChevronLeft,
    ChevronRight,
    MapPin,
    FileText,
    Globe,
    LayoutGrid
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

const FieldOpsSidebar = ({ isOpen, onClose }) => {
    const { darkMode } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    // Modern Classic Navigation Items
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/field-ops' },
        { icon: PlusCircle, label: 'Assign Work', path: '/field-ops/assign' },
        { icon: Users, label: 'Technicians', path: '/field-ops/technicians' },
        { icon: MessageSquare, label: 'Communication', path: '/field-ops/messages' },
        { icon: Calendar, label: 'Schedule', path: '/field-ops/schedule' },
        { icon: Settings, label: 'Settings', path: '/field-ops/settings' },
    ];

    const sidebarClasses = `
        flex flex-col h-screen transition-all duration-300 ease-in-out z-50 relative
        border-r border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl shadow-gray-200/50'}
    `;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={sidebarClasses}>

                {/* 1. Header & Logo */}
                <div className="h-24 flex items-center justify-between px-6 mb-2">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                        {/* Premium Logo Icon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Briefcase size={20} strokeWidth={2} />
                        </div>
                        {/* Classic Typography Logo */}
                        <div className="flex flex-col">
                            <span className={`font-heading text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                FieldOps
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                                Manager
                            </span>
                        </div>
                    </div>

                    {/* Mobile Close */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleCollapse}
                        className={`hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-md text-gray-500 hover:text-indigo-600 transition-colors z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* 2. Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">

                    <div className={`px-2 mb-4 text-[11px] uppercase tracking-widest font-bold text-gray-400 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        Menu
                    </div>

                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/field-ops' && location.pathname.startsWith(item.path));

                        return (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                onClick={() => onClose && onClose()}
                                className={`
                                    relative flex items-center px-3 py-3.5 rounded-xl transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                                    ${darkMode && isActive ? 'bg-indigo-900/20 text-indigo-300' : ''}
                                    ${darkMode && !isActive ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : ''}
                                `}
                            >
                                {/* Active Indicator Strip */}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
                                )}

                                <item.icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`
                                        transition-colors duration-300
                                        ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}
                                        ${darkMode && isActive ? 'text-indigo-400' : ''}
                                        ${darkMode && !isActive ? 'text-slate-500 group-hover:text-slate-300' : ''}
                                    `}
                                />

                                <span className={`
                                    ml-3 font-medium text-[15px] tracking-wide whitespace-nowrap transition-all duration-300
                                    ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}
                                `}>
                                    {item.label}
                                </span>

                                {/* Tooltip for Collapsed Mode */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* 3. Module Switcher (Quick Access) */}
                <div className={`p-4 mx-4 mt-2 mb-2 rounded-2xl border bg-slate-50 border-gray-100 hover:bg-slate-100 transition-all cursor-pointer group ${isCollapsed ? 'hidden' : 'block'}`}
                    onClick={() => navigate('/selection')}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LayoutGrid size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Back to</span>
                            <span className="text-xs font-black text-slate-800">Switch Module</span>
                        </div>
                    </div>
                </div>

                {/* 4. Footer */}
                <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className={`
                        w-full flex items-center p-3 rounded-xl transition-colors duration-200
                        ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'}
                        ${isCollapsed ? 'justify-center' : ''}
                    `}>
                        <LogOut size={20} />
                        <span className={`ml-3 font-medium text-sm transition-all ${isCollapsed ? 'hidden' : 'block'}`}>
                            Log Out
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default FieldOpsSidebar;
