import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { resolveUrl } from '../../../utils/url';
import { useTheme } from '../../../context/ThemeContext';
import {
    Calendar, CheckCircle, Clock, XCircle, Plus,
    Filter, ChevronRight, Settings, Users,
    FileText, Plane, Briefcase, HeartPulse, MoreHorizontal, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Leaves = () => {
    const { darkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('all-requests');
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // Default form state
    const [newRequest, setNewRequest] = useState({
        employee_id: '',
        type: 'ANNUAL',
        start_date: '',
        end_date: '',
        reason: '',
        status: 'PENDING'
    });


    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [leavesRes, empsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/hr-mgmt/leaves`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/employees`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (leavesRes.data.success) setLeaves(leavesRes.data.data);
            if (empsRes.data.success) setEmployees(empsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (id, status, reason = '') => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_BASE_URL}/api/hr-mgmt/leaves/${id}`, {
                status,
                rejection_reason: reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success(`Leave ${status.toLowerCase()} successfully`);
                fetchData();
            }
        } catch (error) {
            console.error('Error updating leave status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/hr-mgmt/leaves`, newRequest, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success('Leave request created successfully');
                setIsRequestModalOpen(false);
                setNewRequest({ employee_id: '', type: 'ANNUAL', start_date: '', end_date: '', reason: '', status: 'PENDING' });
                fetchData();
            }
        } catch (error) {
            console.error('Error creating leave:', error);
            toast.error(error.response?.data?.message || 'Failed to create leave request');
        }
    };

    // Filter Logic
    const filteredLeaves = leaves.filter(req =>
        (req.Employee?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.Employee?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = leaves.filter(r => r.status === 'PENDING').length;

    // Components from the preferred design
    const BalanceCard = ({ type, used, total, color, bg }) => (
        <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-lg
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : bg}`}>
                    {type === 'Annual Leave' && <Plane className={color} size={24} />}
                    {type === 'Sick Leave' && <HeartPulse className={color} size={24} />}
                    {type === 'Unpaid Leave' && <Briefcase className={color} size={24} />}
                    {type === 'Emergency' && <Clock className={color} size={24} />}
                </div>
                <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {total - used}
                </span>
            </div>
            <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{type}</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                    className={`h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${(used / total) * 100}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>Used: {used}</span>
                <span>Total: {total}</span>
            </p>
        </div>
    );

    // Mock balances for "My Balances" tab demonstration
    const myBalances = [
        { type: 'Annual Leave', used: 12, total: 30, color: 'text-blue-500', bg: 'bg-blue-100' },
        { type: 'Sick Leave', used: 2, total: 15, color: 'text-red-500', bg: 'bg-red-100' },
        { type: 'Unpaid Leave', used: 0, total: 10, color: 'text-gray-500', bg: 'bg-gray-100' },
        { type: 'Emergency', used: 1, total: 5, color: 'text-orange-500', bg: 'bg-orange-100' },
    ];

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Leave Management</h1>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>HR Dashboard • <span className="text-orange-500 font-bold">{pendingCount} Pending Requests</span></p>
                </div>

                <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {[
                        { id: 'all-requests', label: 'All Requests' },
                        { id: 'my-leaves', label: 'My Balances' },
                        { id: 'holidays', label: 'Holidays' },
                        { id: 'settings', label: 'Settings' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                            ${activeTab === tab.id
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto">

                {/* HR VIEW: ALL REQUESTS (Default) */}
                {activeTab === 'all-requests' && (
                    <div className="space-y-4">
                        {/* Toolbar */}
                        <div className="flex justify-between items-center mb-4">
                            <div className={`flex items-center px-4 py-2 rounded-xl border w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <Search size={18} className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search by employee or leave type..."
                                    className="bg-transparent outline-none w-full text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
                                    <Filter size={16} /> Filter
                                </button>
                                <button
                                    onClick={() => setIsRequestModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20 transition-all">
                                    <Plus size={16} /> Add Request
                                </button>
                            </div>
                        </div>

                        {/* Requests Table */}
                        <div className={`rounded-xl shadow-sm border overflow-hidden
                            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#F9F7F1] border-gray-200'}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-separate border-spacing-y-2 px-4 whitespace-nowrap">
                                    <thead className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <tr>
                                            <th className="px-4 py-3">Employee</th>
                                            <th className="px-4 py-3">Leave Type</th>
                                            <th className="px-4 py-3">Duration</th>
                                            <th className="px-4 py-3">Dates</th>
                                            <th className="px-4 py-3">Applied On</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading requests...</td></tr>
                                        ) : filteredLeaves.length === 0 ? (
                                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">No requests found</td></tr>
                                        ) : filteredLeaves.map((req) => (
                                            <tr key={req.id} className={`rounded-lg overflow-hidden transition-all duration-200 group hover:shadow-md hover:scale-[1.005]
                                                ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-white'}`}>

                                                {/* Employee */}
                                                <td className="px-4 py-4 rounded-l-lg border-l-4 border-transparent hover:border-blue-500">
                                                    <div className="flex items-center">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm flex-shrink-0 overflow-hidden
                                                            ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                                            {resolveUrl(req.Employee?.avatar_url || req.Employee?.avatar) ? (
                                                                <img
                                                                    src={resolveUrl(req.Employee?.avatar_url || req.Employee?.avatar)}
                                                                    alt={req.Employee?.first_name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentElement.innerHTML = `<span>${(req.Employee?.first_name || 'E').charAt(0)}</span>`;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span>{(req.Employee?.first_name || 'E').charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">{req.Employee?.first_name} {req.Employee?.last_name}</div>
                                                            <div className="text-xs text-gray-500">{req.Employee?.position || req.Employee?.emp_id}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Type */}
                                                <td className="px-4 py-4 font-medium">
                                                    <span className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {req.type === 'ANNUAL' && <Plane size={16} className="text-blue-500" />}
                                                        {req.type === 'SICK' && <HeartPulse size={16} className="text-red-500" />}
                                                        {req.type === 'EMERGENCY' && <Clock size={16} className="text-orange-500" />}
                                                        {req.type}
                                                    </span>
                                                </td>

                                                {/* Duration */}
                                                <td className="px-4 py-4 font-mono text-gray-500">{req.days} Days</td>

                                                {/* Dates */}
                                                <td className="px-4 py-4 text-xs text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span>{new Date(req.start_date).toLocaleDateString()}</span>
                                                        <span className="text-[10px] text-gray-400">to {new Date(req.end_date).toLocaleDateString()}</span>
                                                    </div>
                                                </td>

                                                {/* Applied On */}
                                                <td className="px-4 py-4 text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>

                                                {/* Status */}
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                                        ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                            req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'}`}>
                                                        {req.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-4 rounded-r-lg text-right">
                                                    {req.status === 'PENDING' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleAction(req.id, 'APPROVED')}
                                                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(req.id, 'REJECTED')}
                                                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* MY BALANCES (Context for HR) */}
                {activeTab === 'my-leaves' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {myBalances.map((b, i) => <BalanceCard key={i} {...b} />)}
                    </div>
                )}

                {/* HOLIDAYS TAB */}
                {activeTab === 'holidays' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Founding Day', date: '22 Feb 2026', type: 'Public Holiday' },
                            { name: 'Eid Al-Fitr', date: '20 Mar 2026', type: 'Public Holiday (3 Days)' },
                            { name: 'Eid Al-Adha', date: '27 May 2026', type: 'Public Holiday (4 Days)' },
                            { name: 'National Day', date: '23 Sep 2026', type: 'Public Holiday' },
                        ].map((holiday, i) => (
                            <div key={i} className={`p-6 rounded-2xl border relative overflow-hidden group
                                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
                                <h3 className={`font-bold text-xl mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{holiday.name}</h3>
                                <p className="text-blue-500 font-medium">{holiday.date}</p>
                                <span className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    {holiday.type}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Settings size={48} className="mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold">Leave Configuration</h3>
                        <p>Configure leave types, year start dates, and accrual policies here.</p>
                        <button className="mt-4 text-blue-600 font-medium hover:underline">Access Admin Panel</button>
                    </div>
                )}

            </div>

            {/* Create Request Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsRequestModalOpen(false)}>
                    <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl transform scale-100 transition-all
                        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={e => e.stopPropagation()}>

                        <h2 className="text-xl font-bold mb-4">Create Leave Request</h2>

                        <form onSubmit={handleSubmitRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Employee</label>
                                <select
                                    className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                    value={newRequest.employee_id}
                                    onChange={e => setNewRequest({ ...newRequest, employee_id: e.target.value })}
                                    required>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Leave Type</label>
                                    <select
                                        className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                        value={newRequest.type}
                                        onChange={e => setNewRequest({ ...newRequest, type: e.target.value })}>
                                        <option value="ANNUAL">Annual Leave</option>
                                        <option value="SICK">Sick Leave</option>
                                        <option value="UNPAID">Unpaid Leave</option>
                                        <option value="EMERGENCY">Emergency</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                        value={newRequest.status}
                                        onChange={e => setNewRequest({ ...newRequest, status: e.target.value })}>
                                        <option value="PENDING">Pending Approval</option>
                                        <option value="APPROVED">Auto-Approve</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">From</label>
                                    <input type="date" required className={`w-full p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                        value={newRequest.start_date}
                                        onChange={e => setNewRequest({ ...newRequest, start_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">To</label>
                                    <input type="date" required className={`w-full p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                        value={newRequest.end_date}
                                        onChange={e => setNewRequest({ ...newRequest, end_date: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Reason</label>
                                <textarea className={`w-full p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                    rows="2"
                                    value={newRequest.reason}
                                    onChange={e => setNewRequest({ ...newRequest, reason: e.target.value })} />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 py-2 rounded-lg font-medium text-gray-500 hover:bg-gray-100">Cancel</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
