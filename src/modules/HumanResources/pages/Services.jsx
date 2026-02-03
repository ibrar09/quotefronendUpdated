import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Calendar, DollarSign, Box, FileText,
    Shield, Briefcase, ChevronRight, Clock, Plus,
    Download, CheckCircle, AlertCircle, Search, Eye
} from 'lucide-react';
import {
    getLeaves, getMyAssets, requestLeave, getMyDocuments,
    getPayrollDetails, getExpenses, requestExpense
} from '../../UserPortal/services/portal.service';
import { toast } from 'react-hot-toast';

const Services = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [activeService, setActiveService] = useState(null); // 'LEAVES', 'ASSETS', 'PAYROLL', 'DOCS'

    const [leaves, setLeaves] = useState([]);
    const [assets, setAssets] = useState([]);
    const [documents, setDocuments] = useState(null);
    const [payroll, setPayroll] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showRequestForm, setShowRequestForm] = useState(false);
    const [leaveRequest, setLeaveRequest] = useState({ type: 'ANNUAL', start_date: '', end_date: '', reason: '' });
    const [expenseRequest, setExpenseRequest] = useState({ amount: '', category: 'General', description: '', image: null });

    useEffect(() => {
        if (activeService === 'LEAVES') fetchLeaves();
        if (activeService === 'ASSETS') fetchAssets();
        if (activeService === 'DOCS') fetchDocuments();
        if (activeService === 'PAYROLL') fetchPayroll();
        if (activeService === 'EXPENSES') fetchExpenses();
    }, [activeService]);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const data = await getLeaves();
            setLeaves(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const data = await getMyAssets();
            setAssets(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await getMyDocuments();
            if (res.success) setDocuments(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const res = await getPayrollDetails();
            if (res.success) setPayroll(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await getExpenses();
            if (res.success) setExpenses(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            await requestLeave(leaveRequest);
            setShowRequestForm(false);
            fetchLeaves();
            setLeaveRequest({ type: 'ANNUAL', start_date: '', end_date: '', reason: '' });
            toast.success('Leave requested!');
        } catch (error) {
            console.error("Error requesting leave:", error);
            toast.error('Failed to request leave');
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!expenseRequest.amount || !expenseRequest.image) {
            return toast.error('Amount and Receipt image are required');
        }
        setLoading(true);
        try {
            await requestExpense(expenseRequest);
            setShowRequestForm(false);
            fetchExpenses();
            setExpenseRequest({ amount: '', category: 'General', description: '', image: null });
            toast.success('Fatora submitted for review');
        } catch (error) {
            console.error("Error requesting expense:", error);
            toast.error('Failed to submit fatora');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setExpenseRequest({ ...expenseRequest, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const annualTotal = 30;
    const sickTotal = 15;
    const annualUsed = leaves.filter(l => l.type === 'ANNUAL' && l.status === 'APPROVED').reduce((acc, curr) => acc + curr.days, 0);
    const sickUsed = leaves.filter(l => l.type === 'SICK' && l.status === 'APPROVED').reduce((acc, curr) => acc + curr.days, 0);

    const leaveBalances = [
        { type: 'Annual', balance: 0, total: 30, color: 'bg-blue-500' },
        { type: 'Sick', balance: 0, total: 15, color: 'bg-red-500' }
    ];

    const ServicesGrid = () => (
        <div className="p-5 animate-[fadeIn_0.3s_ease-out]">
            <h1 className="text-2xl font-black mb-6">HR Services</h1>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/user/hr/attendance')}
                    className={`col-span-2 p-6 rounded-3xl text-left relative overflow-hidden transition-transform active:scale-95
                    ${darkMode ? 'bg-gradient-to-r from-green-900 to-green-800' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'}`}
                >
                    <div className="relative z-10">
                        <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                            <MapPin size={24} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold">Attendance</h3>
                        <p className="text-green-100 text-sm font-medium opacity-90">Check-in, Check-out, Location</p>
                    </div>
                </button>

                <button
                    onClick={() => setActiveService('LEAVES')}
                    className={`p-5 rounded-3xl text-left border transition-all active:scale-95
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                    <div className="bg-blue-100 dark:bg-blue-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-blue-600">
                        <Calendar size={20} />
                    </div>
                    <h3 className="font-bold">Leaves</h3>
                    <p className="text-xs text-gray-400 mt-1">Vacation & Sick</p>
                </button>

                <button
                    onClick={() => toast.error('Payroll section is currently locked for review.')}
                    className={`p-5 rounded-3xl text-left border transition-all active:scale-95 group relative
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm opacity-80'}`}
                >
                    <div className="absolute top-4 right-4 text-gray-400 group-hover:text-red-500 transition-colors">
                        <Shield size={16} />
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-purple-600">
                        <DollarSign size={20} />
                    </div>
                    <h3 className="font-bold flex items-center gap-2">
                        Payroll
                    </h3>
                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">Access Restricted</p>
                </button>

                <button
                    onClick={() => setActiveService('ASSETS')}
                    className={`p-5 rounded-3xl text-left border transition-all active:scale-95
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                    <div className="bg-orange-100 dark:bg-orange-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-orange-600">
                        <Box size={20} />
                    </div>
                    <h3 className="font-bold">My Assets</h3>
                    <p className="text-xs text-gray-400 mt-1">Company Custody</p>
                </button>

                <button
                    onClick={() => setActiveService('DOCS')}
                    className={`p-5 rounded-3xl text-left border transition-all active:scale-95
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                    <div className="bg-red-100 dark:bg-red-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-red-600">
                        <FileText size={20} />
                    </div>
                    <h3 className="font-bold">Docs</h3>
                    <p className="text-xs text-gray-400 mt-1">Official Documents</p>
                </button>

                <button
                    onClick={() => setActiveService('EXPENSES')}
                    className={`p-5 rounded-3xl text-left border transition-all active:scale-95
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                    <div className="bg-yellow-100 dark:bg-yellow-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-yellow-600">
                        <DollarSign size={20} />
                    </div>
                    <h3 className="font-bold">Fatora</h3>
                    <p className="text-xs text-gray-400 mt-1">Expense Claims</p>
                </button>
            </div>
        </div>
    );

    const LeavesView = () => (
        <div className="flex flex-col h-full animate-[slideIn_0.2s_ease-out]">
            <div className="p-4 border-b flex items-center gap-3">
                <button onClick={() => setActiveService(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight className="rotate-180" /></button>
                <h2 className="text-xl font-bold">Leave Management</h2>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {leaveBalances.map((b, i) => (
                        <div key={i} className={`min-w-[140px] p-4 rounded-2xl text-white ${b.color}`}>
                            <p className="text-white/80 text-xs font-bold uppercase mb-1">{b.type}</p>
                            <h3 className="text-3xl font-black">{b.balance}</h3>
                            <p className="text-xs opacity-70">Days Available</p>
                        </div>
                    ))}
                </div>
                {showRequestForm ? (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <div className={`p-6 rounded-[2rem] border-2 shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-50'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-2xl">
                                    <Plus size={24} strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">Apply Leave</h3>
                                    <p className="text-xs text-gray-400 font-medium">HR Review Required</p>
                                </div>
                            </div>
                            <form onSubmit={handleLeaveSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Leave Category</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Calendar size={18} />
                                        </div>
                                        <select
                                            value={leaveRequest.type}
                                            onChange={e => setLeaveRequest({ ...leaveRequest, type: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 font-bold outline-none transition-all appearance-none
                                                ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-100 focus:border-blue-500 focus:bg-white text-gray-900'}`}
                                        >
                                            <option value="ANNUAL">Annual Vacation</option>
                                            <option value="SICK">Medical / Sick Leave</option>
                                            <option value="EMERGENCY">Emergency Leave</option>
                                            <option value="UNPAID">Unpaid Leave</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">From Date</label>
                                        <input
                                            type="date"
                                            value={leaveRequest.start_date}
                                            onChange={e => setLeaveRequest({ ...leaveRequest, start_date: e.target.value })}
                                            className={`w-full px-4 py-3.5 rounded-2xl border-2 font-bold outline-none transition-all
                                                ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-blue-500 text-white shadow-inner' : 'bg-gray-50 border-gray-100 focus:border-blue-500 focus:bg-white text-gray-900'}`}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">To Date</label>
                                        <input
                                            type="date"
                                            value={leaveRequest.end_date}
                                            onChange={e => setLeaveRequest({ ...leaveRequest, end_date: e.target.value })}
                                            className={`w-full px-4 py-3.5 rounded-2xl border-2 font-bold outline-none transition-all
                                                ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-blue-500 text-white shadow-inner' : 'bg-gray-50 border-gray-100 focus:border-blue-500 focus:bg-white text-gray-900'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reason / Notes</label>
                                    <textarea
                                        placeholder="Enter details for HR approval..."
                                        value={leaveRequest.reason}
                                        onChange={e => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                                        className={`w-full p-4 rounded-2xl border-2 font-medium outline-none transition-all min-h-[100px]
                                            ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-100 focus:border-blue-500 focus:bg-white text-gray-900'}`}
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowRequestForm(false)}
                                        className={`flex-1 py-4 font-black transition-all rounded-2xl border-2
                                            ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 active:scale-95 transition-all hover:bg-blue-700"
                                    >
                                        Send Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" />
                            Recent Requests
                        </h3>
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leaves.length === 0 && (
                                    <div className="text-center py-10 opacity-50 font-medium italic">No leave history found.</div>
                                )}
                                {leaves.map(leave => (
                                    <div key={leave.id} className={`p-5 rounded-3xl border-2 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer flex justify-between items-center 
                                        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-50/50'}`}>
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                                                ${leave.type === 'SICK' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <Calendar size={22} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm capitalize leading-tight">
                                                    {leave.type.toLowerCase().replace('_', ' ')} Leave
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-bold mt-0.5">
                                                    {new Date(leave.start_date).toLocaleDateString()} • {leave.days} {leave.days === 1 ? 'Day' : 'Days'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm
                                                ${leave.status === 'PENDING' ? 'text-orange-500 bg-orange-100 border border-orange-200/50' :
                                                    leave.status === 'APPROVED' ? 'text-green-500 bg-green-100 border border-green-200/50' :
                                                        'text-red-500 bg-red-100 border border-red-200/50'}`}>
                                                {leave.status}
                                            </span>
                                            <ChevronRight size={18} className="text-gray-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {!showRequestForm && (
                <div className="p-4 border-t mt-auto">
                    <button onClick={() => setShowRequestForm(true)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30">Request New Leave</button>
                </div>
            )}
        </div>
    );

    const AssetsView = () => (
        <div className="flex flex-col h-full animate-[slideIn_0.2s_ease-out]">
            <div className="p-4 border-b flex items-center gap-3">
                <button onClick={() => setActiveService(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight className="rotate-180" /></button>
                <h2 className="text-xl font-bold">My Custody</h2>
            </div>
            <div className="p-5 grid gap-4 overflow-y-auto">
                {loading ? <p>Loading assets...</p> : assets.length === 0 ? <p className="text-gray-500">No assets assigned.</p> : assets.map(asset => (
                    <div key={asset.id} className={`p-4 rounded-xl border flex items-center gap-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600"><Box size={20} /></div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">{asset.name}</h4>
                            <p className="text-xs text-gray-500">{asset.serial_no || 'No Serial'} • {asset.category}</p>
                        </div>
                        <CheckCircle size={18} className="text-green-500" />
                    </div>
                ))}
            </div>
        </div>
    );

    const PayrollView = () => (
        <div className="flex flex-col h-full animate-[slideIn_0.2s_ease-out]">
            <div className="p-4 border-b flex items-center gap-3">
                <button onClick={() => setActiveService(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight className="rotate-180" /></button>
                <h2 className="text-xl font-bold">My Payroll</h2>
            </div>
            <div className="p-5 space-y-6 overflow-y-auto">
                <div className={`p-6 rounded-3xl text-white shadow-lg ${darkMode ? 'bg-gradient-to-br from-purple-900 to-indigo-900' : 'bg-gradient-to-br from-purple-600 to-indigo-600'}`}>
                    <p className="text-purple-100 text-xs font-bold uppercase mb-1">Current Package</p>
                    <h3 className="text-4xl font-black mb-4">{payroll?.total ? payroll.total.toLocaleString() : '---'} SAR</h3>
                    <div className="grid grid-cols-3 gap-2 opacity-80 text-center text-xs">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <p>Basic</p>
                            <p className="font-bold text-sm">{payroll?.basic}</p>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg">
                            <p>Housing</p>
                            <p className="font-bold text-sm">{payroll?.housing}</p>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg">
                            <p>Transport</p>
                            <p className="font-bold text-sm">{payroll?.transport}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold mb-3">Payslip History</h3>
                    <div className="space-y-4">
                        {[
                            { month: 'January 2026', amount: payroll?.total || 12500, date: '25 Jan 2026' },
                            { month: 'December 2025', amount: payroll?.total || 12500, date: '25 Dec 2025' }
                        ].map((slip, i) => (
                            <div key={i} className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Salary Slip</p>
                                        <h3 className="font-bold text-lg">{slip.month}</h3>
                                    </div>
                                    <h3 className="font-mono font-bold text-lg text-green-600">{slip.amount.toLocaleString()} SAR</h3>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t dark:border-gray-700">
                                    <span className="text-xs text-gray-400">Paid on {slip.date}</span>
                                    <button className="flex items-center gap-1 text-sm font-bold text-blue-600">
                                        <Download size={16} /> PDF
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const DocsView = () => {
        const docList = [
            { key: 'iqama', label: 'Iqama / Resident ID', file: documents?.iqama },
            { key: 'passport', label: 'Passport Copy', file: documents?.passport },
            { key: 'contract', label: 'Employment Contract', file: documents?.contract },
        ];
        return (
            <div className="flex flex-col h-full animate-[slideIn_0.2s_ease-out]">
                <div className="p-4 border-b flex items-center gap-3">
                    <button onClick={() => setActiveService(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight className="rotate-180" /></button>
                    <h2 className="text-xl font-bold">My Documents</h2>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto">
                    {loading ? <p>Loading docs...</p> : docList.map((doc, i) => (
                        <div key={i} className={`p-5 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold">{doc.label}</h4>
                                <p className="text-xs text-gray-500 font-mono mt-1">{doc.file ? 'Uploaded' : 'Missing'}</p>
                            </div>
                            {doc.file ? (
                                <a href={doc.file} target="_blank" rel="noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Eye size={20} />
                                </a>
                            ) : (
                                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold">Upload</button>
                            )}
                        </div>
                    ))}
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-xs leading-relaxed">
                        <AlertCircle size={16} className="inline mr-1 mb-0.5" />
                        Please contact HR to update any missing or expired documents securely.
                    </div>
                </div>
            </div>
        );
    }

    const ExpensesView = () => (
        <div className="flex flex-col h-full animate-[slideIn_0.2s_ease-out]">
            <div className="p-4 border-b flex items-center gap-3">
                <button onClick={() => setActiveService(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight className="rotate-180" /></button>
                <h2 className="text-xl font-bold">Expense Claims (Fatora)</h2>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
                {showRequestForm ? (
                    <form onSubmit={handleExpenseSubmit} className={`p-4 rounded-xl border mb-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <h3 className="font-bold mb-3">Submit New Fatora</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Amount (SAR)</label>
                                <input type="number" step="0.01" value={expenseRequest.amount} onChange={e => setExpenseRequest({ ...expenseRequest, amount: e.target.value })} className="w-full p-2 rounded border bg-transparent" placeholder="0.00" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Category</label>
                                <select value={expenseRequest.category} onChange={e => setExpenseRequest({ ...expenseRequest, category: e.target.value })} className="w-full p-2 rounded border bg-transparent">
                                    <option value="Fuel">Fuel / Transportation</option>
                                    <option value="Supplies">Supplies / Materials</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Meals">Meals</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                                <textarea placeholder="Describe the expense..." value={expenseRequest.description} onChange={e => setExpenseRequest({ ...expenseRequest, description: e.target.value })} className="w-full p-2 rounded border bg-transparent" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Receipt Image</label>
                                <div className="flex items-center gap-3">
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="fatora-upload" />
                                    <label htmlFor="fatora-upload" className="flex-1 p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Plus size={20} />
                                        <span className="text-sm font-medium">{expenseRequest.image ? 'Image Selected' : 'Choose Receipt'}</span>
                                    </label>
                                </div>
                                {expenseRequest.image && (
                                    <div className="mt-2 relative rounded-xl overflow-hidden aspect-video border">
                                        <img src={expenseRequest.image} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setExpenseRequest({ ...expenseRequest, image: null })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><AlertCircle className="rotate-45" size={16} /></button>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowRequestForm(false)} className="flex-1 p-2 text-gray-500">Cancel</button>
                                <button type="submit" disabled={loading} className="flex-1 p-2 bg-yellow-600 text-white rounded font-bold shadow-lg shadow-yellow-500/30">
                                    {loading ? 'Uploading...' : 'Submit Claim'}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <>
                        <h3 className="font-bold mb-3">Claim History</h3>
                        {loading ? <p>Loading...</p> : (
                            <div className="space-y-3">
                                {expenses.length === 0 && <p className="text-gray-400 text-sm">No expense history found.</p>}
                                {expenses.map(exp => (
                                    <div key={exp.id} className={`p-4 rounded-xl border flex justify-between items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-yellow-600"><DollarSign size={18} /></div>
                                            <div>
                                                <p className="font-bold text-sm">{exp.amount} SAR</p>
                                                <p className="text-xs text-gray-500">{exp.category} • {new Date(exp.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${exp.status === 'PENDING' ? 'text-orange-500 bg-orange-100' : exp.status === 'APPROVED' ? 'text-green-500 bg-green-100' : 'text-red-500 bg-red-100'}`}>{exp.status}</span>
                                            {exp.attachment_url && (
                                                <a href={exp.attachment_url} target="_blank" rel="noreferrer" className="p-1.5 text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Eye size={14} /></a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {!showRequestForm && (
                <div className="p-4 border-t mt-auto">
                    <button onClick={() => setShowRequestForm(true)} className="w-full py-3 bg-yellow-600 text-white rounded-xl font-bold shadow-lg shadow-yellow-500/30">Submit New Fatora</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {!activeService && <ServicesGrid />}
            {activeService === 'LEAVES' && <LeavesView />}
            {activeService === 'ASSETS' && <AssetsView />}
            {activeService === 'PAYROLL' && <PayrollView />}
            {activeService === 'DOCS' && <DocsView />}
            {activeService === 'EXPENSES' && <ExpensesView />}
        </div>
    );
};

export default Services;
