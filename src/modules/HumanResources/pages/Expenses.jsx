import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Receipt, CheckCircle, XCircle, Clock,
    DollarSign, Filter, Search, Plus,
    FileText, Image as ImageIcon, Trash2,
    ChevronRight, AlertCircle, Download
} from 'lucide-react';
import ExpenseService from '../../../services/ExpenseService';
import EmployeeService from '../../../services/EmployeeService';
import API_BASE_URL from '../../../config/api';

const Expenses = () => {
    const { darkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State for Manual Addition
    const [formData, setFormData] = useState({
        employee_id: '',
        amount: '',
        category: 'Fuel',
        description: '',
        status: 'APPROVED'
    });
    const [attachment, setAttachment] = useState(null);

    const categories = ['Fuel', 'Supplies', 'Official Travel', 'Maintenance', 'Food', 'Others'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expRes, empRes] = await Promise.all([
                ExpenseService.getAllExpenses(),
                EmployeeService.getAllEmployees()
            ]);

            if (expRes.success) setExpenses(expRes.data);
            if (empRes.success) setEmployees(empRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (id, status, reason = '') => {
        try {
            const res = await ExpenseService.updateExpenseStatus(id, { status, rejection_reason: reason });
            if (res.success) {
                setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status, rejection_reason: reason } : exp));
                if (selectedExpense?.id === id) {
                    setSelectedExpense({ ...selectedExpense, status, rejection_reason: reason });
                }
            } else {
                alert(res.message || "Failed to update status");
            }
        } catch (error) {
            alert("Error updating expense");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense record?")) return;
        try {
            const res = await ExpenseService.deleteExpense(id);
            if (res.success) {
                setExpenses(expenses.filter(e => e.id !== id));
                setSelectedExpense(null);
            } else {
                alert(res.message || "Failed to delete record");
            }
        } catch (error) {
            alert("Error deleting expense");
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('employee_id', formData.employee_id);
            data.append('amount', formData.amount);
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('status', formData.status);
            if (attachment) {
                data.append('attachment', attachment);
            }

            const res = await ExpenseService.createExpense(data);
            if (res.success) {
                setShowAddModal(false);
                setFormData({
                    employee_id: '',
                    amount: '',
                    category: 'Fuel',
                    description: '',
                    status: 'APPROVED'
                });
                setAttachment(null);
                fetchData();
            } else {
                alert(res.message || "Failed to create expense");
            }
        } catch (error) {
            alert("Error creating expense");
        }
    };

    const resolveUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/${path.replace(/\\/g, '/')}`;
    };

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch =
            exp.Employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.Employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === 'All' || exp.status === filter;
        return matchesSearch && matchesFilter;
    });

    // Stats
    const stats = {
        totalPending: expenses.filter(e => e.status === 'PENDING').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
        pendingCount: expenses.filter(e => e.status === 'PENDING').length,
        approvedMonth: expenses.filter(e => e.status === 'APPROVED' && new Date(e.createdAt).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Claims</p>
                            <p className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pendingCount}</p>
                        </div>
                    </div>
                </div>
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Amount</p>
                            <p className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>SAR {stats.totalPending.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Approved This Month</p>
                            <p className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>SAR {stats.approvedMonth.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Expenses & Fatori</h1>
                    <p className="text-sm text-gray-500">Review and approve employee expense claims</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className={`flex items-center px-3 py-2 rounded-xl border flex-1 md:w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search employee or description..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Add Record
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                {['All', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                        ${filter === f
                                ? 'bg-blue-600 text-white shadow-lg'
                                : `${darkMode ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-50 border'}`}`}
                    >
                        {f === 'All' ? 'All Claims' : f}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* List Pane */}
                <div className={`flex-1 rounded-2xl border overflow-hidden flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className={`sticky top-0 z-10 text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredExpenses.map((expense) => (
                                    <tr
                                        key={expense.id}
                                        onClick={() => setSelectedExpense(expense)}
                                        className={`group cursor-pointer transition-colors ${selectedExpense?.id === expense.id ? (darkMode ? 'bg-blue-900/10' : 'bg-blue-50') : (darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden">
                                                    {expense.Employee?.avatar_url ? (
                                                        <img src={resolveUrl(expense.Employee.avatar_url)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        expense.Employee?.first_name?.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {expense.Employee?.first_name} {expense.Employee?.last_name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-medium">{expense.Employee?.position || 'Employee'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900/30 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-sm">
                                            SAR {parseFloat(expense.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(expense.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${getStatusStyle(expense.status)}`}>
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight size={16} className={`transition-transform ${selectedExpense?.id === expense.id ? 'translate-x-1 text-blue-500' : 'text-gray-300'}`} />
                                        </td>
                                    </tr>
                                ))}
                                {filteredExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <Receipt size={48} className="mx-auto text-gray-300 mb-4 opacity-50" />
                                            <p className="text-gray-500 font-medium italic">No expense claims found matching your criteria</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Pane */}
                <div className={`w-1/3 rounded-2xl border p-6 flex flex-col overflow-hidden transition-all ${selectedExpense ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none w-0 !p-0'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {selectedExpense && (
                        <div className="flex flex-col h-full animate-[fadeIn_0.2s_ease-out]">
                            <h2 className={`text-xl font-black mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Claim Details</h2>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                {/* Amount Card */}
                                <div className={`p-4 rounded-xl border-l-4 border-blue-500 ${darkMode ? 'bg-gray-900/50' : 'bg-blue-50/30'}`}>
                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Total Reimbursement</p>
                                    <p className="text-2xl font-black text-blue-600">SAR {parseFloat(selectedExpense.amount).toFixed(2)}</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-xs font-black uppercase text-gray-500 mb-2">Description</h3>
                                    <div className={`p-4 rounded-xl border text-sm leading-relaxed ${darkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                        {selectedExpense.description || 'No description provided.'}
                                    </div>
                                </div>

                                {/* Category & Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Category</p>
                                        <p className="text-sm font-bold">{selectedExpense.category}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Submitted On</p>
                                        <p className="text-sm font-bold">{new Date(selectedExpense.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Receipt Attachment */}
                                <div>
                                    <h3 className="text-xs font-black uppercase text-gray-500 mb-3 flex items-center gap-2">
                                        <ImageIcon size={14} /> Receipt / Fatora
                                    </h3>
                                    {selectedExpense.attachment_url ? (
                                        <div className="group relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 aspect-video bg-gray-900 flex items-center justify-center">
                                            <img src={resolveUrl(selectedExpense.attachment_url)} alt="Receipt" className="max-w-full max-h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <a
                                                    href={resolveUrl(selectedExpense.attachment_url)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"
                                                >
                                                    <Search size={18} />
                                                </a>
                                                <button className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform">
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 ${darkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-100 bg-gray-50'}`}>
                                            <XCircle size={32} className="text-gray-300" />
                                            <p className="text-xs text-gray-400 font-bold uppercase italic">No Receipt Attached</p>
                                        </div>
                                    )}
                                </div>

                                {selectedExpense.status === 'REJECTED' && (
                                    <div className={`p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50`}>
                                        <p className="text-xs font-black uppercase text-red-600 mb-2 flex items-center gap-2">
                                            <AlertCircle size={14} /> Rejection Reason
                                        </p>
                                        <p className="text-sm text-red-800 dark:text-red-300 italic">"{selectedExpense.rejection_reason}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {selectedExpense.status === 'PENDING' && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                    <button
                                        onClick={() => {
                                            const reason = window.prompt("Reason for rejection:");
                                            if (reason !== null) handleAction(selectedExpense.id, 'REJECTED', reason || 'Not specified');
                                        }}
                                        className="flex-1 py-3 rounded-xl font-bold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedExpense.id, 'APPROVED')}
                                        className="flex-3 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                </div>
                            )}

                            {/* HR Admin Actions */}
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => handleDelete(selectedExpense.id)}
                                    className="flex-1 py-2.5 rounded-xl font-bold border border-gray-200 text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} /> Delete Record
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
                    <div className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-[zoomIn_0.2s_ease-out] ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black italic text-blue-500">Add New Expense Entry</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><XCircle size={24} /></button>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Select Employee</label>
                                <select
                                    className={`w-full p-3 rounded-xl border outline-none font-bold text-sm ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    required
                                >
                                    <option value="">Choose employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.emp_id})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Amount (SAR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className={`w-full p-3 rounded-xl border outline-none font-bold text-sm ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Category</label>
                                    <select
                                        className={`w-full p-3 rounded-xl border outline-none font-bold text-sm ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Description / Notes</label>
                                <textarea
                                    className={`w-full p-3 rounded-xl border outline-none font-medium text-sm h-20 resize-none ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    placeholder="Briefly describe the expense..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Receipt / Fatora (Image/PDF)</label>
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <input
                                        type="file"
                                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={(e) => setAttachment(e.target.files[0])}
                                    />
                                    {attachment && <span className="text-[10px] text-green-500 font-bold">File Attached</span>}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/5`}>
                                <p className="text-xs font-bold text-blue-600 mb-1 italic">Note: Handled by HR</p>
                                <p className="text-[10px] text-gray-500">Expenses added by HR are automatically set to **APPROVED** status and logged in the system records.</p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] mt-2"
                            >
                                Confirm and Record Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Expenses;
