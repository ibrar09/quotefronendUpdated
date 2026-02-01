import { Users, GitFork, FileText, Settings, UserPlus, DollarSign, MapPin, UserMinus, Plane, Box, Receipt } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const Tabbar = ({ activeTab, setActiveTab }) => {
    const { darkMode } = useTheme();

    const tabs = [
        { id: 'Manage Employees', icon: <Users size={18} /> },
        { id: 'Add Employee', icon: <UserPlus size={18} /> },
        { id: 'Payroll', icon: <DollarSign size={18} /> },
        { id: 'Expenses', icon: <Receipt size={18} /> },
        { id: 'Attendance', icon: <MapPin size={18} /> },
        { id: 'Assets', icon: <Box size={18} /> },
        { id: 'Terminated', icon: <UserMinus size={18} /> },
        { id: 'Leave Management', icon: <Plane size={18} /> },
        { id: 'Settings', icon: <Settings size={18} /> },
    ];

    return (
        <div className={`mb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                {tabs.map((tab) => (
                    <li key={tab.id} className="me-6">
                        <button
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg group transition-all duration-200
                            ${activeTab === tab.id
                                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                    : `border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                                }`}
                        >
                            {tab.icon}
                            {tab.id}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Tabbar;