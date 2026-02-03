import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Map, List, Plus, Search, Filter, MoreHorizontal,
    Calendar, Clock, User, CheckCircle, AlertCircle,
    ChevronRight, MapPin, Briefcase, RefreshCw, X
} from 'lucide-react';
import { MAPBOX_STATIC_PLACEHOLDER } from '../../../config/constants';

const FieldOpsManager = () => {
    const { darkMode, themeStyles, colors } = useTheme();
    const [viewMode, setViewMode] = useState('LIST'); // 'LIST' | 'MAP'
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredJobs, setFilteredJobs] = useState([]);

    // Mock Active Jobs (Expanded for Table)
    const [jobs, setJobs] = useState([
        { id: 101, title: 'Starbucks Signage Repair', location: 'Riyadh Park', city: 'Riyadh', tech: 'Neil Sims', status: 'In Progress', progress: 65, startTime: '09:00 AM', eta: '02:00 PM', priority: 'High' },
        { id: 102, title: 'H&M HVAC Maintenance', location: 'Red Sea Mall', city: 'Jeddah', tech: 'Bonnie Green', status: 'Pending', progress: 0, startTime: '---', eta: 'Tomorrow', priority: 'Medium' },
        { id: 103, title: 'IKEA Assembly', location: 'Showroom A', city: 'Dammam', tech: 'Jese Leos', status: 'Completed', progress: 100, startTime: 'Yesterday', eta: 'Done', priority: 'Low' },
        { id: 104, title: 'Zara Lighting Fix', location: 'Nakheel Mall', city: 'Riyadh', tech: 'Thomes Lean', status: 'In Progress', progress: 45, startTime: '10:30 AM', eta: '04:00 PM', priority: 'High' },
        { id: 105, title: 'Sephora Shelf Install', location: 'U Walk', city: 'Riyadh', tech: 'Pending', status: 'Unassigned', progress: 0, startTime: '---', eta: '---', priority: 'Urgent' },
    ]);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = jobs.filter(job =>
            job.title.toLowerCase().includes(lowerSearch) ||
            job.location.toLowerCase().includes(lowerSearch) ||
            job.tech.toLowerCase().includes(lowerSearch) ||
            job.city.toLowerCase().includes(lowerSearch)
        );
        setFilteredJobs(filtered);
    }, [searchTerm, jobs]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'text-green-600 font-bold';
            case 'In Progress': return 'text-blue-500 font-bold';
            case 'Pending': return 'text-orange-500';
            case 'Unassigned': return 'text-red-500 font-bold';
            default: return 'text-gray-500';
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'Urgent': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 animate-pulse">URGENT</span>;
            case 'High': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600">HIGH</span>;
            case 'Medium': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">MED</span>;
            default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">LOW</span>;
        }
    };

    return (
        <div className={`p-4 md:p-6 min-h-screen text-[10px] ${themeStyles.container}`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider mb-1">
                        Field Operations Manager
                    </h1>
                    <p className={colors.textSecondary}>
                        Track assignments, technician status, and job progress
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className={`flex p-1 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('MAP')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'MAP' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Map View"
                        >
                            <Map size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowAssignModal(true)}
                        className={`${themeStyles.button} justify-center`}
                    >
                        <Plus size={16} /> Assign Job
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 flex gap-4 items-center">
                <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Job, Technician, Location..."
                        className={`block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 transition duration-150 ease-in-out sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8aa] ${darkMode
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                            }`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => { }} // Refresh logic here
                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all border-2
                    ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-teal-500' : 'bg-white border-gray-300 text-gray-500 hover:border-teal-500'}`}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Content Area */}
            {viewMode === 'LIST' ? (
                <div className={`overflow-x-auto shadow-xl border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className={themeStyles.tableHeader}>
                                <th className="p-3 border-r">Job ID</th>
                                <th className="p-3 border-r">Job Title</th>
                                <th className="p-3 border-r">Priority</th>
                                <th className="p-3 border-r">Location</th>
                                <th className="p-3 border-r">City</th>
                                <th className="p-3 border-r">Technician</th>
                                <th className="p-3 border-r text-center">Status</th>
                                <th className="p-3 border-r">Progress</th>
                                <th className="p-3 border-r">Start Time</th>
                                <th className="p-3 border-r">ETA</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={darkMode ? 'text-gray-300' : 'text-black'}>
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="p-8 text-center opacity-50 font-bold uppercase tracking-widest">
                                        No active jobs found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map((job, index) => (
                                    <tr
                                        key={job.id}
                                        className={`${themeStyles.tableRow} transition-all hover:bg-black/5 dark:hover:bg-white/5 border-b dark:border-gray-700 last:border-0`}
                                    >
                                        <td className="p-3 font-mono text-gray-500">#{job.id}</td>
                                        <td className="p-3 font-bold">{job.title}</td>
                                        <td className="p-3">{getPriorityBadge(job.priority)}</td>
                                        <td className="p-3 flex items-center gap-1">
                                            <MapPin size={12} className="text-gray-400" /> {job.location}
                                        </td>
                                        <td className="p-3">{job.city}</td>
                                        <td className="p-3 flex items-center gap-2">
                                            {job.tech !== 'Pending' && (
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                    {job.tech.charAt(0)}
                                                </div>
                                            )}
                                            <span className={job.tech === 'Pending' ? 'italic text-gray-400' : ''}>
                                                {job.tech}
                                            </span>
                                        </td>
                                        <td className={`p-3 text-center ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </td>
                                        <td className="p-3">
                                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${job.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${job.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[9px] text-right mt-1 text-gray-400">{job.progress}%</div>
                                        </td>
                                        <td className="p-3">{job.startTime}</td>
                                        <td className="p-3">{job.eta}</td>
                                        <td className="p-3 text-center">
                                            <button className="text-blue-500 hover:underline font-bold">Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Map View Placeholder - Keeping consistent for now */
                <div className={`flex-1 rounded-2xl overflow-hidden relative border min-h-[500px] ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-cover opacity-50" style={{ backgroundImage: `url('${MAPBOX_STATIC_PLACEHOLDER}')` }}>
                        <p className="bg-black/80 text-white px-4 py-2 rounded-xl backdrop-blur-md">Interactive Map View</p>
                    </div>
                </div>
            )}

            {/* Assign Job Modal (Simplified Version) */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className={`w-[90%] max-w-lg p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Assign New Job</h2>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Job Title</label>
                                <input type="text" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} placeholder="e.g. Starbucks Sign Repair" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Location</label>
                                    <input type="text" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} placeholder="Select Location" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Priority</label>
                                    <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Assign Technician</label>
                                <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <option>Select a technician...</option>
                                    <option>Neil Sims (Active)</option>
                                    <option>Bonnie Green (Idle)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="flex-1 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    // Logic to add job would go here
                                    alert('Job Assigned Successfully!');
                                }}
                                className="flex-1 py-3 bg-[#00a8aa] hover:bg-[#008f91] text-white font-bold rounded-xl shadow-lg shadow-teal-500/20"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FieldOpsManager;
