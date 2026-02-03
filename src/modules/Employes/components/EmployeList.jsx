import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Search, AlertCircle, AlertTriangle, Plus, Building2, User } from 'lucide-react';
import API_BASE_URL from '../../../config/api';
import { resolveUrl } from '../../../utils/url';

const EmployeList = ({ employees = [], onEdit, onView }) => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');


    // Expiry Check Logic
    const checkExpiry = (dateString) => {
        if (!dateString) return 'ok';
        const today = new Date();
        const expiry = new Date(dateString);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'expired'; // Already expired
        if (diffDays < 30) return 'warning'; // Expiring in 30 days
        return 'ok';
    };

    // Filter Logic
    const filteredEmployees = employees.filter(emp => {
        const name = emp.name || `${emp.first_name} ${emp.last_name}`;
        const role = emp.role || emp.position || '';
        const search = searchTerm.toLowerCase();

        return name.toLowerCase().includes(search) ||
            role.toLowerCase().includes(search);
    });

    return (
        <div
            className={`rounded-xl shadow-sm border overflow-hidden flex flex-col h-full
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#F9F7F1] border-gray-200'}`}
        >
            {/* Header with Search and Add Button */}
            <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4
                ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>

                {/* Search Input */}
                <div className={`flex items-center px-3 py-2 rounded-lg border focus-within:ring-2 ring-blue-500/20 transition-all w-full sm:w-64
                    ${darkMode ? 'bg-gray-900/50 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none w-full placeholder-gray-500 text-gray-700 dark:text-gray-200 text-sm"
                    />
                </div>

                {/* Add Employee Button */}
                <button
                    onClick={() => navigate('/employes/add')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                    <Plus size={18} />
                    Add Employee
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-y-2 px-4 whitespace-nowrap">
                    <thead
                        className={`text-xs uppercase
                        ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Position</th>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Iqama / ID</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Address</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredEmployees.map((emp) => {
                            const iqamaStatus = checkExpiry(emp.iqamaExpiry);
                            const passportStatus = checkExpiry(emp.passportExpiry);
                            const hasIssue = iqamaStatus !== 'ok' || passportStatus !== 'ok';

                            // Data Normalization
                            const fullName = (emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`).trim() || 'Unknown';
                            const position = emp.role || emp.position || 'N/A';
                            const displayId = emp.emp_id || emp.id;
                            const iqamaNo = emp.iqama || emp.iqama_no || 'N/A';
                            const category = emp.category || emp.department || 'General';
                            const avatarUrl = resolveUrl(emp.avatar_url || emp.avatar);

                            return (
                                <tr
                                    key={emp.id}
                                    className={`
                                    rounded-lg overflow-hidden transition-all duration-200 group
                                    hover:shadow-md hover:scale-[1.01]
                                    ${darkMode
                                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                                            : 'bg-white text-gray-900 hover:bg-white'}
                                `}
                                >
                                    {/* Name */}
                                    <td className={`px-4 py-4 rounded-l-lg border-l-4 hover:border-blue-500 transition-colors
                                    ${hasIssue ? 'border-red-500 bg-red-50/10' : 'border-transparent'}`}>
                                        <div className="flex items-center">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm flex-shrink-0 overflow-hidden"
                                                style={{
                                                    backgroundColor: avatarUrl ? 'transparent' : (darkMode ? '#374151' : '#EFF6FF')
                                                }}
                                            >
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt={fullName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = `<span class="${darkMode ? 'text-blue-400' : 'text-blue-600'}">${fullName.charAt(0)}</span>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                                                        {fullName.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-semibold">{fullName}</span>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-4 py-4">
                                        <div className="font-medium">{position}</div>
                                        {emp.sponsor_name && (
                                            <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 opacity-80">
                                                <Building2 size={10} />
                                                {emp.sponsor_name}
                                            </div>
                                        )}
                                    </td>

                                    {/* ID */}
                                    <td className="px-4 py-4 font-mono text-xs text-gray-500">{displayId}</td>

                                    {/* Iqama */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-gray-500">{iqamaNo}</span>
                                            {iqamaStatus === 'expired' && (
                                                <div title="Iqama Expired" className="text-red-500 animate-pulse">
                                                    <AlertCircle size={14} />
                                                </div>
                                            )}
                                            {iqamaStatus === 'warning' && (
                                                <div title="Iqama Expiring Soon" className="text-orange-500">
                                                    <AlertTriangle size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="px-4 py-4 text-gray-500 max-w-[200px] truncate" title={emp.email}>
                                        {emp.email}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-2.5 w-2.5 rounded-full ring-2 ring-white flex-shrink-0
                                            ${emp.status === 'Online' ? 'bg-green-500' :
                                                        emp.status === 'Offline' ? 'bg-gray-400' : 'bg-red-500'}`}
                                            />
                                            <span className="text-xs font-medium">{emp.status}</span>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                                        ${category === 'Tech' || category === 'Field Operations' ? 'bg-purple-100 text-purple-700' :
                                                category === 'Design' ? 'bg-pink-100 text-pink-700' :
                                                    category === 'Management' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                            {category}
                                        </span>
                                    </td>

                                    {/* Phone */}
                                    <td className="px-4 py-4 text-gray-500">{emp.phone}</td>

                                    {/* Address */}
                                    <td className="px-4 py-4 text-gray-500 max-w-[200px] truncate" title={emp.address}>
                                        {emp.address}
                                    </td>

                                    {/* Action */}
                                    <td className="px-4 py-4 rounded-r-lg text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onView && onView(emp)}
                                                className="font-medium text-gray-500 hover:text-gray-800 transition-colors text-sm px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => onEdit && onEdit(emp)}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-800 transition-colors text-sm px-3 py-1 rounded hover:bg-blue-50 whitespace-nowrap"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeList;
