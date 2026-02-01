import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Receipt, CheckCircle, XCircle, Clock,
    DollarSign, Filter, Search, FileText, Image as ImageIcon
} from 'lucide-react';

const ExpenseManager = () => {
    const { darkMode } = useTheme();
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [filter, setFilter] = useState('All');

    // Mock Claims Data
    const [claims, setClaims] = useState([
        {
            id: 'EXP-001',
            employee: 'Neil Sims',
            role: 'Lead Developer',
            type: 'Travel',
            amount: 450,
            currency: 'SAR',
            date: '2024-02-20',
            status: 'Pending',
            description: 'Flight to Riyadh for client meeting',
            receipt: true
        },
        {
            id: 'EXP-002',
            employee: 'Bonnie Green',
            role: 'Designer',
            type: 'Office Supplies',
            amount: 120,
            currency: 'SAR',
            date: '2024-02-18',
            status: 'Approved',
            description: 'Sketch licenses for design team',
            receipt: true
        },
        {
            id: 'EXP-003',
            employee: 'Thomas Lean',
            role: 'DevOps',
            type: 'Food',
            amount: 75,
            currency: 'SAR',
            date: '2024-02-15',
            status: 'Rejected',
            description: 'Team lunch (Over budget)',
            receipt: false
        },
        {
            id: 'EXP-004',
            employee: 'Jese Leos',
            role: 'Manager',
            type: 'Equipment',
            amount: 2500,
            currency: 'SAR',
            date: '2024-02-10',
            status: 'Pending',
            description: 'New monitor for workstation',
            receipt: true
        }
    ]);

    const handleAction = (id, newStatus) => {
        setClaims(claims.map(c => c.id === id ? { ...c, status: newStatus } : c));
        if (selectedClaim && selectedClaim.id === id) {
            setSelectedClaim({ ...selectedClaim, status: newStatus });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        }
    };

    const filteredClaims = claims.filter(c => filter === 'All' || c.status === filter);

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Expense Claims</h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage and approve employee reimbursements</p>
                </div>
                <div className="flex gap-2">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${filter === f
                                    ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 shadow-sm')
                                    : 'text-gray-400 hover:text-gray-500'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-6 h-[calc(100%-80px)]">

                {/* Left Column: Claims List */}
                <div className={`w-1/2 rounded-2xl border overflow-hidden flex flex-col
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {filteredClaims.map(claim => (
                            <div
                                key={claim.id}
                                onClick={() => setSelectedClaim(claim)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md
                                ${selectedClaim?.id === claim.id
                                        ? (darkMode ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-200')
                                        : (darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 hover:bg-gray-50')
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                                            ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                            {claim.employee.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{claim.employee}</h4>
                                            <p className="text-xs text-gray-500">{claim.role}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(claim.status)}`}>
                                        {claim.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <div>
                                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{claim.type}</p>
                                        <p className="text-xs text-gray-500">{claim.date}</p>
                                    </div>
                                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {claim.currency} {claim.amount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Details Pane */}
                <div className={`w-1/2 rounded-2xl border p-6 flex flex-col
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>

                    {selectedClaim ? (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Claim Details</h2>
                                    <p className="text-sm text-gray-500">ID: {selectedClaim.id}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-lg border text-sm font-medium flex items-center gap-2
                                    ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                    <Receipt size={16} />
                                    {selectedClaim.currency} {selectedClaim.amount}
                                </div>
                            </div>

                            <div className="space-y-6 flex-1 overflow-y-auto">
                                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Description</h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {selectedClaim.description}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Receipt Attachment</h3>
                                    {selectedClaim.receipt ? (
                                        <div className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2
                                            ${darkMode ? 'border-gray-600 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                                            <ImageIcon size={32} className="text-gray-400" />
                                            <span className="text-sm text-gray-500">Receipt-{selectedClaim.id}.jpg</span>
                                            <button className="text-xs text-blue-500 hover:underline">View Full Size</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-800">
                                            <XCircle size={16} /> No receipt attached
                                        </div>
                                    )}
                                </div>

                                {/* Approval History Mock */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Timeline</h3>
                                    <div className="space-y-3 relative pl-4 border-l border-gray-200 dark:border-gray-700">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800" />
                                            <p className="text-xs text-gray-500">{selectedClaim.date}</p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Claim submitted by {selectedClaim.employee}</p>
                                        </div>
                                        {selectedClaim.status !== 'Pending' && (
                                            <div className="relative pt-2">
                                                <div className={`absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
                                                    ${selectedClaim.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <p className="text-xs text-gray-500">Today</p>
                                                <p className={`text-sm font-medium ${selectedClaim.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedClaim.status} by Manager
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedClaim.status === 'Pending' && (
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                    <button
                                        onClick={() => handleAction(selectedClaim.id, 'Rejected')}
                                        className="flex-1 py-2.5 rounded-xl font-semibold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedClaim.id, 'Approved')}
                                        className="flex-1 py-2.5 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Receipt size={48} className="mb-4 opacity-20" />
                            <p>Select a claim to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseManager;
