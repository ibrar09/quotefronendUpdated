import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Banknote,
    LogOut,
    Menu,
    Briefcase,
    FileText,
    MapPin,
    Receipt,
    Box,
    Settings,
    UserMinus,
    Plane,
    Clock,
    LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            label: "Dashboard",
            icon: <LayoutDashboard size={16} />,
            path: "/employes/dashboard"
        },
        {
            label: "Employee List",
            icon: <Users size={16} />,
            path: "/employes"
        },
        {
            label: "Documents",
            icon: <FileText size={16} />, // Changed from UserPlus or similar to FileText
            path: "/employes/documents"
        },
        {
            label: "Company Docs",
            icon: <Briefcase size={16} />,
            path: "/employes/company-documents"
        },
        {
            label: "Payroll",
            icon: <Banknote size={16} />,
            path: "/employes/payroll"
        },
        {
            label: "Expenses",
            icon: <Receipt size={16} />,
            path: "/employes/expenses"
        },
        {
            label: "Attendance",
            icon: <Clock size={16} />,
            path: "/employes/attendance"
        },
        {
            label: "Assets",
            icon: <Box size={16} />,
            path: "/employes/assets"
        },
        {
            label: "Leaves",
            icon: <Plane size={16} />,
            path: "/employes/leaves"
        },
        {
            label: "Field Ops",
            icon: <MapPin size={16} />,
            path: "/employes/field-ops"
        },
        {
            label: "Terminated",
            icon: <UserMinus size={16} />,
            path: "/employes/terminated"
        },
        {
            label: "Settings",
            icon: <Settings size={16} />,
            path: "/employes/settings"
        },
    ];

    const departments = [
        { label: "Operations", color: "bg-orange-500" },
        { label: "Management", color: "bg-purple-500" },
        { label: "Support", color: "bg-teal-500" },
    ];

    return (
        <div className="w-48 h-screen bg-[#3A4D4E] text-gray-300 flex flex-col font-sans transition-all duration-300">
            {/* Logo Section */}
            <div className="p-4 flex items-center gap-3 text-white mb-4">
                <div className="p-2 bg-yellow-600 rounded-full text-white">
                    <Briefcase size={18} />
                </div>
                <h1 className="text-lg font-bold tracking-wide">StaffPortal</h1>
            </div>

            {/* Menu Section */}
            <div className="flex-1 px-3 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Menu</p>
                <ul className="space-y-1">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <button
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                                    ${isActive(item.path)
                                        ? "bg-white/10 text-yellow-500" // Removed border line
                                        : "hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span className={isActive(item.path) ? "text-yellow-500" : "text-gray-400"}>
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Departments Section (Visual only for now) */}
                <div className="mt-8">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</p>
                        <button className="text-gray-500 hover:text-white">+</button>
                    </div>

                    <ul className="space-y-3 px-2">
                        {departments.map((dept, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer hover:text-gray-200">
                                <span className={`w-2.5 h-2.5 rounded-full ${dept.color}`}></span>
                                {dept.label}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-black/20 cursor-pointer hover:bg-black/30 transition-all font-sans"
                onClick={() => navigate('/selection')}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-600 text-white flex items-center justify-center transition-transform hover:scale-110">
                        <LayoutGrid size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Back to</p>
                        <p className="text-xs font-bold text-white">Switch Module</p>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-black/10">
                <button
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                    <LogOut size={16} />
                    <span className="font-medium text-sm">Log Out</span>
                </button>
            </div>


        </div>
    );
};

export default Sidebar;