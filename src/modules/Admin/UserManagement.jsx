import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useTheme } from '../../context/ThemeContext';
import { UserPlus, Edit, Trash2, CheckCircle, XCircle, Shield, Key, Search, Lock, User } from 'lucide-react';
import PermissionSelector from '../../components/PermissionSelector';

const UserManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loginForm, setLoginForm] = useState({ username: '', email: '', password: '', roleId: '', permissions: [], manualRole: '', isManualRole: false });

    const { themeStyles, darkMode } = useTheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [empRes, roleRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/employees`, config),
                axios.get(`${API_BASE_URL}/api/roles`, config)
            ]);

            if (empRes.data.success) {
                setEmployees(empRes.data.data);
            }
            if (roleRes.data.success) {
                setRoles(roleRes.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLoginCommon = (emp) => {
        setSelectedEmployee(emp);
        setLoginForm({
            username: (emp.name || emp.first_name).replace(/\s+/g, '').toLowerCase(),
            email: emp.email || '',
            roleId: roles.length > 0 ? roles[0].id : '',
            password: '', // Default to empty for manual entry
            permissions: emp.User?.permissions || [] // Load existing if any
        });
        setShowLoginModal(true);
    };

    const submitLogin = async (e) => {
        e.preventDefault();
        try {
            const selectedRole = roles.find(r => r.id == loginForm.roleId);
            const roleName = loginForm.isManualRole ? loginForm.manualRole : (selectedRole ? selectedRole.name : 'USER');

            const payload = {
                ...loginForm,
                role: roleName,
                roleId: loginForm.isManualRole ? null : loginForm.roleId, // Clear roleId if manual
                employeeId: selectedEmployee.id,
                email: loginForm.email || selectedEmployee.email
            };

            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authentication Error: You are not logged in or session expired.");
                return;
            }
            console.log("Submitting with Token:", token ? "Present" : "Missing");

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (selectedEmployee.User) {
                // Update Existing User
                await axios.put(`${API_BASE_URL}/api/auth/users/${selectedEmployee.User.id}`, payload, config);
                alert("User Access Updated Successfully!");
            } else {
                // Register New User
                await axios.post(`${API_BASE_URL}/api/auth/register`, payload, config);
                alert("User Access Granted Successfully!");
            }

            setShowLoginModal(false);
            fetchData(); // Refresh list to show active status
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to save user access");
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const search = searchTerm.toLowerCase();
        const name = (emp.name || `${emp.first_name} ${emp.last_name}`).toLowerCase();
        const email = (emp.email || '').toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    return (
        <div className={`p-6 min-h-screen ${themeStyles.container}`}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="text-blue-500" /> User Access Management
                    </h1>
                    <p className="text-gray-500">Manage login credentials for all employees</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className={`w-full pl-10 p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800 text-white uppercase text-xs font-bold tracking-wider">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Department / Position</th>
                            <th className="p-4">System Role</th>
                            <th className="p-4">Login Status</th>
                            <th className="p-4">Linked User</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center">Loading employees...</td></tr>
                        ) : filteredEmployees.map(emp => {
                            const hasUser = !!emp.User; // Uses relation from backend
                            return (
                                <tr key={emp.id} className={`transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {(emp.name || emp.first_name).charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                                    {emp.name || `${emp.first_name} ${emp.last_name}`}
                                                </div>
                                                <div className="text-xs text-gray-400">{emp.emp_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{emp.department}</div>
                                        <div className="text-xs text-gray-500">{emp.position || emp.role}</div>
                                    </td>
                                    <td className="p-4">
                                        {hasUser ? (
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider w-fit
                                                    ${darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {emp.User.role || 'No Role'}
                                                </span>
                                                {emp.User.Role && emp.User.permissions?.length > 0 && Array.isArray(emp.User.Role.permissions) && (
                                                    JSON.stringify(emp.User.permissions.sort()) !== JSON.stringify(emp.User.Role.permissions.sort()) && (
                                                        <span className="text-[9px] text-amber-500 font-bold uppercase">Customized</span>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {hasUser ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 flex items-center gap-1 w-fit">
                                                <XCircle size={12} /> No Access
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {hasUser ? (
                                            <div>
                                                <div className="font-mono text-xs">{emp.User.username}</div>
                                                <div className="text-[10px] text-gray-500">{emp.User.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Not Linked</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleCreateLoginCommon(emp)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1 mx-auto ${!hasUser
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                }`}
                                        >
                                            <Key size={14} /> {hasUser ? 'Manage Access' : 'Create Login'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Login Provisioning Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowLoginModal(false)}>
                    <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl transform scale-100 transition-all ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus size={20} /> Provision Access</h2>
                            <button onClick={() => setShowLoginModal(false)}><XCircle size={20} className="hover:text-red-500" /></button>
                        </div>

                        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center font-bold">
                                {(selectedEmployee?.name || selectedEmployee?.first_name || 'U').charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold">{selectedEmployee?.name || `${selectedEmployee?.first_name} ${selectedEmployee?.last_name}`}</p>
                                <p className="text-xs opacity-70">Creating login for this employee</p>
                            </div>
                        </div>

                        <form onSubmit={submitLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase opacity-70 mb-1">Email / Username</label>
                                <input type="email" className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                    value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                                    required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                                    Password {selectedEmployee?.User && <span className="text-gray-400 font-normal normal-case">(Leave blank to keep current)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`w-full p-3 rounded-lg border outline-none font-mono ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                        value={loginForm.password}
                                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                        placeholder={selectedEmployee?.User ? "••••••••" : "Enter password"}
                                        required={!selectedEmployee?.User}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold uppercase opacity-70">Assign Role</label>
                                    <button
                                        type="button"
                                        onClick={() => setLoginForm({ ...loginForm, isManualRole: !loginForm.isManualRole, roleId: '', manualRole: '' })}
                                        className="text-[10px] text-blue-500 hover:underline"
                                    >
                                        {loginForm.isManualRole ? "Select from List" : "Enter Manually"}
                                    </button>
                                </div>
                                {loginForm.isManualRole ? (
                                    <input
                                        type="text"
                                        placeholder="Enter custom role name (e.g. Supervisor)"
                                        className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                        value={loginForm.manualRole}
                                        onChange={e => setLoginForm({ ...loginForm, manualRole: e.target.value })}
                                        required
                                    />
                                ) : (
                                    <select className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                        value={loginForm.roleId} onChange={e => {
                                            const rId = e.target.value;
                                            const role = roles.find(r => r.id == rId);
                                            setLoginForm({
                                                ...loginForm,
                                                roleId: rId,
                                                permissions: role ? (role.permissions || []) : []
                                            });
                                        }}
                                        required>
                                        <option value="">Select System Role</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <PermissionSelector
                                selectedPermissions={loginForm.permissions}
                                onChange={(perms) => setLoginForm({ ...loginForm, permissions: perms })}
                                darkMode={darkMode}
                            />

                            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg mt-2">
                                Confirm & Create Login
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
