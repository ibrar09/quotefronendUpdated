import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Map, List, Plus, Search, RefreshCw,
    MapPin, Briefcase, User, Clock, AlertCircle, ChevronRight, MessageCircle,
    LayoutGrid, Calendar, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FieldOperationsService from '../../../services/FieldOperationsService';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../components/MapView';
import JobChat from '../components/JobChat';

const FieldDashboard = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('LIST');
    const [stats, setStats] = useState({});
    const [jobs, setJobs] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [activeChatJob, setActiveChatJob] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (!jobs) return;
        const lowerSearch = searchTerm.toLowerCase();
        let filtered = jobs.filter(job =>
            (job.quote_no && job.quote_no.toLowerCase().includes(lowerSearch)) ||
            (job.brand && job.brand.toLowerCase().includes(lowerSearch)) ||
            (job.location && job.location.toLowerCase().includes(lowerSearch)) ||
            (job.tech?.name && job.tech.name.toLowerCase().includes(lowerSearch))
        );

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(job => job.status === statusFilter);
        }

        setFilteredJobs(filtered);
    }, [searchTerm, statusFilter, jobs]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, jobsRes, techsRes] = await Promise.all([
                FieldOperationsService.getStats(),
                FieldOperationsService.getAssignedJobs(),
                FieldOperationsService.getTechnicians()
            ]);

            setStats(statsRes.data || {});
            setJobs(jobsRes.data || []);
            setTechnicians(techsRes.data || []);
            setFilteredJobs(jobsRes.data || []);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'IN_PROGRESS': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
            case 'ASSIGNED': return 'bg-violet-50 text-violet-700 border-violet-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const StatCard = ({ label, value, icon: Icon, color, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`
                p-6 rounded-2xl border transition-all duration-300 hover:shadow-md
                ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}
                flex items-center justify-between
            `}
        >
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : `${color} bg-opacity-10`}`}>
                <Icon size={24} className={`${darkMode ? 'text-white' : color.replace('bg-', 'text-')}`} />
            </div>
            <div className="text-right">
                <p className={`text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {value || 0}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</p>
            </div>
        </motion.div>
    );

    return (
        <div className={`p-6 lg:p-10 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>

            {/* 1. Dashboard Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-6">
                <div>
                    <h1 className={`text-4xl font-heading font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        Field Overview
                    </h1>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Monitor real-time operations, track job progress, and manage technician assignments.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchDashboardData}
                        className={`p-3 rounded-xl border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600'}`}
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => navigate('/field-ops/assign')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all font-medium"
                    >
                        <Plus size={20} />
                        <span>New Assignment</span>
                    </button>
                </div>
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    label="Pending Jobs"
                    value={stats.pendingAssignment}
                    icon={Clock}
                    color="bg-violet-600"
                    delay={0.1}
                />
                <StatCard
                    label="Active Jobs"
                    value={stats.activeJobs}
                    icon={Briefcase}
                    color="bg-cyan-600"
                    delay={0.2}
                />
                <StatCard
                    label="Techs Online"
                    value={stats.techsActive}
                    icon={User}
                    color="bg-emerald-500"
                    delay={0.3}
                />
                <StatCard
                    label="Completed"
                    value={stats.completedJobs}
                    icon={LayoutGrid}
                    color="bg-purple-500"
                    delay={0.4}
                />
            </div>

            {/* 3. Controls & View Toggle */}
            <div className={`p-2 mb-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} flex flex-col md:flex-row items-center justify-between gap-4`}>

                {/* Search */}
                <div className="relative w-full max-w-sm ml-2">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="Search jobs, technicians, locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-colors
                            ${darkMode
                                ? 'bg-slate-900/50 text-white placeholder-slate-600 focus:bg-slate-900'
                                : 'bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-50'}
                        `}
                    />
                </div>

                {/* Filters & Toggles */}
                <div className="flex items-center gap-3 w-full md:w-auto p-1 overflow-x-auto">
                    {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`
                                px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap
                                ${statusFilter === status
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}
                            `}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}

                    <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                    <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('MAP')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'MAP' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Map size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Content Area */}
            {viewMode === 'MAP' ? (
                <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                    <MapView jobs={filteredJobs} technicians={technicians} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <RefreshCw className="animate-spin mb-3" size={32} />
                                <span className="text-sm font-medium">Loading Dashboard...</span>
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className={`py-24 text-center rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 dashed'}`}>
                                <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>No Jobs Found</h3>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            filteredJobs.map((job, idx) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/field-ops/jobs/${job.id}`)} // Or open details panel
                                    className={`
                                        group relative p-5 rounded-xl border transition-all duration-200 cursor-pointer
                                        ${darkMode
                                            ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50'
                                            : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100'}
                                    `}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                                        {/* Main Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className={`text-lg font-bold font-heading group-hover:text-indigo-600 transition-colors ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                                    {job.brand || 'Untitled Job'}
                                                </h3>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(job.status)}`}>
                                                    {job.status?.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {job.location}, {job.city}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Briefcase size={14} className="text-slate-400" />
                                                    {job.work_description || 'No description'}
                                                </div>
                                                <div className="flex items-center gap-1.5 font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                                                    {job.quote_no}
                                                </div>
                                            </div>

                                            {/* Technician */}
                                            {job.tech ? (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${darkMode ? 'bg-slate-700 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
                                                        {job.tech.name?.charAt(0)}
                                                    </div>
                                                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                                        {job.tech.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-violet-500 font-medium bg-violet-50 px-2 py-1 rounded-lg">
                                                    Unassigned
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions / Right Side */}
                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 min-w-[120px]">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveChatJob(job); }}
                                                    className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-indigo-50 text-slate-400 hover:text-indigo-600'}`}
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                                <div className={`p-2 rounded-full ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'} transition-colors`}>
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                            {job.work_status && (
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${job.work_status === 'DONE' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                            style={{ width: job.progress ? `${job.progress}%` : '5%' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Chat Modal - Keeping existing logic */}
            <AnimatePresence>
                {activeChatJob && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setActiveChatJob(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-lg h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
                        >
                            <JobChat
                                jobId={activeChatJob.id} // Note: Check if id or job_id
                                onClose={() => setActiveChatJob(null)}
                                title={activeChatJob.brand}
                                quoteNo={activeChatJob.quote_no}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FieldDashboard;
