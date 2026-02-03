import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import {
    Shield, Lock, Eye, Edit, Trash2, Check, X,
    Users, AlertCircle, Save
} from 'lucide-react';

const RoleManagement = () => {
    const { darkMode } = useTheme();
    const [editingRole, setEditingRole] = useState(null);

    // Data State
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Roles
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get(`${API_BASE_URL}/api/roles`, config);
            if (response.data.success) {
                // Ensure permissions object exists
                const formatted = response.data.data.map(r => ({ ...r, permissions: r.permissions || {} }));
                setRoles(formatted);
            }
        } catch (error) {
            console.error("Failed to fetch roles", error);
        } finally {
            setLoading(false);
        }
    };

    // Permission Definitions for the UI (Matches PermissionSelector keys)
    const permissionList = [
        { key: 'view_salary', label: 'View Salaries (Payroll)', icon: <Lock size={14} /> },
        { key: 'edit_employee', label: 'Edit Employee Profiles', icon: <Edit size={14} /> },
        { key: 'delete_employee', label: 'Delete/Terminate Employees', icon: <Trash2 size={14} /> },
        { key: 'manage_roles', label: 'Manage Roles & Permissions', icon: <Shield size={14} /> },
        { key: 'approve_leave', label: 'Approve Leave Requests', icon: <Check size={14} /> },
        { key: 'view_documents', label: 'View Sensitive Documents', icon: <Eye size={14} /> },
        { key: 'view_dashboard', label: 'View Dashboard', icon: <Eye size={14} /> },
        { key: 'manage_users', label: 'Manage Users', icon: <Users size={14} /> },
        { key: 'view_field_ops', label: 'View Field Operations', icon: <Shield size={14} /> },
        { key: 'manage_jobs', label: 'Manage Jobs/Assignments', icon: <Edit size={14} /> },
    ];

    const handleTogglePermission = (roleId, key) => {
        setRoles(roles.map(role => {
            if (role.id === roleId) {
                const currentPerms = Array.isArray(role.permissions) ? role.permissions : [];
                const updatedPerms = currentPerms.includes(key)
                    ? currentPerms.filter(p => p !== key)
                    : [...currentPerms, key];
                return {
                    ...role,
                    permissions: updatedPerms
                };
            }
            return role;
        }));
    };

    const handleSave = async (role) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.put(
                `${API_BASE_URL}/api/roles/${role.id}`,
                { permissions: role.permissions },
                config
            );
            if (response.data.success) {
                setEditingRole(null);
                alert("Role permissions updated successfully!");
                fetchRoles(); // Refresh
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert("Error saving role");
            console.error(error);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out] overflow-y-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Roles & Permissions</h1>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Define access levels and control sensitive data visibility (Salary, Documents, etc.).
                </p>
            </div>

            {/* List of Roles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {roles.map(role => (
                    <div
                        key={role.id}
                        className={`p-6 rounded-2xl border transition-all duration-300
                        ${darkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                            }`}
                    >
                        {/* Role Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {role.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Users size={12} className="text-gray-400" />
                                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {role.usersCount} Assigned Users
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {editingRole === role.id ? (
                                <button
                                    onClick={() => handleSave(role)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors"
                                >
                                    <Save size={14} /> Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => setEditingRole(role.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                                    ${darkMode
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Customize
                                </button>
                            )}
                        </div>

                        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {role.description}
                        </p>

                        {/* Permissions Grid */}
                        <div className="space-y-3">
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Access Capabilities
                            </h4>
                            {permissionList.map(perm => {
                                const isEnabled = role.permissions[perm.key];
                                const isEditing = editingRole === role.id;

                                return (
                                    <div
                                        key={perm.key}
                                        onClick={() => isEditing && handleTogglePermission(role.id, perm.key)}
                                        className={`flex items-center justify-between p-2 rounded-lg transition-colors
                                        ${isEditing
                                                ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                                                : ''}
                                        ${!isEditing && !isEnabled ? 'opacity-50' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-md ${isEnabled ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')}`}>
                                                {perm.icon}
                                            </div>
                                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {perm.label}
                                            </span>
                                        </div>

                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all
                                            ${isEnabled
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : 'border-gray-300 dark:border-gray-600 bg-transparent'}`}>
                                            {isEnabled && <Check size={12} strokeWidth={4} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Create New Role Card */}
                <button className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all
                    ${darkMode
                        ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-800'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
                    group min-h-[400px]`}>
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Users size={32} />
                    </div>
                    <span className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-500">Create New Role</span>
                </button>
            </div>
        </div>
    );
};

export default RoleManagement;
