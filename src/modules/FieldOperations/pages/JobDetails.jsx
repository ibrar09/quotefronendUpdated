import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import {
    ArrowLeft, MapPin, Calendar, User, CheckCircle, Clock, FileText,
    MessageSquare, Image as ImageIcon, Plus, X, Download, Phone, Mail,
    MoreVertical, Shield, AlertTriangle, Briefcase, Printer, FileDown, Upload,
    Building2, AlertCircle, LayoutGrid, DollarSign
} from 'lucide-react';
import FieldOperationsService from '../../../services/FieldOperationsService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode, themeStyles } = useTheme();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageFilter, setImageFilter] = useState('media');
    const [selectedCategory, setSelectedCategory] = useState('BEFORE');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            const jobData = await FieldOperationsService.getJobDetails(id);
            if (jobData) {
                setJob(jobData);
            } else {
                toast.error('Job not found');
                navigate('/field-ops');
            }
        } catch (err) {
            console.error('Failed to fetch job:', err);
            toast.error('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        const loadingToast = toast.loading(`Uploading ${files.length} file(s)...`);

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            let backendType = selectedCategory === 'BEFORE' ? 'BEFORE' : 'AFTER';
            formData.append('type', backendType);

            const result = await FieldOperationsService.uploadJobMedia(job.job_id, formData);

            if (result.success) {
                toast.success('Upload successful', { id: loadingToast });
                await fetchJobDetails();
            } else {
                toast.error(result.message || 'Upload failed', { id: loadingToast });
            }
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Upload failed', { id: loadingToast });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const navTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'financial', label: 'Financial', icon: DollarSign },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'resources', label: 'Resources', icon: ImageIcon },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'IN_PROGRESS': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'ASSIGNED': return 'bg-violet-100 text-violet-800 border-violet-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) return (
        <div className={`flex flex-col items-center justify-center h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold animate-pulse">Loading Job Details...</p>
        </div>
    );

    if (!job) return <div className="p-10 text-center text-slate-500">Job not found</div>;

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} animate-[fadeIn_0.5s_ease-out]`}>
            {/* Header / Hero */}
            <div className={`relative pt-8 pb-10 px-6 md:px-12 border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="max-w-7xl mx-auto">
                    {/* Navigation */}
                    <button
                        onClick={() => navigate('/field-ops')}
                        className="group flex items-center gap-2 mb-6 transition-colors text-slate-600 hover:text-violet-700"
                    >
                        <div className={`p-2 rounded-full border transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm group-hover:border-violet-300'}`}>
                            <ArrowLeft size={18} className="text-slate-600 group-hover:text-violet-700 transition-colors" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Back to Dashboard</span>
                    </button>

                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(job.status)}`}>
                                    {job.status?.replace('_', ' ') || 'PENDING'}
                                </span>
                                <span className="text-slate-400">|</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                    <FileText size={14} className="text-violet-500" /> {job.quote_no}
                                </span>
                                <span className="text-slate-400">|</span>
                                {job.priority !== 'Normal' && (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                                        <AlertTriangle size={14} /> {job.priority} Priority
                                    </span>
                                )}
                            </div>

                            <h1 className={`text-4xl md:text-5xl font-heading font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                                {job.brand || 'Untitled Project'}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
                                <span className="flex items-center gap-2">
                                    <MapPin size={18} className="text-rose-500" />
                                    {job.location}, {job.city}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar size={18} className="text-violet-500" />
                                    {new Date(job.assigned_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                            {/* Tools Menu */}
                            <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <button
                                    onClick={() => toast.success('Downloading Job Sheet...')}
                                    className="p-3 text-slate-500 hover:text-violet-600 transition-colors"
                                    title="Export to Excel"
                                >
                                    <FileDown size={20} />
                                </button>
                                <div className="w-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                                <button
                                    onClick={() => window.print()}
                                    className="p-3 text-slate-500 hover:text-violet-600 transition-colors"
                                    title="Print Job Sheet"
                                >
                                    <Printer size={20} />
                                </button>
                            </div>

                            <button className={`px-6 py-3 rounded-xl font-bold text-sm border transition-all flex items-center justify-center gap-2
                                ${darkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}>
                                <MessageSquare size={18} className="text-violet-500" /> Contact Tech
                            </button>

                            {job.status !== 'COMPLETED' && (
                                <button
                                    onClick={() => {
                                        FieldOperationsService.completeJob(job.id, { notes: 'Completed via dashboard' });
                                        toast.success('Job marked as completed!');
                                        fetchJobDetails();
                                    }}
                                    className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                                >
                                    <CheckCircle size={18} /> Complete Job
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
                {/* Tabs */}
                <div className="flex gap-8 border-b mb-10 border-slate-200 dark:border-slate-800 overflow-x-auto">
                    {navTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 whitespace-nowrap
                                ${activeTab === tab.id
                                    ? (darkMode ? 'text-white' : 'text-violet-800')
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Reference Info */}
                                <div className="space-y-6">
                                    <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <h3 className={`text-base font-heading font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Project Details</h3>

                                        <div className="space-y-5">
                                            {[
                                                { label: 'Brand / Client', value: job.brand, icon: Briefcase, color: 'text-violet-500', bg: 'bg-violet-50' },
                                                { label: 'MR Number', value: job.mr_no, icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                                                { label: 'PR Number', value: job.pr_no, icon: Printer, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
                                                { label: 'Location', value: job.location, icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-50' },
                                                { label: 'Store Opening', value: job.store_opening_date ? new Date(job.store_opening_date).toLocaleDateString() : null, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 group">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${darkMode ? 'bg-slate-700' : item.bg}`}>
                                                        <item.icon size={20} className={item.color} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">{item.label}</p>
                                                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.value || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Assignment Card */}
                                    <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <h3 className={`text-base font-heading font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Assigned Tech</h3>

                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-slate-700 text-white' : 'bg-violet-100 text-violet-700'}`}>
                                                {job.tech?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{job.tech?.name || 'Unassigned'}</p>
                                                <p className="text-sm text-slate-600">Field Technician</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Description & Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Work Description */}
                                    <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <FileText className="text-blue-600" size={24} />
                                            </div>
                                            <h3 className={`text-xl font-heading font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                                Scope of Work
                                            </h3>
                                        </div>
                                        <div className={`prose max-w-none ${darkMode ? 'prose-invert text-slate-300' : 'text-slate-700'}`}>
                                            <p className="whitespace-pre-line leading-relaxed text-base">
                                                {job.work_description || "No specific work description provided for this job."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Continuous Assessment */}
                                    {job.continuous_assessment && (
                                        <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-emerald-50 rounded-lg">
                                                    <Shield className="text-emerald-600" size={24} />
                                                </div>
                                                <h3 className={`text-xl font-heading font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                                    Continuous Assessment
                                                </h3>
                                            </div>
                                            <div className={`prose max-w-none ${darkMode ? 'prose-invert text-slate-300' : 'text-slate-700'}`}>
                                                <p className="whitespace-pre-line leading-relaxed text-base">
                                                    {job.continuous_assessment}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className={`max-w-4xl mx-auto p-10 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <h3 className="text-xl font-heading font-bold mb-8">Activity Log</h3>
                                <div className="space-y-10 relative pl-4">
                                    <div className="absolute top-0 bottom-0 left-[27px] w-px bg-slate-200 dark:bg-slate-700"></div>

                                    {job.timeline?.map((item, i) => (
                                        <div key={i} className="relative pl-16 group">
                                            <div className={`absolute left-[19px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 z-10 box-content
                                                ${item.type === 'alert' ? 'bg-rose-500 shadow-rose-200' : 'bg-violet-500 shadow-violet-200'} shadow-lg`}></div>

                                            <div className={`p-6 rounded-2xl border transition-all hover:translate-x-1 duration-300 bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800`}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className={`font-bold text-base ${item.type === 'alert' ? 'text-rose-600' : darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.time}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'financial' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <h3 className={`text-xl font-heading font-bold mb-8 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                        <DollarSign className="text-emerald-500" /> Financial Summary
                                    </h3>
                                    {job.financial ? (
                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                                                <span className="text-slate-600 font-medium">Subtotal</span>
                                                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {job.financial.currency} {job.financial.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            {job.financial.discount > 0 && (
                                                <div className="flex justify-between items-center text-emerald-600">
                                                    <span className="font-medium">Discount</span>
                                                    <span className="text-lg font-bold">
                                                        - {job.financial.currency} {job.financial.discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            )}
                                            {job.financial.transportation > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-600 font-medium">Transportation</span>
                                                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {job.financial.currency} {job.financial.transportation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                                                <span className="text-slate-600 font-medium">VAT (15%)</span>
                                                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {job.financial.currency} {job.financial.vat_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-4">
                                                <span className="text-xl font-heading font-bold text-slate-800 dark:text-slate-200">Grand Total</span>
                                                <span className="text-3xl font-heading font-black text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-4 py-2 rounded-xl">
                                                    {job.financial.currency} {job.financial.grand_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400">No financial data available</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="space-y-8 animate-[fadeIn_0.5s]">
                                {/* Media Filters */}
                                <div className="flex p-1.5 gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                                    {[
                                        { id: 'media', label: 'Site Media', icon: ImageIcon },
                                        { id: 'docs', label: 'Documents', icon: FileText },
                                        { id: 'emails', label: 'Correspondence', icon: Mail },
                                    ].map((subTab) => (
                                        <button
                                            key={subTab.id}
                                            onClick={() => setImageFilter(subTab.id)}
                                            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                                                ${imageFilter === subTab.id
                                                    ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-white shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                }`}
                                        >
                                            <subTab.icon size={16} />
                                            {subTab.label}
                                        </button>
                                    ))}
                                </div>

                                {imageFilter === 'media' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Before Work */}
                                        <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-rose-500">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Before Work
                                                </h3>
                                                <button
                                                    onClick={() => { setSelectedCategory('BEFORE'); fileInputRef.current?.click(); }}
                                                    disabled={uploading}
                                                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200"
                                                >
                                                    <Upload size={14} /> {uploading ? 'Uploading...' : 'Add Photo'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                {job.resources?.filter(r => r.category === 'BEFORE').map((res, i) => (
                                                    <div key={i} onClick={() => setSelectedImage(res.url)} className="aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity">
                                                        <img src={res.url} className="w-full h-full object-cover" alt="Before" />
                                                    </div>
                                                ))}
                                                {job.resources?.filter(r => r.category === 'BEFORE').length === 0 && (
                                                    <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl">
                                                        <ImageIcon size={32} className="mb-2 opacity-50" />
                                                        <span className="text-xs font-medium text-slate-400">No media uploaded</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* After Work */}
                                        <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-emerald-500">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completion
                                                </h3>
                                                <button
                                                    onClick={() => { setSelectedCategory('AFTER'); fileInputRef.current?.click(); }}
                                                    disabled={uploading}
                                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-emerald-100"
                                                >
                                                    <Upload size={14} /> {uploading ? 'Uploading...' : 'Add Photo'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                {job.resources?.filter(r => r.category === 'AFTER' || r.category === 'PROGRESS').map((res, i) => (
                                                    <div key={i} onClick={() => setSelectedImage(res.url)} className="aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity">
                                                        <img src={res.url} className="w-full h-full object-cover" alt="After" />
                                                    </div>
                                                ))}
                                                {job.resources?.filter(r => r.category === 'AFTER' || r.category === 'PROGRESS').length === 0 && (
                                                    <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl">
                                                        <CheckCircle size={32} className="mb-2 opacity-50" />
                                                        <span className="text-xs font-medium">No completion media</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleImageUpload} />
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s]" onClick={() => setSelectedImage(null)}>
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <X size={32} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={selectedImage}
                            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobDetails;
