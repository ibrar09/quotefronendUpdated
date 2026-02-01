import React from 'react';
import {
    ArrowLeft, Mail, Phone, MapPin,
    Calendar, CreditCard, FileText, Download,
    ExternalLink, Shield, Briefcase, Clock,
    AlertTriangle, AlertCircle, Laptop, Smartphone, Key, Car, Plus, Lock, User, DollarSign, RefreshCw, X as LucideX, Box as LucideBox
} from 'lucide-react';
import API_BASE_URL from '../../../config/api';
import { useTheme } from '../../../context/ThemeContext';
import axios from 'axios';
import { getStaffMonthlyAttendance } from '../../UserPortal/services/portal.service';
import LetterGeneratorModal from '../components/LetterGeneratorModal';

const EmployeDetails = ({ employee, onBack, onEdit, onTerminate }) => {
    console.log("EmployeDetails v3 Loaded - employee id:", employee?.id);
    const { darkMode } = useTheme();
    const [activeTab, setActiveTab] = React.useState('overview');

    if (!employee) return <div className="p-8 text-center text-gray-500">Employee not found</div>;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <User size={18} /> },
        { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
        { id: 'financial', label: 'Financial', icon: <DollarSign size={18} /> },
        { id: 'attendance', label: 'Attendance', icon: <Clock size={18} /> },
        { id: 'access', label: 'Login Access', icon: <Lock size={18} /> },
        { id: 'assets', label: 'Assets', icon: <Laptop size={18} /> }
    ];

    // Helper to calculate active tab index if needed (omitted for brevity, assume tab logic exists in parent or handled via props, but wait... EmployeDetails doesn't seem to have `activeTab` state in the visible snippet? 
    // Checking snippet again... 
    // Ah, I don't see `activeTab` state in `EmployeDetails`. It seems `tabs` are defined but where are they used?
    // Wait, the previous snippet didn't show the Tabs UI rendering logic? 
    // Checking Line 188 `return (` ... 
    // Line 190 Header...
    // Line 280 Content Grid...
    // The previous code seems to render ALL cards (1, 2, 3, 4, 5, 5.5, 6) in a grid! 
    // THERE ARE NO TABS implemented in the *current* code structure shown in Step 1227!
    // The user wants a TAB system or just a section?
    // The snippet shows `InfoCard`s being rendered sequentially.
    // I should add a NEW CARD for "System Access" instead of a Tab if there are no tabs.
    // OR create a Tab system? The user request said "login to all this system... admin will give permission".
    // I will add a new "System Access" card to the grid for now, to fit the existing design.

    // RE-READING: "access" tab request was my *PLAN*. 
    // But the *current* code uses a Grid of Cards.
    // I will add a "System Access" Card to the Grid. It's cleaner.

    // MODIFYING PLAN: Add a new InfoCard for "System/Login Access".


    const [previewDoc, setPreviewDoc] = React.useState(null);
    const [showLetterModal, setShowLetterModal] = React.useState(false);

    // --- Login Provisioning State ---
    const [roles, setRoles] = React.useState([]);
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const [loginForm, setLoginForm] = React.useState({ username: '', password: '', email: '', roleId: '' });

    React.useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const res = await axios.get(`${API_BASE_URL}/api/roles`, config);
                if (res.data.success) setRoles(res.data.data);
            } catch (e) { console.error("Error fetching roles", e); }
        };
        fetchRoles();
    }, []);

    const handleCreateLogin = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authentication Error: Please log in again.");
                return;
            }

            const payload = {
                ...loginForm,
                employeeId: employee.id,
                email: loginForm.email || employee.email || `${employee.first_name.toLowerCase()}@maaj.com`
            };

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload, config);
            if (response.data.success) {
                alert("Login Created Successfully!");
                setShowLoginModal(false);
                // Refresh logic would go here
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("Create login error:", error);
            alert(error.response?.data?.message || "Failed to create login");
        }
    };

    const [employeeAssets, setEmployeeAssets] = React.useState([]);
    const [allAssets, setAllAssets] = React.useState([]);
    const [showAssignModal, setShowAssignModal] = React.useState(false);

    const fetchEmployeeAssets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/assets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAllAssets(res.data.data);
                // Filter assets assigned to this employee
                // Using employee.id or employee.user_id? Likely employee.id
                setEmployeeAssets(res.data.data.filter(a => a.assigned_to === employee.id));
            }
        } catch (e) {
            console.error("Error fetching employee assets", e);
        }
    };

    React.useEffect(() => {
        if (employee?.id) {
            fetchEmployeeAssets();
        }
    }, [employee?.id]);

    const handleReturnAsset = async (id) => {
        if (!window.confirm('Confirm return of this asset to general inventory?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/assets/${id}`, {
                status: 'Available',
                assigned_to: null,
                assigned_date: null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEmployeeAssets();
        } catch (e) {
            console.error("Error returning asset", e);
            alert("Failed to return asset");
        }
    };

    const handleQuickAssign = async (assetId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/assets/${assetId}`, {
                status: 'Assigned',
                assigned_to: employee.id,
                assigned_date: new Date()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAssignModal(false);
            fetchEmployeeAssets();
        } catch (e) {
            console.error("Error assigning asset", e);
            alert("Failed to assign asset");
        }
    };

    // --- Attendance State ---
    const [attendanceData, setAttendanceData] = React.useState([]);
    const [attendanceLoading, setAttendanceLoading] = React.useState(false);
    const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

    // --- Payroll History State ---
    const [payrollHistory, setPayrollHistory] = React.useState([]);
    const [payrollLoading, setPayrollLoading] = React.useState(false);

    const fetchPayrollHistory = async () => {
        setPayrollLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/payroll?employee_id=${employee.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPayrollHistory(res.data.data.sort((a, b) => {
                    if (b.year !== a.year) return b.year - a.year;
                    return b.month - a.month;
                }));
            }
        } catch (e) {
            console.error("Error fetching payroll history", e);
        } finally {
            setPayrollLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'attendance' && employee?.id) {
            fetchAttendance();
        }
        if (activeTab === 'financial' && employee?.id) {
            fetchPayrollHistory();
        }
    }, [activeTab, selectedMonth, selectedYear, employee?.id]);

    const fetchAttendance = async () => {
        setAttendanceLoading(true);
        try {
            const res = await getStaffMonthlyAttendance(selectedYear, selectedMonth, employee.id);
            if (res.success) {
                const grouped = {};

                // 1. Map existing records
                res.data.forEach(r => {
                    const dateKey = r.date;
                    if (!grouped[dateKey]) {
                        grouped[dateKey] = {
                            date: dateKey,
                            status: r.status,
                            clock_in: r.clock_in,
                            clock_out: r.clock_out,
                            regMinutes: 0,
                            otMinutes: 0,
                            device_info: r.device_info,
                            ip_address: r.ip_address
                        };
                    }

                    const startTime = new Date(r.clock_in);
                    const endTime = r.clock_out ? new Date(r.clock_out) : new Date();
                    const dur = r.duration_minutes || Math.round((endTime - startTime) / 60000);

                    if (r.tag === 'OVERTIME' || r.is_overtime === true) {
                        grouped[dateKey].otMinutes += dur;
                    } else {
                        grouped[dateKey].regMinutes += dur;
                    }

                    if (r.clock_out && (!grouped[dateKey].clock_out || new Date(r.clock_out) > new Date(grouped[dateKey].clock_out))) {
                        grouped[dateKey].clock_out = r.clock_out;
                    }
                });

                // 2. Fill in gaps for the month (Absent detection)
                const now = new Date();
                const year = selectedYear;
                const month = selectedMonth - 1; // JS months are 0-indexed
                const lastDay = new Date(year, month + 1, 0).getDate();
                const limitDay = (year === now.getFullYear() && month === now.getMonth()) ? now.getDate() : lastDay;

                for (let d = 1; d <= limitDay; d++) {
                    const dateObj = new Date(year, month, d);
                    const dateStr = dateObj.toISOString().split('T')[0];

                    // Skip Fridays (assuming weekend), but only if no record exists
                    if (!grouped[dateStr] && dateObj.getDay() !== 5) {
                        grouped[dateStr] = {
                            date: dateStr,
                            status: 'ABSENT',
                            clock_in: null,
                            clock_out: null,
                            regMinutes: 0,
                            otMinutes: 0,
                            device_info: '-',
                            ip_address: '-'
                        };
                    }
                }

                setAttendanceData(Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date)));
            }
        } catch (e) {
            console.error("Error fetching attendance", e);
        } finally {
            setAttendanceLoading(false);
        }
    };

    const getAssetIcon = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('laptop') || t.includes('computer') || t.includes('pc')) return <Laptop size={18} />;
        if (t.includes('mobile') || t.includes('phone') || t.includes('tablet')) return <Smartphone size={18} />;
        if (t.includes('car') || t.includes('van') || t.includes('truck') || t.includes('vehicle')) return <Car size={18} />;
        if (t.includes('tool') || t.includes('drill') || t.includes('machine')) return <Briefcase size={18} />;
        if (t.includes('key') || t.includes('access') || t.includes('lock')) return <Key size={18} />;
        return <LucideBox size={18} />;
    };

    const attendanceStats = React.useMemo(() => {
        const counts = { PRESENT: 0, LATE: 0, ABSENT: 0, LEAVE: 0 };
        attendanceData.forEach(r => {
            if (counts[r.status] !== undefined) counts[r.status]++;
        });
        return counts;
    }, [attendanceData]);

    // Helpers
    const checkExpiry = (dateString) => {
        if (!dateString) return { status: 'ok', label: '' };
        const today = new Date();
        const expiry = new Date(dateString);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { status: 'expired', label: 'Expired', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
        if (diffDays < 30) return { status: 'warning', label: `Expiring in ${diffDays} days`, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
        return { status: 'ok', label: dateString };
    };

    const iqamaStatus = checkExpiry(employee.iqama_expiry);
    const passportStatus = checkExpiry(employee.passport_expiry);
    const hasIssues = iqamaStatus.status !== 'ok' || passportStatus.status !== 'ok';

    // Helper Card Component
    const InfoCard = ({ title, icon: Icon, children, delay }) => (
        <div
            className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:shadow-lg
            ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}
            opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Icon size={20} className="stroke-[1.5]" />
                </div>
                <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{title}</h3>
            </div>
            {children}
        </div>
    );

    // Helper Row Component
    const InfoRow = ({ label, value, alert }) => (
        <div className={`flex justify-between items-center py-3 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 px-2 -mx-2 rounded transition-colors
             ${alert?.status !== 'ok' && alert ? `${darkMode ? 'bg-red-900/10' : 'bg-red-50'}` : ''}`}>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
            <div className="text-right">
                <span className={`text-sm font-semibold block ${alert?.color || (darkMode ? 'text-gray-200' : 'text-gray-900')}
                    ${alert?.status !== 'ok' && alert ? 'animate-pulse' : ''}`}>
                    {alert?.status !== 'ok' && alert ? `${value} (${alert.label})` : (value || '-')}
                </span>
            </div>
        </div>
    );

    // Document Card Component
    const DocumentCard = ({ title, type, date, size, onPreview }) => (
        <div
            onClick={onPreview}
            className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between relative z-10">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <FileText size={24} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider
                    ${type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {type}
                </span>
            </div>

            <div className="mt-4 relative z-10">
                <h4 className={`font-semibold mb-1 truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h4>
                <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>{size}</span>
                    <span>•</span>
                    <span>{date}</span>
                </div>
            </div>

            {/* Hover Overlay Action */}
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out bg-gradient-to-t from-black/50 to-transparent flex justify-end">
                <button
                    onClick={(e) => { e.stopPropagation(); /* download logic */ }}
                    className="p-2 bg-white rounded-full shadow-lg text-blue-600 hover:scale-110 transition-transform"
                    title="Download"
                >
                    <Download size={16} />
                </button>
            </div>
        </div>
    );

    // Document Preview Modal
    const DocumentPreviewModal = ({ doc, onClose }) => {
        if (!doc) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
                <div
                    className={`relative w-full max-w-4xl h-[80vh] rounded-2xl p-2 shadow-2xl flex flex-col
                    ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doc.title} Preview</h3>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <Download size={16} /> Download
                            </button>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                                <LucideX size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-950 rounded-b-xl flex items-center justify-center overflow-hidden relative">
                        {/* Mock Content based on type */}
                        {doc.type === 'IMG' ? (
                            <div className="text-center p-8">
                                <span className="text-6xl mb-4 block">🖼️</span>
                                <p className="text-gray-500">Image Preview Placeholder</p>
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <span className="text-6xl mb-4 block">📄</span>
                                <p className="text-gray-500">PDF Document Preview Placeholder</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const displayName = employee.name || `${employee.first_name} ${employee.last_name}`;

    return (
        <div className={`h-full overflow-y-auto scrollbar-thin pb-10 animate-[fadeIn_0.3s_ease-out]`}>
            {/* --- Header Section (Enhanced Sticky Blur) --- */}
            <div className={`sticky top-0 z-10 backdrop-blur-xl pb-4 pt-2 -mx-2 px-6 transition-all border-b border-transparent
                ${darkMode ? 'bg-gray-900/80' : 'bg-white/70'}`}>
                <button
                    onClick={onBack}
                    className={`flex items-center gap-2 text-sm font-medium mb-4 transition-transform hover:-translate-x-1
                    ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <ArrowLeft size={16} />
                    Back to List
                </button>

                {/* COMPLIANCE ALERT BANNER */}
                {hasIssues && (
                    <div className={`mb-6 p-4 rounded-xl border flex items-center gap-4 shadow-sm animate-bounce
                        ${iqamaStatus.status === 'expired' || passportStatus.status === 'expired'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                        <div className={`p-2 rounded-full ${iqamaStatus.status === 'expired' ? 'bg-red-100' : 'bg-orange-100'}`}>
                            {iqamaStatus.status === 'expired' ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold">Attention Required: Document Compliance</h3>
                            <p className="text-sm">
                                {iqamaStatus.status !== 'ok' && `Iqama: ${iqamaStatus.label}. `}
                                {passportStatus.status !== 'ok' && `Passport: ${passportStatus.label}.`}
                            </p>
                        </div>
                        <button className="ml-auto px-4 py-2 bg-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-shadow">
                            Renew Now
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        {/* Avatar with Glow */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-500"></div>
                            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl
                                ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-blue-600'}`}>
                                {displayName.charAt(0)}
                            </div>
                            <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 ${darkMode ? 'border-gray-900' : 'border-[#F9F7F1]'}
                                ${employee.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`}
                            />
                        </div>

                        <div>
                            <h1 className={`text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r
                                ${darkMode ? 'from-white to-gray-400' : 'from-gray-900 to-gray-600'}`}>
                                {displayName}
                            </h1>
                            <div className="flex items-center gap-3 text-sm">
                                <span className={`px-3 py-1 rounded-full font-medium ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                    {employee.position || employee.role || 'Employee'}
                                </span>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{employee.emp_id || employee.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {/* [NEW] Quick Login Action */}
                        {!employee.user_id && (
                            <button
                                onClick={() => {
                                    setLoginForm({
                                        username: (employee.name || employee.first_name).replace(/\s+/g, '').toLowerCase(),
                                        email: employee.email || '',
                                        roleId: roles.length > 0 ? roles[0].id : '',
                                        password: Math.random().toString(36).slice(-8)
                                    });
                                    setShowLoginModal(true);
                                }}
                                className="px-4 py-2.5 rounded-xl font-bold bg-green-600 text-white shadow-lg hover:bg-green-700 hover:scale-[1.05] transition-all flex items-center gap-2"
                            >
                                <Lock size={16} /> Create Login
                            </button>
                        )}

                        <button
                            onClick={() => setShowLetterModal(true)}
                            className={`px-4 py-2.5 rounded-xl font-semibold border transition-all flex items-center gap-2
                            ${darkMode ? 'bg-purple-600 border-purple-500 text-white hover:bg-purple-700' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'}`}
                        >
                            <FileText size={16} /> Generate Letter
                        </button>

                        <button
                            onClick={() => onEdit && onEdit(employee)}
                            className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Tabs Trigger --- */}
            <div className={`mt-6 flex border-b transition-all ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 flex items-center gap-2 text-sm font-bold transition-all border-b-2 -mb-[2px]
                            ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-500'
                                : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* --- Tab Content --- */}
            <div className="mt-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
                        {/* 1. Personal Info */}
                        <InfoCard title="Personal Details" icon={Mail} delay={100}>
                            <InfoRow label="Phone" value={employee.phone} />
                            <InfoRow label="Email" value={employee.email} />
                            <InfoRow label="Address" value={employee.address} />
                            <InfoRow label="Nationality" value={employee.nationality || "Saudi Arabia"} />
                            <InfoRow label="DOB" value={employee.dob} />
                        </InfoCard>

                        {/* 2. Employment Info */}
                        <InfoCard title="Employment" icon={Briefcase} delay={200}>
                            <InfoRow label="Department" value={employee.department} />
                            <InfoRow label="Join Date" value={employee.joining_date} />
                            <InfoRow label="Contract Type" value="Full Time" />
                            <InfoRow label="Salary" value={`SAR ${employee.total_salary ? Number(employee.total_salary).toLocaleString() : employee.basic_salary || '-'}`} />
                            <InfoRow label="Status" value={employee.status} />
                        </InfoCard>

                        {/* 3. Identity Info */}
                        <InfoCard title="Identity info" icon={Shield} delay={300}>
                            <InfoRow label="Iqama Number" value={employee.iqama_no} />
                            <InfoRow label="Iqama Expires" value={employee.iqama_expiry || "25 Dec 2025"} alert={iqamaStatus} />
                            <InfoRow label="Passport No" value={employee.passport_no} />
                            <InfoRow label="Passport Expires" value={employee.passport_expiry || "10 Oct 2028"} alert={passportStatus} />
                            <InfoRow label="Driver License" value="DL-998877" />
                        </InfoCard>

                        {/* Work History Snippet */}
                        <div className="md:col-span-3">
                            <div className={`p-6 rounded-2xl border backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                            <Briefcase size={20} className="stroke-[1.5]" />
                                        </div>
                                        <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Activity</h3>
                                    </div>
                                    <button className="text-sm font-bold text-blue-500 hover:underline">View All</button>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {[
                                        { title: 'Starbucks Repair', loc: 'Riyadh Park', date: 'Today', status: 'In Progress' },
                                        { title: 'H&M Maintenance', loc: 'Red Sea Mall', date: 'Yesterday', status: 'Completed' }
                                    ].map((job, i) => (
                                        <div key={i} className={`min-w-[250px] p-4 rounded-xl border flex-1 ${darkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'}`}>
                                            <h4 className={`font-bold text-sm mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{job.title}</h4>
                                            <p className="text-xs text-gray-500">{job.loc} • {job.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Asset Snippet */}
                        <div className="md:col-span-3">
                            <div className={`p-6 rounded-2xl border backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                            <Laptop size={20} className="stroke-[1.5]" />
                                        </div>
                                        <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Assigned Assets</h3>
                                    </div>
                                    <button onClick={() => setActiveTab('assets')} className="text-sm font-bold text-blue-500 hover:underline">Manage All</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {employeeAssets.length > 0 ? employeeAssets.slice(0, 3).map(asset => (
                                        <div key={asset.id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} flex items-center gap-3`}>
                                            <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">{getAssetIcon(asset.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{asset.name}</p>
                                                <p className="text-[10px] text-gray-400">{asset.serial_number || 'No S/N'}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-3 py-4 text-center text-gray-400 text-sm">No assets assigned yet</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Attendance Report</h3>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        className={`px-3 py-2 rounded-lg border text-sm outline-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className={`px-3 py-2 rounded-lg border text-sm outline-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                        {[2024, 2025, 2026].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={fetchAttendance}
                                        className={`p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                                        <RefreshCw size={16} className={attendanceLoading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>

                            {/* Detailed Attendance Summary (History Style) */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-green-600/10 border-green-500/30' : 'bg-green-50 border-green-100'}`}>
                                    <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Present</p>
                                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-green-900'}`}>{attendanceStats.PRESENT}</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-orange-600/10 border-orange-500/30' : 'bg-orange-50 border-orange-100'}`}>
                                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Late</p>
                                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-orange-900'}`}>{attendanceStats.LATE}</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-red-600/10 border-red-500/30' : 'bg-red-50 border-red-100'}`}>
                                    <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Absent</p>
                                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-red-900'}`}>{attendanceStats.ABSENT}</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-blue-600/10 border-blue-500/30' : 'bg-blue-50 border-blue-100'}`}>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Leave</p>
                                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-blue-900'}`}>{attendanceStats.LEAVE}</p>
                                </div>
                            </div>

                            {/* Monthly Summary Cards - High Contrast Colors */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className={`p-5 rounded-2xl border-2 ${darkMode ? 'bg-blue-600/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'} shadow-sm`}>
                                    <div className={`text-[11px] font-black uppercase mb-2 flex items-center gap-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                        <Clock size={14} /> Regular Shift Total
                                    </div>
                                    <div className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-blue-950'}`}>
                                        {Math.floor(attendanceData.reduce((acc, r) => acc + (r.regMinutes || 0), 0) / 60)}h {attendanceData.reduce((acc, r) => acc + (r.regMinutes || 0), 0) % 60}m
                                    </div>
                                    <div className={`text-[10px] mt-1 font-bold ${darkMode ? 'text-blue-400/60' : 'text-blue-600/60'}`}>Standard Working Hours</div>
                                </div>
                                <div className={`p-5 rounded-2xl border-2 ${darkMode ? 'bg-orange-600/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'} shadow-sm`}>
                                    <div className={`text-[11px] font-black uppercase mb-2 flex items-center gap-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                                        <Shield size={14} /> Overtime Total
                                    </div>
                                    <div className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-orange-950'}`}>
                                        {Math.floor(attendanceData.reduce((acc, r) => acc + (r.otMinutes || 0), 0) / 60)}h {attendanceData.reduce((acc, r) => acc + (r.otMinutes || 0), 0) % 60}m
                                    </div>
                                    <div className={`text-[10px] mt-1 font-bold ${darkMode ? 'text-orange-400/60' : 'text-orange-600/60'}`}>Extra Approved Hours</div>
                                </div>
                                <div className={`p-5 rounded-2xl border-2 ${darkMode ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'} shadow-sm`}>
                                    <div className={`text-[11px] font-black uppercase mb-2 flex items-center gap-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                        <Briefcase size={14} /> Combined Hours
                                    </div>
                                    <div className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-indigo-950'}`}>
                                        {Math.floor(attendanceData.reduce((acc, r) => acc + (r.regMinutes + r.otMinutes || 0), 0) / 60)}h {attendanceData.reduce((acc, r) => acc + (r.regMinutes + r.otMinutes || 0), 0) % 60}m
                                    </div>
                                    <div className={`text-[10px] mt-1 font-bold ${darkMode ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>Gross Production Time</div>
                                </div>
                            </div>

                            {attendanceLoading ? (
                                <div className="py-20 text-center text-gray-400">Loading records...</div>
                            ) : attendanceData.length === 0 ? (
                                <div className="py-20 text-center text-gray-400">No attendance records found for this period.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className={`text-xs uppercase border-b ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-100'}`}>
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Regular Shift</th>
                                                <th className="px-4 py-3">Overtime (OT)</th>
                                                <th className="px-4 py-3">Total Hrs</th>
                                                <th className="px-4 py-3">Device / IP</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {attendanceData.map((record, idx) => (
                                                <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                                                    <td className="px-4 py-4 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                                            ${record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                                record.status === 'LATE' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex justify-between text-[10px] font-bold text-blue-600">
                                                                <span>{Math.floor(record.regMinutes / 60)}h {record.regMinutes % 60}m</span>
                                                            </div>
                                                            <div className="w-24 bg-blue-100 dark:bg-blue-900/20 rounded-full h-1 overflow-hidden">
                                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (record.regMinutes / 480) * 100)}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {record.otMinutes > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex justify-between text-[10px] font-bold text-orange-600">
                                                                    <span>{Math.floor(record.otMinutes / 60)}h {record.otMinutes % 60}m</span>
                                                                </div>
                                                                <div className="w-24 bg-orange-100 dark:bg-orange-900/20 rounded-full h-1 overflow-hidden">
                                                                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(100, (record.otMinutes / 120) * 100)}%` }}></div>
                                                                </div>
                                                            </div>
                                                        ) : <span className="text-gray-300">-</span>}
                                                    </td>
                                                    <td className={`px-4 py-4 font-black ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>
                                                        {Math.floor((record.regMinutes + record.otMinutes) / 60)}h {(record.regMinutes + record.otMinutes) % 60}m
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col text-[10px] text-gray-400">
                                                            <span className="truncate max-w-[120px]">{record.device_info || '-'}</span>
                                                            <span>{record.ip_address || '-'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className="md:col-span-3">
                            <InfoCard title="Employee Documents" icon={FileText} delay={100}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { title: "Iqama Copy", type: "IMG", date: "Added today", size: "1.2 MB" },
                                        { title: "Passport Scan", type: "PDF", date: "12 Jan 2024", size: "2.4 MB" },
                                        { title: "Emp Contract", type: "PDF", date: "01 Mar 2023", size: "0.8 MB" },
                                    ].map((doc, idx) => (
                                        <DocumentCard key={idx} {...doc} onPreview={() => setPreviewDoc(doc)} />
                                    ))}
                                </div>
                            </InfoCard>
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.3s_ease-out]">
                        <InfoCard title="Bank Details" icon={CreditCard} delay={100}>
                            <InfoRow label="Bank Name" value={employee.bank_name} />
                            <InfoRow label="Account No" value={employee.account_number} />
                            <InfoRow label="IBAN" value={employee.iban_number} />
                        </InfoCard>
                        <InfoCard title="Salary & Benefits" icon={DollarSign} delay={200}>
                            <InfoRow label="Basic Salary" value={`SAR ${employee.basic_salary || '-'}`} />
                            <InfoRow label="Housing" value={`SAR ${employee.housing_allowance || '-'}`} />
                            <InfoRow label="Transport" value={`SAR ${employee.transport_allowance || '-'}`} />
                            <InfoRow label="Allowances" value={`SAR ${employee.other_allowance || '-'}`} />
                            <InfoRow label="Recurring Deduction" value={`SAR ${employee.recurring_deduction || '-'}`} alert={employee.recurring_deduction > 0 ? { status: 'warning', label: 'Monthly', color: 'text-red-500' } : null} />
                            <InfoRow label="Overtime Rate" value={`${employee.overtime_rate || '1.5'}x`} />
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <InfoRow label="Total Salary" value={`SAR ${employee.total_salary || '-'}`} />
                            </div>
                        </InfoCard>

                        {/* Salary History Section */}
                        <div className="md:col-span-2">
                            <div className={`p-6 rounded-2xl border backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                            <Calendar size={20} className="stroke-[1.5]" />
                                        </div>
                                        <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Salary Payment History</h3>
                                    </div>
                                    <button onClick={fetchPayrollHistory} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                        <RefreshCw size={16} className={payrollLoading ? 'animate-spin' : ''} />
                                    </button>
                                </div>

                                {payrollLoading ? (
                                    <div className="py-10 text-center text-gray-400">Loading history...</div>
                                ) : payrollHistory.length === 0 ? (
                                    <div className="py-10 text-center text-gray-400 border border-dashed rounded-xl">No payment records found.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className={`text-xs uppercase border-b ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-100'}`}>
                                                <tr>
                                                    <th className="px-4 py-3">Month</th>
                                                    <th className="px-4 py-3 text-right">Basic</th>
                                                    <th className="px-4 py-3 text-right text-green-500">Allowances</th>
                                                    <th className="px-4 py-3 text-right text-red-500">Deductions</th>
                                                    <th className="px-4 py-3 text-right">Net Pay</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {payrollHistory.map((record, i) => (
                                                    <tr key={i} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                                                        <td className="px-4 py-4 font-bold">
                                                            {new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-4 py-4 text-right font-mono text-gray-500">SAR {Number(record.basic_salary).toLocaleString()}</td>
                                                        <td className="px-4 py-4 text-right font-mono text-green-600">
                                                            +SAR {(Number(record.housing_allowance) || 0) + (Number(record.transport_allowance) || 0) + (Number(record.other_allowance) || 0) + (Number(record.overtime_pay) || 0)}
                                                        </td>
                                                        <td className="px-4 py-4 text-right font-mono text-red-500">-SAR {Number(record.deductions).toLocaleString()}</td>
                                                        <td className={`px-4 py-4 text-right font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            SAR {Number(record.net_salary).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase
                                                                ${record.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                                    record.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'access' && (
                    <div className="max-w-2xl animate-[fadeIn_0.3s_ease-out]">
                        <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                        <Lock size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>System Login Control</h3>
                                        <p className="text-sm text-gray-500">Manage portal access for this employee</p>
                                    </div>
                                </div>
                                {employee.user_id && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVE ACCOUNT</span>}
                            </div>

                            {!employee.user_id ? (
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl text-center border border-blue-100 dark:border-blue-900/30">
                                    <Shield size={48} className="mx-auto text-blue-500 mb-4 opacity-50" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">This employee does not have a system login yet. Create one to allow them to access the portal.</p>
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all"
                                    >
                                        Provision Login Access
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoCard title="Login Credentials" icon={User} delay={0}>
                                            <InfoRow label="Username" value={employee.email} />
                                            <InfoRow label="Last Login" value="2 hours ago" />
                                        </InfoCard>
                                        <InfoCard title="Security" icon={Shield} delay={0}>
                                            <InfoRow label="Status" value="Verified" />
                                            <InfoRow label="2FA" value="Disabled" />
                                        </InfoCard>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Reset Password</button>
                                        <button className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors">Deactivate Account</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex justify-between items-center px-2">
                            <div>
                                <h3 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{employeeAssets.length} Assets Assigned</h3>
                                <p className="text-sm text-gray-500">Track company property currently with {displayName}</p>
                            </div>
                            <button
                                onClick={() => setShowAssignModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                            >
                                <Plus size={18} /> Assign Asset
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {employeeAssets.map(asset => (
                                <div key={asset.id} className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} group relative`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            {getAssetIcon(asset.type)}
                                        </div>
                                        <button
                                            onClick={() => handleReturnAsset(asset.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Return to Inventory"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                    <h4 className={`font-bold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{asset.name}</h4>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Brand/Model</span>
                                            <span className="font-medium">{asset.brand} {asset.model}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Serial No</span>
                                            <span className="font-mono text-[10px]">{asset.serial_number || '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Assigned On</span>
                                            <span className="font-medium text-blue-500">{asset.assigned_date ? new Date(asset.assigned_date).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {employeeAssets.length === 0 && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                                    <div className="text-gray-300 dark:text-gray-600 mb-2">
                                        <Laptop size={48} className="mx-auto" />
                                    </div>
                                    <p className="text-gray-500 italic">No inventory items assigned to this profile</p>
                                </div>
                            )}
                        </div>

                        {/* Assign Asset Modal */}
                        {showAssignModal && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}>
                                <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold italic text-blue-500">Assign New Asset Entry</h3>
                                        <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><LucideX size={20} /></button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="space-y-2">
                                            {allAssets.filter(a => a.status === 'Available').length > 0 ? (
                                                allAssets.filter(a => a.status === 'Available').map(asset => (
                                                    <div key={asset.id} className={`p-4 rounded-xl border flex items-center justify-between hover:border-blue-500 cursor-pointer transition-all ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}
                                                        onClick={() => handleQuickAssign(asset.id)}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white dark:bg-gray-800 rounded">{getAssetIcon(asset.type)}</div>
                                                            <div>
                                                                <p className="font-bold text-sm">{asset.name}</p>
                                                                <p className="text-[10px] text-gray-500">{asset.brand} • {asset.serial_number || 'No S/N'}</p>
                                                            </div>
                                                        </div>
                                                        <Plus size={18} className="text-blue-500" />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center py-4 text-gray-500 italic">No available assets found in inventory</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-6 border-t dark:border-gray-700 pt-4 text-center">
                                        <p className="text-xs text-gray-500">Need to add a new item first? Go to Asset Inventory.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />

            {
                showLetterModal && (
                    <LetterGeneratorModal
                        employee={employee}
                        onClose={() => setShowLetterModal(false)}
                    />
                )
            }

            {/* Create Login Modal */}
            {
                showLoginModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}>
                        <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transform scale-100 transition-all ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Provision System Access</h2>
                                <button onClick={() => setShowLoginModal(false)}><ArrowLeft size={20} className="rotate-180" /></button>
                            </div>
                            <form onSubmit={handleCreateLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">Email (Username)</label>
                                    <input type="email" className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                        value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">Password</label>
                                    <input type="text" className={`w-full p-3 rounded-lg border outline-none font-mono ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                        value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                                    <p className="text-[10px] opacity-60 mt-1">System generated safe password.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">Assign Role</label>
                                    <select className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                        value={loginForm.roleId} onChange={e => setLoginForm({ ...loginForm, roleId: e.target.value })}>
                                        <option value="">Select Role</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg mt-2">
                                    Create Account
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Termination Action */}
            <div className="mt-8 flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to terminate this employee? This action is reversible from the Terminated list.')) {
                            onTerminate && onTerminate(employee.id);
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    <Shield size={16} />
                    Terminate Employment
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default EmployeDetails;
