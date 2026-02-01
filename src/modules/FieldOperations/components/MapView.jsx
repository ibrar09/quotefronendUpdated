import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { MapPin, User, Navigation, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MapView = ({ jobs, technicians }) => {
    const { darkMode } = useTheme();
    const [selectedItem, setSelectedItem] = useState(null);

    // Mock coordinates generation (for demo purposes)
    // accessible visual space is roughly 800x600 equivalent
    const getPosition = (id, type) => {
        // Deterministic pseudo-random based on ID
        const seed = type === 'job' ? id * 123 : id * 456;
        const top = (seed % 70) + 15; // 15% to 85%
        const left = (seed % 70) + 15; // 15% to 85%
        return { top: `${top}%`, left: `${left}%` };
    };

    return (
        <div className={`relative w-full h-[600px] rounded-2xl overflow-hidden border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            {/* Map Background (Styled for impact) */}
            <div className={`absolute inset-0 opacity-40 ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}
                style={{
                    backgroundImage: `radial-gradient(${darkMode ? '#333' : '#cbd5e1'} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }}>
            </div>

            {/* Stylized "Roads" simulation */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                <path d="M 100 100 Q 400 300 700 100" stroke={darkMode ? "white" : "black"} strokeWidth="2" fill="none" />
                <path d="M 0 300 Q 300 500 800 300" stroke={darkMode ? "white" : "black"} strokeWidth="2" fill="none" />
                <path d="M 200 0 Q 300 300 200 600" stroke={darkMode ? "white" : "black"} strokeWidth="2" fill="none" />
            </svg>

            {/* Pins */}
            {jobs.map(job => (
                <div
                    key={`job-${job.id}`}
                    className="absolute group cursor-pointer"
                    style={getPosition(job.id, 'job')}
                    onClick={() => setSelectedItem({ type: 'job', data: job })}
                >
                    <div className="relative">
                        <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:-translate-y-1
                            ${job.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-600'} text-white`}>
                            <BriefcaseIcon size={14} />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                            {job.brand}
                        </div>
                    </div>
                </div>
            ))}

            {technicians.map(tech => (
                <div
                    key={`tech-${tech.id}`}
                    className="absolute group cursor-pointer z-10"
                    style={getPosition(tech.id, 'tech')}
                    onClick={() => setSelectedItem({ type: 'tech', data: tech })}
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-pulse"></div>
                        <div className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-xl overflow-hidden transform transition-transform hover:scale-110 hover:-translate-y-1
                            ${tech.status === 'Active' ? 'grayscale-0' : 'grayscale'}`}>
                            {/* In real app, use tech.avatarUrl or similar */}
                            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                {tech.avatar}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                </div>
            ))}

            {/* Selected Item Popup */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 p-4 rounded-xl shadow-2xl backdrop-blur-md border z-20 
                            ${darkMode ? 'bg-gray-900/90 border-gray-700 text-white' : 'bg-white/90 border-blue-100 text-gray-900'}`}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>

                        {selectedItem.type === 'job' ? (
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <BriefcaseIcon size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">{selectedItem.data.brand}</h4>
                                    <p className="text-xs opacity-70 mb-2">{selectedItem.data.work_description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase
                                            ${selectedItem.data.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                            {selectedItem.data.status}
                                        </span>
                                        <button className="text-[10px] font-bold text-blue-500 hover:underline">View Details</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {selectedItem.data.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{selectedItem.data.name}</h4>
                                    <div className="flex items-center gap-1 text-xs opacity-70 mb-2">
                                        <MapPin size={12} /> {selectedItem.data.region} Region
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                            {selectedItem.data.activeJobs} Active Jobs
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute top-4 left-4 p-2 bg-white/80 dark:bg-black/50 backdrop-blur rounded-lg shadow-sm border dark:border-gray-700 flex flex-col gap-2 text-[10px] font-bold">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Active Job</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Completed</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Technician</div>
            </div>
        </div>
    );
};

const BriefcaseIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

export default MapView;
