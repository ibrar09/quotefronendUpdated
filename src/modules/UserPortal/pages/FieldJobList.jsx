import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle2, Clock, AlertCircle, ChevronRight, Briefcase, Filter, Search } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../../config/api';

const FieldJobList = () => {
    const { darkMode } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, in-progress, done
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, [user]);

    // Standard URL Resolver
    const resolveUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_BASE_URL}${cleanPath}`;
    };

    const fetchJobs = async () => {
        if (!user || !user.employee_id) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/api/employees/${user.employee_id}/jobs`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setJobs(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'DONE':
                return {
                    label: 'Completed',
                    icon: CheckCircle2,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500',
                    gradient: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
                    shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                };
            case 'IN_PROGRESS':
                return {
                    label: 'In Progress',
                    icon: Clock,
                    color: 'text-blue-500',
                    bg: 'bg-blue-500',
                    gradient: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
                    shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                };
            case 'NOT_STARTED':
                return {
                    label: 'Pending',
                    icon: AlertCircle,
                    color: 'text-orange-500',
                    bg: 'bg-orange-500',
                    gradient: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
                    shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.15)]'
                };
            default:
                return {
                    label: 'Unknown',
                    icon: AlertCircle,
                    color: 'text-gray-500',
                    bg: 'bg-gray-500',
                    gradient: 'bg-gray-100/50 text-gray-500 border-gray-200',
                    shadow: ''
                };
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'pending' ? job.status === 'NOT_STARTED' :
                    filter === 'in-progress' ? job.status === 'IN_PROGRESS' :
                        filter === 'done' ? job.status === 'DONE' : true;

        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.job_number && job.job_number.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pb-24 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

            {/* Sticky Header with Glassmorphism */}
            <div className={`sticky top-0 z-30 px-4 pt-6 pb-4 transition-all duration-300 backdrop-blur-xl border-b 
                ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                            My Assignments
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-500 text-xs font-medium uppercase tracking-wider"
                        >
                            {filteredJobs.length} Active Tasks
                        </motion.p>
                    </div>
                    <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                        <Filter size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all
                            ${darkMode
                                ? 'bg-gray-800 text-white focus:bg-gray-700'
                                : 'bg-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-sm'}`}
                    />
                </div>

                {/* Segmented Filter Control */}
                <div className={`p-1 rounded-2xl flex overflow-x-auto no-scrollbar relative ${darkMode ? 'bg-gray-800' : 'bg-gray-200/50'}`}>
                    {['all', 'pending', 'in-progress', 'done'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`flex-1 min-w-[80px] relative py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide z-10 transition-colors duration-300
                                ${filter === tab
                                    ? (darkMode ? 'text-white' : 'text-blue-600')
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            {tab === 'all' ? 'All' : tab.replace('-', ' ')}
                            {filter === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className={`absolute inset-0 rounded-xl shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                                    style={{ zIndex: -1 }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job List */}
            <div className="px-4 mt-4 space-y-4">
                <AnimatePresence mode='popLayout'>
                    {filteredJobs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex flex-col items-center justify-center py-12 rounded-3xl border-2 border-dashed
                                ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}
                        >
                            <div className={`p-4 rounded-full mb-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                <Briefcase size={32} className="text-gray-400" />
                            </div>
                            <h3 className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>No Jobs Found</h3>
                            <p className="text-sm text-gray-500">Try adjusting your filters</p>
                        </motion.div>
                    ) : (
                        filteredJobs.map((job, index) => {
                            const status = getStatusInfo(job.status);
                            const Icon = status.icon;

                            return (
                                <motion.div
                                    key={job.assignment_id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/user/jobs/${job.assignment_id}`)}
                                    className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 active:scale-[0.98] cursor-pointer
                                        ${darkMode
                                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                            : 'bg-white border-gray-100 hover:border-blue-300/50 hover:shadow-xl hover:shadow-blue-500/5'}`}
                                >
                                    {/* Status Bar Indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.bg}`} />

                                    <div className="p-5 pl-7">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                                                         ${darkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                        #{job.job_number || 'N/A'}
                                                    </span>
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${status.gradient} ${status.shadow}`}>
                                                        <Icon size={12} strokeWidth={3} />
                                                        {status.label}
                                                    </div>
                                                </div>
                                                <h3 className={`text-lg font-bold leading-snug mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {job.title}
                                                </h3>
                                            </div>
                                            <div className={`p-2 rounded-xl transition-colors
                                                ${darkMode ? 'group-hover:bg-gray-700' : 'group-hover:bg-blue-50'} `}>
                                                <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-y-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin size={15} className="text-gray-400 shrink-0" />
                                                <span className={`truncate text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {job.location || job.brand || 'No Location'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={15} className="text-gray-400 shrink-0" />
                                                <span className={`truncate text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {job.due_date ? new Date(job.due_date).toLocaleDateString() : 'No Due Date'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FieldJobList;
