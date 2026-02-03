import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    FileText,
    Zap,
    Users,
    Layout,
    ArrowRight,
    LogOut,
    Shield,
    ChevronRight,
    LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';

const ModuleSelection = () => {
    const { user, logout, hasPermission } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    const modules = [
        {
            id: 'quotation',
            title: 'Quotations',
            subtitle: 'Estimates & Invoicing',
            icon: FileText,
            color: 'blue',
            bg: 'bg-blue-600',
            path: '/',
            permission: 'view_quote'
        },
        {
            id: 'field_ops',
            title: 'Field Operations',
            subtitle: 'Jobs & Scheduling',
            icon: Zap,
            color: 'orange',
            bg: 'bg-orange-500',
            path: '/field-ops',
            permission: 'view_field_ops'
        },
        {
            id: 'hr',
            title: 'Human Resources',
            subtitle: 'Staff & Payroll',
            icon: Users,
            color: 'emerald',
            bg: 'bg-emerald-500',
            path: '/employes',
            permission: 'view_employees'
        },
        {
            id: 'user_portal',
            title: 'User Portal',
            subtitle: 'Tasks & Updates',
            icon: Layout,
            color: 'violet',
            bg: 'bg-violet-600',
            path: '/user/dashboard',

            permission: 'access_portal'
        }
    ];

    const visibleModules = modules.filter(mod => {
        // Check specific permission using centralized hasPermission logic
        if (mod.permission && hasPermission(mod.permission)) return true;

        // Fallback for User Portal (any authenticated user can see it as long as they aren't admin who already sees everything)
        if (mod.id === 'user_portal' && user) return true;

        return false;
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 select-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
            </div>

            <div className="w-full max-w-7xl z-10 flex flex-col items-center">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 font-bold text-xs uppercase tracking-widest mb-6">
                        <LayoutGrid size={12} /> Unified Management System
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.username || 'User'}</span>
                    </h1>
                    <p className={`text-lg md:text-xl font-medium max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Choose your dedicated workspace to start managing your operations efficiently.
                    </p>
                </motion.div>

                {/* Horizontal Module Bar (Menu Style) */}
                <div className="w-full flex flex-col items-center gap-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`w-full max-w-6xl p-3 md:p-4 rounded-[3rem] border-2 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row gap-4
                            ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100/50'}
                        `}
                    >
                        {visibleModules.map((mod, idx) => (
                            <motion.div
                                key={mod.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(mod.path)}
                                className={`flex-1 group relative cursor-pointer overflow-hidden rounded-[2.2rem] p-6 transition-all duration-300
                                    ${darkMode ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50'}
                                `}
                            >
                                {/* Active Glow (Hidden by default, shows on hover) */}
                                <div className={`absolute -inset-2 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl ${mod.bg}`}></div>

                                <div className="relative flex items-center md:flex-col lg:flex-row gap-5">
                                    {/* Icon Box */}
                                    <div className={`w-14 h-14 md:w-16 md:h-16 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:rotate-12 ${mod.bg}`}>
                                        <mod.icon size={28} />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex flex-col text-left md:text-center lg:text-left">
                                        <h3 className="text-xl font-black tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors">
                                            {mod.title}
                                        </h3>
                                        <p className={`text-xs font-bold uppercase tracking-widest opacity-60 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {mod.subtitle}
                                        </p>
                                    </div>

                                    {/* Indicator */}
                                    <div className="ml-auto md:hidden lg:flex opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                        <ChevronRight size={20} className="text-blue-600" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {visibleModules.length === 0 && (
                            <div className="w-full py-12 text-center text-slate-500 font-bold">
                                No authorized modules found. Contact your IT administrator.
                            </div>
                        )}
                    </motion.div>

                    {/* Action Bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-4 mt-4"
                    >
                        <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Authenticated as</span>
                            <span className="text-sm font-black text-blue-600">{user?.role || 'Guest'}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-bold text-sm transition-all border
                                ${darkMode
                                    ? 'bg-slate-900 border-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                    : 'bg-white border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100'}
                            `}
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Subtle Footer */}
            <div className="mt-auto py-10 opacity-30 flex items-center gap-4 select-none">
                <div className="h-px w-12 bg-current"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Maaj Enterprise 2026</span>
                <div className="h-px w-12 bg-current"></div>
            </div>
        </div>
    );
};

export default ModuleSelection;
