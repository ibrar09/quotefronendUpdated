import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, User, MapPin, Search, Check, FileText,
    Briefcase, AlertCircle, Calendar, ArrowRight, Layout, Filter, ChevronRight, X, PlusCircle, Zap, Clock,
    LayoutList, MoreVertical, DollarSign, PenTool
} from 'lucide-react';
import FieldOperationsService from '../../../services/FieldOperationsService';
import { toast } from 'react-hot-toast';

const WorkAssignment = () => {
    const { darkMode, themeStyles, colors } = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State
    const [technicians, setTechnicians] = useState([]);
    const [selectedTech, setSelectedTech] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [assignmentMode, setAssignmentMode] = useState(
        searchParams.get('mode') === 'MANUAL' ? 'MANUAL' : 'QUOTE'
    );

    // Assignment Modal
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [quoteToAssign, setQuoteToAssign] = useState(null);
    const [assignmentNotes, setAssignmentNotes] = useState('');

    // Quotations Data
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [pendingQuotes, setPendingQuotes] = useState([]);
    const [filteredQuotes, setFilteredQuotes] = useState([]);
    const [loadingPending, setLoadingPending] = useState(true);

    // Manual Form Data
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        city: '',
        priority: 'Normal',
        description: ''
    });

    // Load Initial Data
    useEffect(() => {
        loadPendingQuotations();
        loadTechnicians();
    }, []);

    const loadPendingQuotations = async () => {
        setLoadingPending(true);
        try {
            const response = await FieldOperationsService.getPendingQuotations({
                region: regionFilter,
                status: statusFilter
            });
            setPendingQuotes(response.data || []);
            setFilteredQuotes(response.data || []);
        } catch (err) {
            console.error('Failed to load quotations:', err);
            toast.error('Failed to load pending quotations');
        } finally {
            setLoadingPending(false);
        }
    };

    const loadTechnicians = async () => {
        try {
            const response = await FieldOperationsService.getTechnicians();
            setTechnicians(response.data || []);
        } catch (err) {
            console.error('Failed to load technicians:', err);
        }
    };

    // Reload when filters change
    useEffect(() => {
        loadPendingQuotations();
    }, [regionFilter, statusFilter]);

    // Search Filter
    useEffect(() => {
        const lowerSearch = searchQuery.toLowerCase();
        const filtered = pendingQuotes.filter(q =>
            q.quote_no?.toLowerCase().includes(lowerSearch) ||
            q.brand?.toLowerCase().includes(lowerSearch) ||
            q.location?.toLowerCase().includes(lowerSearch) ||
            q.mr_no?.toLowerCase().includes(lowerSearch) ||
            q.city?.toLowerCase().includes(lowerSearch)
        );
        setFilteredQuotes(filtered);
    }, [searchQuery, pendingQuotes]);

    const openAssignModal = (quote) => {
        setQuoteToAssign(quote);
        setSelectedTech(null);
        setAssignmentNotes('');
        setAssignModalOpen(true);
    };

    const handleQuickAssign = async () => {
        if (!selectedTech || !quoteToAssign) return;

        setAssigning(true);
        try {
            const response = await FieldOperationsService.assignQuotationToTech(
                quoteToAssign.id,
                selectedTech,
                assignmentNotes
            );

            if (response.success) {
                toast.success(`✅ Assigned to ${technicians.find(t => t.id === selectedTech)?.name}`);

                // Remove from pending list
                setPendingQuotes(prev => prev.filter(q => q.id !== quoteToAssign.id));
                setFilteredQuotes(prev => prev.filter(q => q.id !== quoteToAssign.id));

                setAssignModalOpen(false);
                setQuoteToAssign(null);
            } else {
                toast.error(response.message || 'Assignment failed');
            }
        } catch (err) {
            console.error('Assignment error:', err);
            toast.error('Failed to assign job');
        } finally {
            setAssigning(false);
        }
    };

    // Dashboard Colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-emerald-700 bg-emerald-100 border border-emerald-200';
            case 'PO_RECEIVED': return 'text-cyan-700 bg-cyan-100 border border-cyan-200';
            default: return 'text-slate-700 bg-slate-100 border border-slate-200';
        }
    };

    const getPriorityIcon = (priority) => {
        if (priority === 'High') return <Zap size={16} className="text-violet-600 fill-violet-100" />;
        if (priority === 'Critical') return <AlertCircle size={16} className="text-rose-600 fill-rose-100 animate-pulse" />;
        return <Clock size={16} className="text-slate-400" />;
    };

    return (
        <div className={`min-h-screen text-sm bg-white animate-[fadeIn_0.5s_ease-out]`}>
            {/* Header - White Background */}
            <div className={`px-8 py-8 bg-white border-b border-slate-200 shadow-sm`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/field-ops')}
                            className={`p-3 rounded-full transition-all border bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm`}
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <h1 className={`text-3xl font-black tracking-tight mb-1 text-slate-900`}>
                                {assignmentMode === 'QUOTE' ? 'Assign Work' : 'Manual Entry'}
                            </h1>
                            <p className="text-slate-500 font-medium">Manage technicians and job queues</p>
                        </div>
                    </div>

                    <div className={`flex p-1.5 rounded-xl border bg-white border-slate-200 shadow-sm`}>
                        <button
                            onClick={() => setAssignmentMode('QUOTE')}
                            className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2
                            ${assignmentMode === 'QUOTE'
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <LayoutList size={16} /> Quotes
                            {pendingQuotes.length > 0 && <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${assignmentMode === 'QUOTE' ? 'bg-white text-violet-600' : 'bg-violet-100 text-violet-700'}`}>{pendingQuotes.length}</span>}
                        </button>
                        <button
                            onClick={() => setAssignmentMode('MANUAL')}
                            className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2
                            ${assignmentMode === 'MANUAL'
                                    ? 'bg-cyan-600 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <PlusCircle size={16} /> Manual
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENT AREA - WHITE */}
            <div className="max-w-7xl mx-auto p-8 bg-white">
                <AnimatePresence mode="wait">
                    {assignmentMode === 'QUOTE' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Search & Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search size={20} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by ID, Brand, or Location..."
                                        className={`block w-full pl-12 pr-4 py-4 rounded-xl text-sm font-bold border-2 focus:outline-none focus:ring-0 focus:border-violet-500 transition-all bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={regionFilter}
                                    onChange={(e) => setRegionFilter(e.target.value)}
                                    className={`px-6 py-4 rounded-xl text-sm font-bold border-2 cursor-pointer focus:outline-none focus:ring-0 focus:border-violet-500 transition-all bg-white border-slate-200 text-slate-700 shadow-sm`}
                                >
                                    <option value="ALL">All Regions</option>
                                    <option value="CP">Central</option>
                                    <option value="EP">Eastern</option>
                                    <option value="WP">Western</option>
                                </select>
                            </div>

                            {/* WHITE LIST VIEW */}
                            <div className={`rounded-2xl overflow-hidden border bg-white border-slate-200 shadow-sm`}>
                                {loadingPending ? (
                                    <div className="py-20 flex justify-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
                                    </div>
                                ) : filteredQuotes.length === 0 ? (
                                    <div className="py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Briefcase size={32} className="text-slate-300" />
                                        </div>
                                        <p className="text-slate-900 font-black text-xl mb-2">No jobs to assign</p>
                                        <p className="text-slate-500 font-medium">Clear filters to see more.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {filteredQuotes.map((quote) => (
                                            <div
                                                key={quote.id}
                                                onClick={() => openAssignModal(quote)}
                                                className={`group relative p-6 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-6 border-l-4 border-transparent hover:border-l-violet-500 hover:bg-slate-50`}
                                            >
                                                {/* Left: Identifier */}
                                                <div className="flex items-center gap-5 min-w-[240px]">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold transition-all shadow-sm bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white`}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-black text-lg leading-tight mb-1 text-slate-900`}>{quote.brand}</p>
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{quote.quote_no}</span>
                                                            <span>•</span>
                                                            <span className="text-slate-500">{new Date(quote.sent_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Middle: Description/Location */}
                                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 truncate">
                                                        <MapPin size={18} className="text-rose-500 flex-shrink-0" />
                                                        {quote.location}, {quote.city}
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <p className={`text-sm truncate font-medium text-slate-600`}>
                                                            {quote.work_description || "No description provided."}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right: Status/Action */}
                                                <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[160px]">
                                                    <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(quote.quote_status)}`}>
                                                        {quote.quote_status.replace('_', ' ')}
                                                    </div>

                                                    {quote.mr_priority !== 'Normal' && (
                                                        <div className="flex items-center gap-1" title={`${quote.mr_priority} Priority`}>
                                                            {getPriorityIcon(quote.mr_priority)}
                                                        </div>
                                                    )}

                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white border border-slate-200 group-hover:border-violet-200 group-hover:text-violet-600`}>
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* MANUAL FORM - WHITE BACKGROUND */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`max-w-xl mx-auto p-10 rounded-2xl border active-section bg-white border-slate-200 shadow-xl`}
                        >
                            <h3 className={`text-2xl font-black mb-8 flex items-center gap-3 text-slate-900`}>
                                <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 border border-cyan-100"><PenTool size={24} /></div>
                                New Work Order
                            </h3>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pl-1">Job Title</label>
                                    <input
                                        type="text"
                                        className={`block w-full px-5 py-4 rounded-xl text-sm font-bold border-2 focus:outline-none focus:ring-0 transition-colors bg-white border-slate-200 text-slate-900 focus:border-cyan-500`}
                                        placeholder="e.g. Broken AC Unit"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pl-1">Location</label>
                                        <input
                                            type="text"
                                            className={`block w-full px-5 py-4 rounded-xl text-sm font-bold border-2 focus:outline-none focus:ring-0 transition-colors bg-white border-slate-200 text-slate-900 focus:border-cyan-500`}
                                            placeholder="Site Location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pl-1">Priority</label>
                                        <select
                                            className={`block w-full px-5 py-4 rounded-xl text-sm font-bold border-2 focus:outline-none focus:ring-0 transition-colors bg-white border-slate-200 text-slate-900 focus:border-cyan-500`}
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option>Normal</option>
                                            <option>High</option>
                                            <option>Critical</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pl-1">Description</label>
                                    <textarea
                                        rows="4"
                                        className={`block w-full px-5 py-4 rounded-xl text-sm font-bold border-2 focus:outline-none focus:ring-0 transition-colors bg-white border-slate-200 text-slate-900 focus:border-cyan-500`}
                                        placeholder="Detailed scope of work..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    className="w-full py-5 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-xl shadow-lg shadow-cyan-200 active:scale-[0.99] transition-all mt-4 uppercase tracking-widest text-xs"
                                    onClick={() => toast.success('Manual job creation coming soon!')}
                                >
                                    Create Assignment
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ASSIGNMENT MODAL - STRICTLY WHITE FORM */}
            {assignModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s]" onClick={() => setAssignModalOpen(false)}></div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative z-10 overflow-hidden bg-white`}
                    >
                        {/* Header - Strictly White */}
                        <div className={`px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-20`}>
                            <div>
                                <h3 className={`font-black text-2xl tracking-tight text-slate-900`}>Assign Technician</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide">ID: {quoteToAssign?.quote_no}</span>
                                    <span className="text-sm font-bold text-violet-900">{quoteToAssign?.brand}</span>
                                </div>
                            </div>
                            <button onClick={() => setAssignModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-colors"><X size={20} /></button>
                        </div>

                        {/* Scrollable Content - Strictly White */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                            {/* Job Info */}
                            <div className="px-8 py-6 bg-white border-b border-slate-100">
                                <div className="text-sm space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-slate-900 font-bold text-[10px] uppercase tracking-wider block mb-1">Location</span>
                                            <span className={`font-bold text-base flex items-center gap-1.5 text-slate-900`}>
                                                <MapPin size={16} className="text-rose-500" />
                                                {quoteToAssign?.location}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-900 font-bold text-[10px] uppercase tracking-wider block mb-1">Priority</span>
                                            <span className={`font-bold text-base text-slate-900`}>{quoteToAssign?.mr_priority}</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-dashed border-slate-200">
                                        <span className="text-slate-900 font-bold text-[10px] uppercase tracking-wider block mb-1">Work Description</span>
                                        <p className={`text-sm leading-relaxed font-bold text-slate-700`}>{quoteToAssign?.work_description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Technician Selection - Strictly White TABLE STYLE */}
                            <div className="px-8 py-4 bg-white">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                                    <User size={16} className="text-violet-500" /> Select Technician
                                </h4>
                                <div className="space-y-1">
                                    {technicians
                                        .sort((a, b) => {
                                            const aRegionMatch = a.region === quoteToAssign.region;
                                            const bRegionMatch = b.region === quoteToAssign.region;
                                            if (aRegionMatch && !bRegionMatch) return -1;
                                            if (!aRegionMatch && bRegionMatch) return 1;
                                            return a.activeJobs - b.activeJobs;
                                        })
                                        .map(tech => {
                                            const isRecommended = tech.region === quoteToAssign.region && tech.activeJobs < 3;
                                            const isSelected = selectedTech === tech.id;
                                            return (
                                                <button
                                                    key={tech.id}
                                                    onClick={() => setSelectedTech(tech.id)}
                                                    className={`w-full p-4 transition-all text-left flex items-center gap-4 group rounded-xl border-b border-transparent
                                            ${isSelected
                                                            ? 'bg-white border-violet-100 ring-2 ring-violet-600 ring-inset scale-[1.01] shadow-lg shadow-violet-100 z-10'
                                                            : 'bg-white border-b-slate-100 hover:bg-slate-50 hover:pl-6'}`}
                                                >
                                                    {/* Avatar - Dashboard Style */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors 
                                                    ${isSelected
                                                            ? 'bg-violet-600 text-white'
                                                            : 'bg-indigo-50 text-indigo-700'
                                                        }`}>
                                                        {tech.avatar}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <p className={`font-bold text-base truncate ${isSelected ? 'text-violet-900' : 'text-slate-900'}`}>{tech.name}</p>
                                                            {isRecommended && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase tracking-wide">Best Match</span>}
                                                        </div>
                                                        <div className="flex gap-3 text-xs font-bold">
                                                            <span className={tech.activeJobs > 4 ? 'text-rose-600' : 'text-slate-500'}>{tech.activeJobs} Jobs</span>
                                                            <span className={tech.region === quoteToAssign.region ? 'text-violet-600' : 'text-slate-500'}>{tech.region}</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && <Check size={20} className="text-violet-600" />}
                                                    {!isSelected && <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-violet-300"></div>}
                                                </button>
                                            )
                                        })}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="px-8 pb-8 bg-white pt-4">
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2">Instructions</label>
                                <textarea
                                    rows="3"
                                    className={`w-full px-5 py-4 border-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-0 focus:border-violet-500 transition-colors bg-white border-slate-200 text-slate-900`}
                                    placeholder="Add specialized instructions here..."
                                    value={assignmentNotes}
                                    onChange={(e) => setAssignmentNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-6 border-t border-slate-100 flex gap-4 bg-white z-20">
                            <button
                                onClick={() => setAssignModalOpen(false)}
                                className="flex-1 py-4 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all border-2 border-slate-100 hover:border-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleQuickAssign}
                                disabled={!selectedTech || assigning}
                                className={`flex-[2] py-4 rounded-xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide
                                    ${!selectedTech || assigning
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'}`}
                            >
                                {assigning ? 'Assigning...' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default WorkAssignment;
