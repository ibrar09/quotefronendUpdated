import React, { useState } from 'react';
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
    FileCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CompanyDocuments = () => {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');

    // Mock Data for Company Documents
    const [documents] = useState([
        {
            id: 1,
            title: 'Commercial Registration (CR)',
            type: 'Legal',
            issuer: 'Ministry of Commerce',
            number: '1010123456',
            issueDate: '2025-01-01',
            expiryDate: '2026-01-01',
            status: 'VALID',
            attachment: '#',
            icon: Building2
        },
        {
            id: 2,
            title: 'VAT Registration Certificate',
            type: 'Finance',
            issuer: 'ZATCA',
            number: '300012345678903',
            issueDate: '2024-06-15',
            expiryDate: '2025-02-15', // Expiring Soon
            status: 'WARNING',
            attachment: '#',
            icon: ReceiptIcon
        },
        {
            id: 3,
            title: 'Municipality License (Baladiya)',
            type: 'License',
            issuer: 'Riyadh Municipality',
            number: 'LIC-998877',
            issueDate: '2023-01-01',
            expiryDate: '2024-01-01', // Expired
            status: 'EXPIRED',
            attachment: '#',
            icon: Stamp
        },
        {
            id: 4,
            title: 'GOSI Certificate',
            type: 'Insurance',
            issuer: 'GOSI',
            number: '55443322',
            issueDate: '2025-01-10',
            expiryDate: '2026-01-10',
            status: 'VALID',
            attachment: '#',
            icon: Shield
        },
        {
            id: 5,
            title: 'Saudization Certificate',
            type: 'HR',
            issuer: 'Ministry of Human Resources',
            number: 'SD-112233',
            issueDate: '2025-01-01',
            expiryDate: '2025-04-01',
            status: 'VALID',
            attachment: '#',
            icon: FileCheck
        }
    ]);

    // Helper Component for Icon
    function ReceiptIcon(props) {
        return (
            <svg
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 17V7" />
            </svg>
        )
    }


    const getStatusColor = (status) => {
        switch (status) {
            case 'VALID': return 'text-green-500 bg-green-100 dark:bg-green-500/20';
            case 'WARNING': return 'text-orange-500 bg-orange-100 dark:bg-orange-500/20';
            case 'EXPIRED': return 'text-red-500 bg-red-100 dark:bg-red-500/20';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    const getDaysRemaining = (expiry) => {
        const diff = new Date(expiry) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const filteredDocs = documents.filter(doc =>
        (selectedType === 'ALL' || doc.type === selectedType) &&
        (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.number.includes(searchTerm))
    );

    const stats = {
        total: documents.length,
        valid: documents.filter(d => d.status === 'VALID').length,
        expiring: documents.filter(d => d.status === 'WARNING').length,
        expired: documents.filter(d => d.status === 'EXPIRED').length,
    };

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out] overflow-y-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Company Documents</h1>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Manage, track, and secure all official company documentation.
                    </p>
                </div>

                <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-bold">
                    <Plus size={20} />
                    <span>Upload Document</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        <span className="text-2xl font-black">{stats.total}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Documents</p>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-2xl font-black">{stats.valid}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Active & Valid</p>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <span className="text-2xl font-black">{stats.expiring}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Expiring Soon</p>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <span className="text-2xl font-black">{stats.expired}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Expired Action Required</p>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className={`flex items-center px-4 py-2.5 rounded-xl border w-full max-w-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search document name or number..."
                        className={`bg-transparent outline-none w-full text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL', 'Legal', 'Finance', 'License', 'HR', 'Insurance'].map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                                ${selectedType === type
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                {filteredDocs.map(doc => {
                    const daysRemaining = getDaysRemaining(doc.expiryDate);
                    const Icon = doc.icon || FileText;

                    return (
                        <div key={doc.id} className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

                            {/* Status Pill */}
                            <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(doc.status)}`}>
                                {doc.status === 'WARNING' ? `Expiring in ${daysRemaining} days` : doc.status}
                            </div>

                            <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-2xl shadow-sm
                                ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
                                <Icon size={28} strokeWidth={1.5} />
                            </div>

                            <h3 className={`font-bold text-lg leading-tight mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {doc.title}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium uppercase mb-4">{doc.issuer}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Doc Number</span>
                                    <span className={`font-mono font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{doc.number}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Expiry Date</span>
                                    <span className={`font-medium ${doc.status === 'EXPIRED' ? 'text-red-500' : doc.status === 'WARNING' ? 'text-orange-500' : 'text-gray-600'}`}>
                                        {doc.expiryDate}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-auto">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Eye size={16} /> View
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors">
                                    <Download size={16} /> Download
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CompanyDocuments;
