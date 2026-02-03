import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api'; // Ensure this matches your project config
import { useTheme } from '../../../context/ThemeContext';
import {
    FileText,
    Shield,
    AlertTriangle,
    CheckCircle,
    Calendar,
    Download,
    Eye,
    Plus,
    Search,
    Building2,
    Stamp,
    FileCheck,
    X,
    UploadCloud,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CompanyDocuments = () => {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Form State
    const [newDoc, setNewDoc] = useState({
        title: '',
        type: 'Other',
        issuer: '',
        number: '',
        issue_date: '',
        expiry_date: '',
        attachment: null
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/company-documents`);
            if (res.data.success) {
                setDocuments(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setNewDoc({ ...newDoc, attachment: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newDoc.attachment) return toast.error('Please select a file');

        const formData = new FormData();
        formData.append('title', newDoc.title);
        formData.append('type', newDoc.type);
        formData.append('issuer', newDoc.issuer);
        formData.append('number', newDoc.number);
        formData.append('issue_date', newDoc.issue_date);
        formData.append('expiry_date', newDoc.expiry_date);
        formData.append('attachment', newDoc.attachment);

        const toastId = toast.loading('Uploading document...');
        try {
            await axios.post(`${API_BASE_URL}/api/company-documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Document uploaded successfully!', { id: toastId });
            setShowUploadModal(false);
            setNewDoc({
                title: '', type: 'Other', issuer: '', number: '',
                issue_date: '', expiry_date: '', attachment: null
            });
            fetchDocuments();
        } catch (error) {
            console.error(error);
            toast.error('Upload failed. check console.', { id: toastId });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'VALID': return 'text-green-500 bg-green-100 dark:bg-green-500/20';
            case 'WARNING': return 'text-orange-500 bg-orange-100 dark:bg-orange-500/20';
            case 'EXPIRED': return 'text-red-500 bg-red-100 dark:bg-red-500/20';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    const getDaysRemaining = (expiry) => {
        if (!expiry) return 0;
        const diff = new Date(expiry) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const filteredDocs = documents.filter(doc =>
        (selectedType === 'ALL' || doc.type === selectedType) &&
        (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || (doc.number && doc.number.includes(searchTerm)))
    );

    const stats = {
        total: documents.length,
        valid: documents.filter(d => d.status === 'VALID').length,
        expiring: documents.filter(d => d.status === 'WARNING').length,
        expired: documents.filter(d => d.status === 'EXPIRED').length,
    };

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out] overflow-y-auto relative">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Company Documents</h1>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Manage, track, and secure all official company documentation.
                    </p>
                </div>

                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-bold"
                >
                    <Plus size={20} />
                    <span>Upload Document</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><FileText size={20} /></div>
                        <span className="text-2xl font-black">{stats.total}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Documents</p>
                </div>
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
                        <span className="text-2xl font-black">{stats.valid}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Active & Valid</p>
                </div>
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg"><AlertTriangle size={20} /></div>
                        <span className="text-2xl font-black">{stats.expiring}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Expiring Soon</p>
                </div>
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
                        <span className="text-2xl font-black">{stats.expired}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Action Required</p>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className={`flex items-center px-4 py-2.5 rounded-xl border w-full max-w-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input type="text" placeholder="Search..." className={`bg-transparent outline-none w-full text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL', 'Legal', 'Finance', 'License', 'HR', 'Insurance'].map(type => (
                        <button key={type} onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                                ${selectedType === type ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
                    <p className="font-bold tracking-tight">Loading Secure Documents...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {filteredDocs.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                            <p className="text-gray-400 font-bold">No documents found matching your search.</p>
                        </div>
                    )}
                    {filteredDocs.map(doc => {
                        const daysRemaining = getDaysRemaining(doc.expiry_date);
                        const status = doc.status || 'VALID';

                        let Icon = FileText;
                        let colorClass = "blue";
                        if (doc.type === 'Legal') { Icon = Building2; colorClass = "purple"; }
                        if (doc.type === 'Finance') { Icon = FileCheck; colorClass = "green"; }
                        if (doc.type === 'License') { Icon = Stamp; colorClass = "orange"; }
                        if (doc.type === 'Insurance') { Icon = Shield; colorClass = "indigo"; }

                        return (
                            <div key={doc.id} className={`group relative p-6 rounded-3xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col
                                ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-100'}`}>

                                {/* Status Badge */}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                                    ${getStatusColor(status)}`}>
                                    {status === 'WARNING' ? `Expires in ${daysRemaining}d` : status}
                                </div>

                                {/* Icon Bagde */}
                                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3
                                    ${darkMode ? 'bg-gray-700 text-gray-100' : `bg-${colorClass}-50 text-${colorClass}-600`}`}>
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>

                                <div className="flex-1">
                                    <h3 className={`font-black text-xl leading-tight mb-2 tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                                        {doc.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-${colorClass}-500`}></div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">{doc.issuer || 'Official Entity'}</p>
                                    </div>

                                    <div className={`p-4 rounded-2xl space-y-3 mb-6 ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-gray-400">Reference No.</span>
                                            <span className={`text-xs font-mono font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{doc.number || 'MAAJ-000'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-gray-400">Expiry Schedule</span>
                                            <span className={`text-xs font-bold ${status === 'EXPIRED' ? 'text-red-500' : status === 'WARNING' ? 'text-orange-500' : 'text-gray-700'}`}>
                                                {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'PERMANENT'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {doc.attachment_url && (
                                        <a
                                            href={doc.attachment_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
                                        >
                                            <Eye size={16} /> VIEW DOCUMENT
                                        </a>
                                    )}
                                    <button className={`p-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl animate-[slideIn_0.3s_ease-out] ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upload New Document</h2>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Document Title</label>
                                <input type="text" required value={newDoc.title} onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} placeholder="e.g. VAT Certificate" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Type</label>
                                    <select value={newDoc.type} onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}
                                        className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                                        <option value="Other">Other</option>
                                        <option value="Legal">Legal</option>
                                        <option value="Finance">Finance</option>
                                        <option value="License">License</option>
                                        <option value="HR">HR</option>
                                        <option value="Insurance">Insurance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Doc Number</label>
                                    <input type="text" value={newDoc.number} onChange={e => setNewDoc({ ...newDoc, number: e.target.value })}
                                        className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} placeholder="License No." />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Issue Date</label>
                                    <input type="date" value={newDoc.issue_date} onChange={e => setNewDoc({ ...newDoc, issue_date: e.target.value })}
                                        className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expiry Date</label>
                                    <input type="date" value={newDoc.expiry_date} onChange={e => setNewDoc({ ...newDoc, expiry_date: e.target.value })}
                                        className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Issuer</label>
                                <input type="text" value={newDoc.issuer} onChange={e => setNewDoc({ ...newDoc, issuer: e.target.value })}
                                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} placeholder="e.g. Ministry of Commerce" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Attachment</label>
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-blue-200 hover:bg-blue-50'}`}>
                                    <input type="file" onChange={handleFileChange} className="hidden" id="doc-upload" />
                                    <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <UploadCloud size={32} className="text-blue-500" />
                                        <span className="text-sm font-bold text-gray-500">{newDoc.attachment ? newDoc.attachment.name : 'Click to Upload Invoice / PDF'}</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                                Save Document
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyDocuments;
