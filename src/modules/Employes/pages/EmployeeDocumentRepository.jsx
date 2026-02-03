import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Search, FileDown, CheckCircle, AlertCircle,
    AlertTriangle, Shield, CheckSquare, Square, FileStack
} from 'lucide-react';
import IDCollectionModal from '../components/IDCollectionModal';
import API_BASE_URL from '../../../config/api';
import { FileText } from 'lucide-react';

const EmployeeDocumentRepository = ({ employees = [] }) => {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [showIDModal, setShowIDModal] = useState(false);

    // Filter Logic
    const filteredEmployees = employees.filter(emp =>
        (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.role || emp.position || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helpers
    const checkExpiry = (dateString) => {
        if (!dateString) return { status: 'ok' };
        const today = new Date();
        const expiry = new Date(dateString);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { status: 'expired', days: diffDays };
        if (diffDays < 30) return { status: 'warning', days: diffDays };
        return { status: 'ok' };
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkExport = (type) => {
        const count = selectedIds.length;
        if (count === 0) return;
        alert(`Initiating Bulk Download...\n\nType: ${type}\nTotal Files: ${count}`);
    };

    const selectedEmployees = employees.filter(emp => selectedIds.includes(emp.id));

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out] overflow-y-auto">
            {/* ID Collection Modal */}
            {showIDModal && (
                <IDCollectionModal
                    selectedEmployees={selectedEmployees}
                    onClose={() => setShowIDModal(false)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Document Repository</h1>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Manage and bulk export employee identification documents.
                    </p>
                </div>

                {/* Search Bar */}
                <div className={`flex items-center px-4 py-2.5 rounded-xl border w-full max-w-md shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className={`bg-transparent outline-none w-full text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bulk Action Bar */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-3 rounded-xl border mb-6 transition-all shadow-sm backdrop-blur-md
                ${selectedIds.length > 0
                    ? (darkMode ? 'bg-blue-900/40 border-blue-800' : 'bg-blue-50/90 border-blue-200')
                    : 'hidden' // Hide if nothing selected to keep clean
                }`}>

                <div className="flex flex-wrap items-center gap-4 w-full animate-[fadeIn_0.2s_ease-out]">
                    <span className={`font-bold ml-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        {selectedIds.length} Selected
                    </span>
                    <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

                    <button
                        onClick={() => setShowIDModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all text-sm font-bold"
                    >
                        <FileStack size={16} /> Work Permission ID Generator
                    </button>

                    <button
                        onClick={() => handleBulkExport('Iqama')}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        <FileDown size={16} className="text-blue-500" /> Export Iqamas
                    </button>
                    <button
                        onClick={() => handleBulkExport('Passport')}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        <FileDown size={16} className="text-purple-500" /> Export Passports
                    </button>

                    <button
                        onClick={() => setSelectedIds([])}
                        className="ml-auto text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
                    >
                        Clear Selection
                    </button>
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                {filteredEmployees.map(emp => {
                    const iqama = checkExpiry(emp.iqama_expiry || emp.iqamaExpiry);
                    const passport = checkExpiry(emp.passport_expiry || emp.passportExpiry);
                    const isSelected = selectedIds.includes(emp.id);
                    const role = emp.position || emp.role || 'Employee';

                    return (
                        <div
                            key={emp.id}
                            onClick={() => toggleSelect(emp.id)}
                            className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-300 group
                                ${isSelected
                                    ? (darkMode ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-blue-500 ring-2 ring-blue-500/30')
                                    : (darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:-translate-y-1 hover:shadow-xl' : 'bg-white border-gray-200 hover:border-blue-300 hover:-translate-y-1 hover:shadow-xl')
                                }`}
                        >
                            {/* Decorative Background Header */}
                            <div className={`h-20 w-full absolute top-0 left-0 bg-gradient-to-r 
                                ${role.includes('Dev') ? 'from-blue-500 to-indigo-600' :
                                    role.includes('Design') ? 'from-pink-500 to-rose-600' :
                                        role.includes('Manager') ? 'from-purple-500 to-violet-600' :
                                            'from-gray-500 to-slate-600'} opacity-90`} />

                            {/* Selection Checkbox */}
                            <div className="absolute top-2 right-2 z-20 text-white drop-shadow-md">
                                {isSelected ? <CheckSquare size={20} className="text-white bg-blue-600 rounded" /> : <Square size={20} className="opacity-70 group-hover:opacity-100" />}
                            </div>

                            {/* Card Content */}
                            <div className="pt-10 px-4 pb-4 relative z-10 flex flex-col items-center">
                                {/* Avatar */}
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2 shadow-lg border-4 overflow-hidden
                                    ${darkMode ? 'border-gray-800 bg-gray-700 text-white' : 'border-white bg-gray-100 text-gray-700'}`}>
                                    {emp.avatar_url ? (
                                        <img src={emp.avatar_url.startsWith('http') ? emp.avatar_url : `${API_BASE_URL}${emp.avatar_url.startsWith('/') ? emp.avatar_url : '/' + emp.avatar_url}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (emp.name || '?').charAt(0)
                                    )}
                                </div>

                                <h3 className={`font-bold text-base text-center mb-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{emp.name || 'Unknown'}</h3>
                                <p className={`text-[10px] font-medium uppercase tracking-wider mb-4 px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                                    {role}
                                </p>

                                {/* Document Status Section */}
                                <div className="w-full space-y-2">
                                    {/* Iqama */}
                                    <div className={`flex items-center justify-between p-2 rounded-lg border transition-colors
                                        ${iqama.status === 'expired' ? 'bg-red-50/50 border-red-200' :
                                            iqama.status === 'warning' ? 'bg-orange-50/50 border-orange-200' :
                                                (darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100')}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded-md ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-sm`}>
                                                <Shield size={12} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className={`text-[10px] font-semibold text-gray-500 uppercase`}>Iqama</span>
                                                <span className={`text-xs font-mono font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{emp.iqama_no || emp.iqama || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[10px] ${iqama.status === 'ok' ? 'text-green-600' : 'text-red-500'} font-bold`}>{iqama.status === 'ok' ? 'Valid' : 'Expired'}</div>
                                            <div className="text-[9px] text-gray-400">{emp.iqama_expiry || emp.iqamaExpiry || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {/* Passport */}
                                    <div className={`flex items-center justify-between p-2 rounded-lg border transition-colors
                                        ${passport.status === 'expired' ? 'bg-red-50/50 border-red-200' :
                                            passport.status === 'warning' ? 'bg-orange-50/50 border-orange-200' :
                                                (darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100')}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded-md ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-sm`}>
                                                <FileText size={12} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className={`text-[10px] font-semibold text-gray-500 uppercase`}>Passport</span>
                                                <span className={`text-xs font-mono font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{emp.passport_no || emp.passport || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[10px] ${passport.status === 'ok' ? 'text-green-600' : 'text-red-500'} font-bold`}>{passport.status === 'ok' ? 'Valid' : 'Expired'}</div>
                                            <div className="text-[9px] text-gray-400">{emp.passport_expiry || emp.passportExpiry || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EmployeeDocumentRepository;
