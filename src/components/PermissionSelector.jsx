import React from 'react';
import { Check, Shield } from 'lucide-react';

const PERMISSION_GROUPS = [
    {
        category: "Dashboard & Analytics",
        permissions: [
            { id: "view_dashboard", label: "View Dashboard" },
            { id: "view_analytics", label: "View Analytics" },
        ]
    },
    {
        category: "Quotations",
        permissions: [
            { id: "create_quote", label: "Create Quotation" },
            { id: "view_quote", label: "View Quotations" },
            { id: "edit_quote", label: "Edit Quotation" },
            { id: "delete_quote", label: "Delete Quotation" },
            { id: "approve_quote", label: "Approve Quotation" }
        ]
    },
    {
        category: "Financials",
        permissions: [
            { id: "view_finance", label: "View Financials" },
            { id: "view_salary", label: "View Salaries" }
        ]
    },
    {
        category: "User & Role Management",
        permissions: [
            { id: "manage_users", label: "Manage Users" },
            { id: "manage_roles", label: "Manage Roles" }
        ]
    },
    {
        category: "Field Operations",
        permissions: [
            { id: "view_field_ops", label: "View Field Ops" },
            { id: "manage_jobs", label: "Manage Jobs/Assignments" },
            { id: "view_technicians", label: "View Technicians" }
        ]
    },
    {
        category: "User Portal (Self Service)",
        permissions: [
            { id: "access_portal", label: "Access User Portal" },
            { id: "view_my_tasks", label: "View My Tasks" },
            { id: "view_attendance", label: "View Attendance" }
        ]
    },
    {
        category: "Employees & Operations",
        permissions: [
            { id: "view_employees", label: "View Employees" },
            { id: "edit_employee", label: "Edit Employee" },
            { id: "delete_employee", label: "Delete Employee" },
            { id: "approve_leave", label: "Approve Leave" }
        ]
    }
];

const PermissionSelector = ({ selectedPermissions = [], onChange, darkMode }) => {

    const togglePermission = (permId) => {
        if (selectedPermissions.includes(permId)) {
            onChange(selectedPermissions.filter(id => id !== permId));
        } else {
            onChange([...selectedPermissions, permId]);
        }
    };

    const toggleGroup = (groupPerms) => {
        const allIds = groupPerms.map(p => p.id);
        const allSelected = allIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            // Unselect all
            onChange(selectedPermissions.filter(id => !allIds.includes(id)));
        } else {
            // Select all
            const newPerms = [...new Set([...selectedPermissions, ...allIds])];
            onChange(newPerms);
        }
    };

    return (
        <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                Access Permissions
            </h3>

            <div className="space-y-6">
                {PERMISSION_GROUPS.map((group, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">{group.category}</h4>
                            <button
                                type="button"
                                onClick={() => toggleGroup(group.permissions)}
                                className="text-[10px] text-blue-500 hover:underline"
                            >
                                Toggle All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"> {/* Responsive Grid */}
                            {group.permissions.map(perm => {
                                const isSelected = selectedPermissions.includes(perm.id);
                                return (
                                    <button
                                        key={perm.id}
                                        type="button"
                                        onClick={() => togglePermission(perm.id)}
                                        className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all border ${isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                            : `hover:bg-gray-200 dark:hover:bg-gray-700 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-white border-white text-blue-600' : 'border-gray-400'}`}>
                                            {isSelected && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <span>{perm.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PermissionSelector;
