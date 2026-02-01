import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Settings, Bell, Shield, Users, Database, Globe,
    Save, ToggleLeft, ToggleRight, Briefcase
} from 'lucide-react';

const FieldSettings = () => {
    const { darkMode, themeStyles } = useTheme();
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'jobTypes', label: 'Job Types', icon: Briefcase },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className={`p-4 md:p-6 min-h-screen ${themeStyles.container} animate-[fadeIn_0.5s_ease-out]`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-wider mb-2">Configurations</h1>
                    <p className="text-gray-500">Manage field operations settings and preferences</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:pb-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : darkMode
                                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className={`p-6 md:p-8 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>

                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold mb-4">Region Settings</h3>
                                <div className="grid gap-4">
                                    {['Central Province', 'Western Province', 'Eastern Province', 'Southern Province'].map(region => (
                                        <div key={region} className="flex items-center justify-between p-4 rounded-xl border dark:border-gray-700">
                                            <span className="font-bold text-sm">{region}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-green-500 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">Active</span>
                                                <button className="text-gray-400 hover:text-blue-500"><Settings size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-4">System Preferences</h3>
                                <div className="space-y-4">
                                    <ToggleTile title="Auto-assign Jobs" desc="Use AI to automatically assign incoming jobs" />
                                    <ToggleTile title="Require Check-in" desc="Technicians must check-in via app on arrival" checked={true} />
                                    <ToggleTile title="Customer Sign-off" desc="Require digital signature on job completion" checked={true} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'jobTypes' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Standard Job Types</h3>
                                <button className="text-xs font-bold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
                                    + Add Type
                                </button>
                            </div>
                            <div className="grid gap-3">
                                {['Maintenance', 'Installation', 'Repair', 'Inspection', 'Emergency'].map((type, i) => (
                                    <div key={type} className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 group hover:border-blue-500 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500'][i]}`}></div>
                                            <div>
                                                <p className="font-bold text-sm">{type}</p>
                                                <p className="text-xs text-gray-500">Standard priority: {i === 4 ? 'Critical' : 'Normal'}</p>
                                            </div>
                                        </div>
                                        <Settings size={16} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold mb-4">Alert Configurations</h3>
                            <div className="space-y-4">
                                <ToggleTile title="Job Assignment" desc="Notify technician when job is assigned" checked={true} />
                                <ToggleTile title="Job Completion" desc="Notify manager when job is completed" checked={true} />
                                <ToggleTile title="Job Overdue" desc="Alert when job exceeds expected duration" checked={true} />
                                <ToggleTile title="Low Rating Alert" desc="Notify when customer rating is below 3 stars" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="text-center py-12 text-gray-500">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Team configuration is managed in HR Module.</p>
                            <button className="mt-4 text-blue-500 font-bold hover:underline">Go to HR Settings</button>
                        </div>
                    )}

                    {/* Save Footer */}
                    <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end">
                        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Toggles
const ToggleTile = ({ title, desc, checked = false }) => {
    const { darkMode } = useTheme();
    const [isOn, setIsOn] = useState(checked);

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-700">
            <div>
                <p className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <button
                onClick={() => setIsOn(!isOn)}
                className={`text-3xl transition-colors ${isOn ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}
            >
                {isOn ? <ToggleRight /> : <ToggleLeft />}
            </button>
        </div>
    );
};

export default FieldSettings;
