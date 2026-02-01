import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import {
    ArrowLeft, MapPin, Calendar, Camera, Upload, CheckCircle, Navigation, Phone,
    Check, ClipboardList, Clock, Plus, X, BarChart, Image, FileText, Mail,
    ExternalLink, Trash2, PlayCircle, Download, Monitor, Store, Hash, List, MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import FieldOperationsService from '../../../services/FieldOperationsService';
import API_BASE_URL from '../../../config/api';
import JobChat from '../../FieldOperations/components/JobChat';

const FieldJobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('DETAILS'); // DETAILS, MEDIA, DOCS, EMAIL, CHAT
    const [showLogModal, setShowLogModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [logs, setLogs] = useState([]); // [NEW] Logs State
    const [newLog, setNewLog] = useState('');

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        setLoading(true);
        const data = await FieldOperationsService.getJobDetails(id);
        if (data) {
            // The controller now returns a flat jobDetails object with 'resources'
            // We need to map 'resources' back to 'images' for the component's internal logic if needed
            // or just ensure the component uses 'resources' or we map it here.
            // Let's standardise on the component using the data as returned if possible, 
            // but for minimal churn, let's map it to what the state expects.

            // The component seems to rely on 'job.images' for the tabs.
            // The API returns 'resources'.
            setJob({ ...data, images: data.resources || [] });
            fetchLogs(data.id); // Fetch logs using assignment ID
        } else {
            toast.error("Failed to load job details");
        }
        setLoading(false);
    };

    const fetchLogs = async (assignmentId) => {
        const res = await FieldOperationsService.getJobLogs(assignmentId);
        if (res.success) {
            setLogs(res.data);
        }
    };


    const handleFileUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        // Map tab types to backend types
        // BEFORE, AFTER, DOCUMENT
        let backendType = 'AFTER';
        if (type === 'BEFORE') backendType = 'BEFORE';
        if (type === 'DOCS') backendType = 'DOCUMENT';
        if (type === 'EMAIL') backendType = 'DOCUMENT'; // Or specific email type if backend supports

        formData.append('type', backendType);

        // FieldOperationsService wrapper expects (jobId, formData)
        // job.id is Assignment UUID, job.job_id is the Integer Job ID required by the jobs endpoint
        const res = await FieldOperationsService.uploadJobMedia(job.job_id, formData);

        if (res.success) {
            toast.success("Uploaded successfully");
            fetchJobDetails(); // Refresh to show new files
        } else {
            toast.error("Upload failed: " + res.message);
        }
        setUploading(false);
    };

    const handleSaveLog = async () => {
        if (!newLog.trim()) return;

        const res = await FieldOperationsService.addJobLog(job.id, {
            notes: newLog,
            log_type: 'DAILY_REPORT'
        });

        if (res.success) {
            toast.success("Log added");
            setNewLog('');
            setShowLogModal(false);
            fetchLogs(job.id);
        } else {
            toast.error("Failed to save log");
        }
    };

    const handleCompleteJob = async () => {
        if (!confirm("Are you sure you want to complete this job?")) return;

        const res = await FieldOperationsService.completeJob(id, { notes: 'Completed via User Portal' });
        if (res.success) {
            toast.success("Job marked as completed!");
            navigate('/user/jobs');
        } else {
            toast.error("Failed to complete job");
        }
    };

    const handleStartJob = async () => {
        if (!confirm("Ready to start this job?")) return;

        const res = await FieldOperationsService.updateJobProgress(id, { status: 'IN_PROGRESS' });
        if (res.success) {
            toast.success("Job started!");
            fetchJobDetails(); // Refresh to show updated status
        } else {
            toast.error("Failed to start job");
        }
    };

    const getFileUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i);

    // Filter media helper
    const getMedia = (filterType) => {
        if (!job || !job.images) return [];

        // Backend maps 'type' to 'category' property in resources
        if (filterType === 'BEFORE') return job.images.filter(img => img.category === 'BEFORE');
        if (filterType === 'AFTER') return job.images.filter(img => img.category === 'AFTER' || (!img.category && img.type !== 'BEFORE'));

        // Documents check
        if (filterType === 'DOCS') {
            return job.images.filter(img =>
                img.file_type === 'DOCUMENT' ||
                img.title?.toLowerCase().endsWith('.pdf') ||
                img.category === 'DOCUMENT'
            );
        }

        // Emails check
        if (filterType === 'EMAIL') {
            return job.images.filter(img =>
                img.title?.toLowerCase().endsWith('.msg') ||
                img.title?.toLowerCase().endsWith('.eml')
            );
        }
        return [];
    };

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    if (!job) return <div className="p-10 text-center">Job not found</div>;

    const beforeImages = getMedia('BEFORE');
    const afterImages = getMedia('AFTER');
    const documents = getMedia('DOCS');
    const emails = getMedia('EMAIL');

    const tabs = [
        { id: 'DETAILS', label: 'Details', icon: List },
        { id: 'MEDIA', label: 'Media', icon: Camera },
        { id: 'DOCS', label: 'Docs', icon: FileText },
        { id: 'EMAIL', label: 'Comms', icon: Mail },
        { id: 'LOGS', label: 'Daily Report', icon: ClipboardList },
        { id: 'CHAT', label: 'Chat', icon: MessageCircle }
    ];

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank'); // Fallback
        }
    };

    return (
        <div className={`min-h-screen pb-24 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

            <div className={`sticky top-0 z-30 transition-all duration-300 backdrop-blur-xl border-b 
                ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 shadow-sm border border-gray-100 hover:bg-gray-50'}`}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className={`text-xl font-black truncate leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {job.brand || 'Job Details'}
                            </h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider truncate">
                                {job.store_name || job.location}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                            ${job.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {job.status?.replace('_', ' ')}
                        </div>
                    </div>

                    {/* Segmented Control Tabs */}
                    <div className={`p-1 rounded-2xl flex relative overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200/50'}`}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 relative py-2.5 flex flex-col items-center gap-1 z-10 transition-colors duration-300
                                    ${activeTab === tab.id
                                        ? (darkMode ? 'text-white' : 'text-blue-600')
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <tab.icon size={16} strokeWidth={2.5} />
                                <span className="text-[10px] font-bold uppercase tracking-wide">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeDetailTab"
                                        className={`absolute inset-0 rounded-xl shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                                        style={{ zIndex: -1 }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 py-4">
                <AnimatePresence mode='wait'>

                    {/* --- DETAILS TAB --- */}
                    {activeTab === 'DETAILS' && (
                        <motion.div
                            key="DETAILS"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Actions Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <button className="col-span-1 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                    <Navigation size={18} /> Directions
                                </button>
                                <button className={`col-span-1 py-3 rounded-2xl font-bold border flex items-center justify-center gap-2 active:scale-95 transition-transform
                                    ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-700'}`}>
                                    <Phone size={18} /> Call Store
                                </button>
                            </div>

                            {/* Info Cards */}
                            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">Job Information</h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Brand</p>
                                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{job.brand || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Store CCID</p>
                                        <p className={`font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{job.ccid || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500 mb-1">Store Name / Mall</p>
                                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{job.store_name} {job.mall ? `(${job.mall})` : ''}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Job Number</p>
                                        <p className={`font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{job.job_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Due Date</p>
                                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(job.due_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-3 tracking-wider">Description</h3>
                                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {job.description || 'No work description provided.'}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            {job.status === 'ASSIGNED' && (
                                <button
                                    onClick={handleStartJob}
                                    className="w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700"
                                >
                                    <PlayCircle size={20} />
                                    Start Job
                                </button>
                            )}

                            {job.status === 'IN_PROGRESS' && (
                                <button
                                    onClick={handleCompleteJob}
                                    className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4
                                    ${afterImages.length > 0
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                            : 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'}`}
                                    disabled={afterImages.length === 0}
                                >
                                    <CheckCircle size={20} />
                                    Complete Job
                                </button>
                            )}
                        </motion.div>
                    )}

                    {/* --- MEDIA TAB --- */}
                    {activeTab === 'MEDIA' && (
                        <motion.div
                            key="MEDIA"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* Before Section */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-orange-400"></span> Before Work
                                    </h3>
                                    <label className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5
                                        ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                                        <Camera size={14} /> Add
                                        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'BEFORE')} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {beforeImages.map((img, i) => (
                                        <div key={i} onClick={() => setSelectedMedia(img)} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border border-transparent hover:border-blue-500 transition-all">
                                            {img.url ? (
                                                <img src={getFileUrl(img.url)} alt="Before" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Image className="text-gray-400" /></div>
                                            )}
                                            {isVideo(img.url) && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><PlayCircle className="text-white opaciy-80" /></div>}
                                        </div>
                                    ))}
                                    {beforeImages.length === 0 && (
                                        <div className={`col-span-2 py-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-gray-400
                                            ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                            <Camera size={24} className="mb-2 opacity-50" />
                                            <span className="text-xs">No photos yet</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* After Section */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> After Completion
                                    </h3>
                                    <label className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5
                                        ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                                        <Camera size={14} /> Add
                                        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'AFTER')} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {afterImages.map((img, i) => (
                                        <div key={i} onClick={() => setSelectedMedia(img)} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border border-transparent hover:border-blue-500 transition-all">
                                            {img.url ? (
                                                <img src={getFileUrl(img.url)} alt="After" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Image className="text-gray-400" /></div>
                                            )}
                                            {isVideo(img.url) && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><PlayCircle className="text-white opaciy-80" /></div>}
                                        </div>
                                    ))}
                                    {afterImages.length === 0 && (
                                        <div className={`col-span-2 py-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-gray-400
                                            ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                            <CheckCircle size={24} className="mb-2 opacity-50" />
                                            <span className="text-xs">No completion photos</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- DOCUMENTS TAB --- */}
                    {activeTab === 'DOCS' && (
                        <motion.div
                            key="DOCS"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <label className="w-full py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                                hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-700 text-gray-500">
                                <Upload size={24} className="mb-2" />
                                <span className="text-sm font-bold">Upload Document (PDF)</span>
                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, 'DOCS')} />
                            </label>

                            <div className="space-y-3">
                                {documents.map((doc, i) => (
                                    <div key={i} onClick={() => setSelectedMedia(doc)} className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]
                                        ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {doc.title}
                                            </h4>
                                            <p className="text-xs text-gray-500">{doc.date}</p>
                                        </div>
                                        <ExternalLink size={16} className="text-gray-400" />
                                    </div>
                                ))}
                                {documents.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No documents attached</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* --- EMAILS TAB --- */}
                    {activeTab === 'EMAIL' && (
                        <motion.div
                            key="EMAIL"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <label className="w-full py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                                hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-300 dark:border-gray-700 text-gray-500">
                                <Upload size={24} className="mb-2" />
                                <span className="text-sm font-bold">Upload Email (.msg / .eml)</span>
                                <input type="file" accept=".msg,.eml,.pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'EMAIL')} />
                            </label>

                            <div className="space-y-3">
                                {emails.map((email, i) => (
                                    <div key={i} onClick={() => setSelectedMedia(email)} className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]
                                        ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                            <Mail size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {email.title}
                                            </h4>
                                            <p className="text-xs text-gray-500">{email.date}</p>
                                        </div>
                                        <ExternalLink size={16} className="text-gray-400" />
                                    </div>
                                ))}
                                {emails.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No saved emails</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* --- LOGS TAB --- */}
                    {activeTab === 'LOGS' && (
                        <motion.div
                            key="LOGS"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <div
                                onClick={() => setShowLogModal(true)}
                                className="w-full py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                                hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-700 text-gray-500"
                            >
                                <Plus size={24} className="mb-2" />
                                <span className="text-sm font-bold">Add Daily Log Entry</span>
                            </div>

                            <div className="space-y-4">
                                {logs.map((log, i) => (
                                    <div key={i} className={`p-4 rounded-2xl flex gap-4 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl h-fit">
                                            <ClipboardList size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    Daily Report
                                                </h4>
                                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                                    {new Date(log.log_date || log.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} whitespace-pre-wrap`}>
                                                {log.notes}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                                <Clock size={12} />
                                                <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                                <span>•</span>
                                                <span>{log.Employee?.first_name} {log.Employee?.last_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No daily logs yet</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* Chat Tab */}
                    {activeTab === 'CHAT' && (
                        <motion.div
                            key="CHAT"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[600px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                        >
                            <JobChat
                                jobId={job.job_id}
                                title={job.brand}
                                quoteNo={job.quote_no}
                            />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Media Viewer Overlay */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
                    >
                        {/* Toolbar */}
                        <div className="absolute top-4 right-4 flex items-center gap-4 z-[60]">
                            <button
                                onClick={() => handleDownload(getFileUrl(selectedMedia.url), selectedMedia.title || selectedMedia.original_name)}
                                className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                            >
                                <Download size={20} />
                            </button>
                            <button onClick={() => setSelectedMedia(null)} className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="w-full h-full flex items-center justify-center max-w-4xl">
                            {selectedMedia.file_type === 'VIDEO' || isVideo(selectedMedia.url) ? (
                                <video src={getFileUrl(selectedMedia.url)} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg" />
                            ) : selectedMedia.file_type === 'DOCUMENT' || selectedMedia.title?.endsWith('.pdf') ? (
                                <iframe src={getFileUrl(selectedMedia.url)} className="w-full h-[80vh] bg-white rounded-lg" />
                            ) : (
                                <img src={getFileUrl(selectedMedia.url)} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                            )}
                        </div>
                        <p className="absolute bottom-8 text-white font-bold">{selectedMedia.title}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Overlay */}
            {uploading && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl flex flex-col items-center">
                        <div className="animate-spin text-blue-500 mb-3"><Upload size={32} /></div>
                        <p className="font-bold dark:text-white">Uploading...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FieldJobDetail;
