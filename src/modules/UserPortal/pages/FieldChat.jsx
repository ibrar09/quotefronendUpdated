import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Briefcase, MapPin, ChevronRight, Hash, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import AdminSupportChat from '../components/AdminSupportChat';
import JobChat from '../../FieldOperations/components/JobChat';

const FieldChat = () => {
    const { darkMode } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'job'
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileView, setMobileView] = useState('LIST'); // 'LIST' or 'CHAT'

    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        fetchJobs();
    }, [user]);

    useEffect(() => {
        if (jobs.length > 0) {
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 15000); // Poll every 15s
            return () => clearInterval(interval);
        }
    }, [jobs]);

    const fetchUnreadCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const jobIds = jobs.map(j => j.id);
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
                const activeJobs = response.data.data.filter(j => j.status !== 'DONE' && j.status !== 'CANCELLED');
                setJobs(activeJobs);
            }
        } catch (error) {
            console.error('Error fetching jobs for chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAdmin = () => {
        setActiveTab('admin');
        setSelectedJob(null);
        setMobileView('CHAT');
    };

    const handleSelectJob = (job) => {
        setActiveTab('job');
        setSelectedJob(job);
        setMobileView('CHAT');
        // Optimistically clear unread count
        setUnreadCounts(prev => ({ ...prev, [job.id]: 0 }));
    };

    const handleBackToMenu = () => {
        navigate('/user/home');
    }

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const unreadA = unreadCounts[a.id] || 0;
        const unreadB = unreadCounts[b.id] || 0;
        // Sort Unread First
        if (unreadA > 0 && unreadB === 0) return -1;
        if (unreadA === 0 && unreadB > 0) return 1;
        // Then sort by ID descending (newer first assumption) or Title
        return b.id - a.id;
    });

    return (
        <div className={`h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] m-0 md:m-4 flex overflow-hidden md:rounded-2xl md:border shadow-sm
            ${darkMode ? 'bg-gray-900 md:bg-gray-800 md:border-gray-700' : 'bg-gray-50 md:bg-white md:border-gray-200'}`}>

            {/* Sidebar (Chat List) */}
            <div className={`w-full md:w-80 flex flex-col border-r ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'} 
                ${mobileView === 'CHAT' ? 'hidden md:flex' : 'flex'}`}>

                {/* Sidebar Header */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={handleBackToMenu} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <ArrowLeft size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                        </button>
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
                    </div>

                    <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-all
                        ${darkMode ? 'bg-gray-800 border-gray-700 focus-within:border-blue-500' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'}`}>
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search chats..."
                            className={`bg-transparent border-none outline-none text-sm w-full font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {/* Admin Support Item */}
                    <div
                        onClick={handleSelectAdmin}
                        className={`p-3 rounded-xl cursor-pointer transition-all border
                            ${activeTab === 'admin'
                                ? (darkMode ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-100')
                                : (darkMode ? 'hover:bg-gray-800 border-transparent' : 'hover:bg-gray-50 border-transparent')}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src="https://ui-avatars.com/api/?name=Admin+Support&background=0D8ABC&color=fff"
                                    alt="Admin" className="w-10 h-10 rounded-full shadow-sm" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className={`font-bold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Admin Support</h3>
                                    <span className="text-[10px] text-gray-400">Now</span>
                                </div>
                                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Contact support for general help...
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-2 py-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Job Chats</p>
                    </div>

                    {/* Job Chats */}
                    {loading ? (
                        <div className="text-center py-4 text-gray-400 text-xs">Loading jobs...</div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm italic">
                            No active job chats found.
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div
                                key={job.assignment_id}
                                onClick={() => handleSelectJob(job)}
                                className={`p-3 rounded-xl cursor-pointer transition-all border group
                                    ${activeTab === 'job' && selectedJob?.assignment_id === job.assignment_id
                                        ? (darkMode ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-100')
                                        : (darkMode ? 'hover:bg-gray-800 border-transparent' : 'hover:bg-gray-50 border-transparent')}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                        ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white border border-gray-100 text-gray-500'}`}>
                                        <Briefcase size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className={`font-bold text-sm truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'} flex-1 mr-2`}>
                                                {job.title || job.brand}
                                            </h3>

                                            <div className="flex items-center gap-1">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold hidden sm:block
                                                    ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                                    #{job.job_number}
                                                </span>

                                                {/* Unread Badge */}
                                                {unreadCounts[job.id] > 0 && (
                                                    <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                                                        {unreadCounts[job.id]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                                            <MapPin size={10} />
                                            <span className="truncate">{job.location || 'No Location'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col relative w-full ${mobileView === 'LIST' ? 'hidden md:flex' : 'flex'}`}>
                {activeTab === 'admin' ? (
                    <AdminSupportChat onBack={() => setMobileView('LIST')} />
                ) : activeTab === 'job' && selectedJob ? (
                    <div className="flex flex-col h-full w-full">
                        {/* Mobile Back Overlay for JobChat */}
                        <div className="md:hidden absolute top-3 left-3 z-20">
                            <button
                                onClick={() => setMobileView('LIST')}
                                className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-full shadow-sm text-gray-600 dark:text-gray-300 border dark:border-gray-700"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        </div>
                        <JobChat
                            key={selectedJob.assignment_id}
                            jobId={selectedJob.id} // Actual Job ID for DB relation
                            title={selectedJob.title || selectedJob.brand}
                            quoteNo={selectedJob.job_number}
                            allowDelete={false}
                        />
                    </div>
                ) : (
                    <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center
                        ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="text-gray-400" />
                        </div>
                        <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Messages</h3>
                        <p className="text-gray-500 max-w-xs">Select "Admin Support" or a Job from the list to view the conversation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FieldChat;
