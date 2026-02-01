import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import {
    ArrowLeft, MapPin, Phone, Mail, Star,
    Briefcase, CheckCircle, Clock, Calendar, Shield, Award
} from 'lucide-react';
import FieldOperationsService from '../../../services/FieldOperationsService';
import { motion } from 'framer-motion';

const TechnicianProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode, themeStyles } = useTheme();
    const [tech, setTech] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTech = async () => {
            try {
                const response = await FieldOperationsService.getTechnicianDetails(parseInt(id));
                if (response.success) setTech(response.data);
            } catch (error) {
                console.error("Failed to load technician:", error);
            } finally {
                setLoading(false);
            }
        };
        loadTech();
    }, [id]);

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div>;
    if (!tech) return <div className="p-10 text-center text-gray-500">Technician not found</div>;

    return (
        <div className={`min-h-screen pb-10 ${themeStyles.container} animate-[fadeIn_0.5s_ease-out]`}>
            {/* Header / Hero */}
            <div className={`relative h-48 md:h-64 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
                <div className="relative z-10 flex flex-col md:flex-row items-end md:items-start gap-6 mb-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-2xl flex items-center justify-center text-5xl font-black text-gray-800 dark:text-white">
                        {tech.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pb-2 text-center md:text-left">
                        <h1 className={`text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900 md:text-white'}`}>{tech.name}</h1>
                        <div className={`flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600 md:text-blue-100'}`}>
                            <span className="flex items-center gap-1"><MapPin size={16} /> {tech.region} Region</span>
                            <span className="flex items-center gap-1"><Briefcase size={16} /> {tech.skills[0]} Specialist</span>
                            <span className="flex items-center gap-1"><Star size={16} className="text-yellow-400" /> {tech.rating} Rating</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2">
                            <Phone size={18} /> Call
                        </button>
                        <button className={`px-6 py-2.5 rounded-xl font-bold border flex items-center gap-2 transition-all ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                            <Mail size={18} /> Email
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">Performance</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10">
                                    <span className="block text-2xl font-black text-blue-600">{tech.activeJobs}</span>
                                    <span className="text-xs font-bold text-blue-400">Active Jobs</span>
                                </div>
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10">
                                    <span className="block text-2xl font-black text-green-600">{tech.completedJobs || 0}</span>
                                    <span className="text-xs font-bold text-green-400">Completed</span>
                                </div>
                                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10">
                                    <span className="block text-2xl font-black text-yellow-600">{tech.rating}</span>
                                    <span className="text-xs font-bold text-yellow-500">Rating</span>
                                </div>
                                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10">
                                    <span className="block text-2xl font-black text-purple-600">98%</span>
                                    <span className="text-xs font-bold text-purple-400">On Time</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">Skills & Certifications</h3>
                            <div className="flex flex-wrap gap-2">
                                {tech.skills.map((skill, i) => (
                                    <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Col */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Assignments */}
                        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-6">Current Assignments</h3>
                            {!tech.currentJobs?.length ? (
                                <div className="text-center py-8 text-gray-400">No active assignments</div>
                            ) : (
                                <div className="space-y-4">
                                    {tech.currentJobs.map(job => (
                                        <div key={job.id} onClick={() => navigate(`/field-ops/jobs/${job.id}`)} className={`group p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${darkMode ? 'bg-gray-700/50 border-gray-700 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-blue-300'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-sm group-hover:text-blue-500 transition-colors">{job.brand}</h4>
                                                    <p className="text-xs text-gray-500">{job.location}</p>
                                                </div>
                                                <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600 uppercase">
                                                    {job.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-3">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${job.progress}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent History */}
                        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-6">Recent Completion History</h3>
                            {!tech.completedJobs?.length ? (
                                <div className="text-center py-8 text-gray-400">No history available</div>
                            ) : (
                                <div className="space-y-4">
                                    {tech.completedJobs.slice(0, 3).map(job => (
                                        <div key={job.id} className="flex justify-between items-center py-3 border-b dark:border-gray-700 last:border-0">
                                            <div>
                                                <h4 className="font-bold text-sm">{job.brand}</h4>
                                                <p className="text-xs text-gray-500">{new Date(job.completion_date).toLocaleDateString()} • {job.work_description.slice(0, 50)}...</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-green-500">
                                                <CheckCircle size={16} />
                                                <span className="text-xs font-bold">Done</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianProfile;
