import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Search, Briefcase, MapPin, User, ArrowLeft, MessageSquare, Loader, Zap } from 'lucide-react';
import FieldOperationsService from '../../../services/FieldOperationsService';
import JobChat from '../components/JobChat';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';

const CommunicationHub = () => {
    const { darkMode } = useTheme();
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileView, setMobileView] = useState('LIST'); // 'LIST' or 'CHAT'
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        if (jobs.length > 0) {
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 10000);
            return () => clearInterval(interval);
        }
    }, [jobs]);

    const fetchUnreadCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const jobIds = jobs.map(j => j.job_id).filter(Boolean);
            if (jobIds.length === 0) return;

            const response = await axios.post(
                `${API_BASE_URL}/api/messages/unread-counts`,
                { job_ids: jobIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setUnreadCounts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching unread counts:', error);
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await FieldOperationsService.getAssignedJobs();
            if (res.success || Array.isArray(res.data)) {
                setJobs(res.data || []);
            }
        } catch (error) {
            console.error("Failed to load jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJobSelect = (job) => {
        setSelectedJob(job);
        setMobileView('CHAT');
        setUnreadCounts(prev => ({ ...prev, [job.job_id]: 0 }));
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            (job.brand && job.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (job.quote_no && job.quote_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (job.tech?.name && job.tech.name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (searchTerm) return matchesSearch;
        return matchesSearch && job.status !== 'DONE' && job.status !== 'COMPLETED' && job.status !== 'CANCELLED';
    }).sort((a, b) => {
        const unreadA = unreadCounts[a.job_id] || 0;
        const unreadB = unreadCounts[b.job_id] || 0;
        if (unreadA > 0 && unreadB === 0) return -1;
        if (unreadA === 0 && unreadB > 0) return 1;
        return b.id - a.id;
    });

    return (
        <div className={`h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] m-4 md:m-6 flex overflow-hidden rounded-3xl border shadow-xl animate-[fadeIn_0.5s_ease-out]
            bg-white border-slate-200`}>

            {/* Sidebar / Job List */}
            <div className={`w-full md:w-96 flex flex-col border-r border-slate-100
                ${mobileView === 'CHAT' ? 'hidden md:flex' : 'flex'}`}>

                {/* Sidebar Header */}
                <div className={`p-6 border-b border-slate-100 bg-white`}>
                    <h2 className={`text-2xl font-black tracking-tight mb-4 text-slate-900`}>Messages</h2>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search active jobs..."
                            className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm font-bold border-2 outline-none transition-all
                                bg-white border-slate-200 focus:border-violet-500 text-slate-900`}
                        />
                    </div>
                </div>

                {/* Jobs List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader className="animate-spin text-violet-600" />
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
                            <Briefcase size={32} className="mb-2 opacity-50" />
                            <p className="font-bold">No jobs found</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => {
                            const isSelected = selectedJob?.id === job.id;
                            const unread = unreadCounts[job.job_id] || 0;

                            return (
                                <div
                                    key={job.id}
                                    onClick={() => handleJobSelect(job)}
                                    className={`p-5 cursor-pointer transition-all border-b border-slate-50 relative group
                                        ${isSelected ? 'bg-violet-50/50' : 'hover:bg-slate-50'}`}
                                >
                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600"></div>}

                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className={`font-black text-sm truncate pr-2 text-slate-900`}>
                                            {job.brand}
                                        </h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wide
                                            ${job.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>
                                            {job.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="text-xs space-y-2">
                                        <p className={`font-medium truncate text-slate-600`}>
                                            {job.work_description}
                                        </p>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3 text-slate-400 font-bold">
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {job.city}</span>
                                                {job.tech && <span className="flex items-center gap-1 text-violet-600"><User size={12} /> {job.tech.name}</span>}
                                            </div>

                                            {unread > 0 && (
                                                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                                    {unread} new
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${mobileView === 'LIST' ? 'hidden md:flex' : 'flex'} relative bg-white`}>
                {selectedJob ? (
                    <div className="flex flex-col h-full">
                        <JobChat
                            key={selectedJob.id}
                            jobId={selectedJob.job_id}
                            title={selectedJob.brand}
                            quoteNo={selectedJob.quote_no}
                            onBack={() => setMobileView('LIST')}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
                        <div className={`w-28 h-28 rounded-3xl mb-6 flex items-center justify-center shadow-sm transform -rotate-3
                            bg-white border-2 border-slate-100`}>
                            <MessageSquare size={48} className="text-violet-300" strokeWidth={1.5} />
                        </div>
                        <h3 className={`text-2xl font-black mb-2 text-slate-900`}>Communication Hub</h3>
                        <p className="max-w-xs mx-auto text-slate-500 font-medium">Select a job from the list to start messaging with your field technicians.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunicationHub;
