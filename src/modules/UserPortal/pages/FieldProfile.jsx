import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Hash, Building, DollarSign, LogOut } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { UI_AVATARS_BASE_URL } from '../../../config/constants';

const FieldProfile = () => {
    const { darkMode } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Standard URL Resolver
    const resolveUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_BASE_URL}${cleanPath}`;
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/login');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user || !user.employee_id) {
            console.log('❌ No user or employee_id found:', { user, employee_id: user?.employee_id });
            setLoading(false);
            return;
        }

        console.log('🔍 Fetching profile for employee:', user.employee_id);

        try {
            const token = localStorage.getItem('token');
            console.log('🔑 Token exists:', !!token);

            const url = `${API_BASE_URL}/api/employees/${user.employee_id}/profile`;
            console.log('📡 Calling API:', url);

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('✅ API Response:', response.data);

            if (response.data.success) {
                setProfile(response.data.data);
                console.log('✅ Profile set successfully');
            } else {
                console.error('❌ API returned success:false');
            }
        } catch (error) {
            console.error('❌ Error fetching profile:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className={`flex items-start gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <Icon size={18} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {value || 'Not provided'}
                </p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-6">
                <div className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="text-gray-500 mb-4">Profile not found</p>
                    <p className="text-sm text-gray-400 mb-4">
                        User ID: {user?.employee_id || 'Not set'}
                    </p>
                    <p className="text-xs text-gray-400">
                        Check browser console (F12) for error details
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 px-4 pt-6">
            {/* Header Card */}
            <div className={`p-6 rounded-3xl mb-6 ${darkMode ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className={`w-24 h-24 rounded-full border-4 ${darkMode ? 'border-gray-800' : 'border-white'} shadow-xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center relative`}>
                        {resolveUrl(profile.personal?.avatar_url) ? (
                            <img
                                src={resolveUrl(profile.personal.avatar_url)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-3xl">${profile.personal?.first_name.charAt(0)}</div>`;
                                }}
                            />
                        ) : (
                            <img
                                src={`${UI_AVATARS_BASE_URL}?name=${profile.personal?.first_name}+${profile.personal?.last_name}&background=random&size=128`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Name */}
                    <h1 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {profile.personal?.first_name} {profile.personal?.last_name}
                    </h1>

                    {/* Designation */}
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
                        {profile.employment?.designation || 'Employee'}
                    </p>

                    {/* Employee ID */}
                    {profile.employment?.emp_no && (
                        <p className="text-xs text-gray-400 font-mono">
                            ID: {profile.employment.emp_no}
                        </p>
                    )}
                </div>
            </div>

            {/* Personal Information */}
            <div className="mb-6">
                <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Personal Information
                </h2>
                <div className="space-y-3">
                    <InfoRow icon={Mail} label="Email" value={profile.personal?.email} />
                    <InfoRow icon={Phone} label="Phone" value={profile.personal?.phone} />
                    <InfoRow icon={Calendar} label="Date of Birth" value={profile.personal?.date_of_birth ? new Date(profile.personal.date_of_birth).toLocaleDateString() : null} />
                    <InfoRow icon={MapPin} label="Nationality" value={profile.personal?.nationality} />
                    <InfoRow icon={MapPin} label="Address" value={profile.personal?.address} />
                </div>
            </div>

            {/* Employment Information */}
            <div className="mb-6">
                <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Employment Details
                </h2>
                <div className="space-y-3">
                    <InfoRow icon={Briefcase} label="Designation" value={profile.employment?.designation} />
                    <InfoRow icon={Building} label="Department" value={profile.employment?.department} />
                    <InfoRow icon={Hash} label="Employee Number" value={profile.employment?.emp_no} />
                    <InfoRow icon={Calendar} label="Join Date" value={profile.employment?.join_date ? new Date(profile.employment.join_date).toLocaleDateString() : null} />
                    <InfoRow icon={Briefcase} label="Status" value={profile.employment?.status} />
                </div>
            </div>

            {/* Emergency Contact */}
            {profile.emergency_contact?.name && (
                <div className="mb-6">
                    <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Emergency Contact
                    </h2>
                    <div className="space-y-3">
                        <InfoRow icon={User} label="Name" value={profile.emergency_contact.name} />
                        <InfoRow icon={Phone} label="Phone" value={profile.emergency_contact.phone} />
                        <InfoRow icon={User} label="Relationship" value={profile.emergency_contact.relationship} />
                    </div>
                </div>
            )}

            {/* Financial Information - Only show if available and appropriate */}
            {profile.financial?.bank_account && (
                <div className="mb-6">
                    <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Bank Details
                    </h2>
                    <div className="space-y-3">
                        <InfoRow icon={DollarSign} label="Bank Account" value={profile.financial.bank_account} />
                        <InfoRow icon={Hash} label="IBAN" value={profile.financial.iban} />
                    </div>
                </div>
            )}

            {/* Logout Button */}
            <div className="mb-6">
                <button
                    onClick={handleLogout}
                    className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all
                        ${darkMode
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default FieldProfile;
