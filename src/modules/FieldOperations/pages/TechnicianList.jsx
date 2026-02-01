import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, MapPin, Phone, Mail, Star,
    Briefcase, CheckCircle, Clock, User, Plus, Zap, Heart
} from 'lucide-react';
import FieldOperationsService from '../../../services/FieldOperationsService';

const TechnicianList = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [regionFilter, setRegionFilter] = useState('ALL');

    useEffect(() => {
        loadTechnicians();
    }, []);

    const loadTechnicians = async () => {
        setLoading(true);
        try {
            const response = await FieldOperationsService.getTechnicians();
            setTechnicians(response.data || []);
        } catch (error) {
            console.error("Failed to load technicians:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTechnicians = technicians.filter(tech => {
        const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tech.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || tech.status === statusFilter;
        const matchesRegion = regionFilter === 'ALL' || tech.region === regionFilter;
        return matchesSearch && matchesStatus && matchesRegion;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Idle': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'On Leave': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} animate-[fadeIn_0.5s_ease-out]`}>
            {/* Header */}
            <div className={`px-8 py-8 ${darkMode ? 'bg-slate-800' : 'bg-white border-b border-slate-200 shadow-sm'}`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Technician Roster</h1>
                        <p className="text-slate-500 font-medium">Manage field staff, view availability and performance</p>
                    </div>
                    <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all flex items-center gap-2">
                        <Plus size={20} /> Add Technician
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or skill..."
                            className={`w-full pl-12 pr-4 py-4 rounded-xl text-sm font-bold border-2 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 focus:border-violet-500 text-slate-900 shadow-sm'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className={`px-6 py-4 rounded-xl border-2 outline-none font-bold text-sm cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-violet-200 shadow-sm'}`}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Idle">Idle</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                    <select
                        className={`px-6 py-4 rounded-xl border-2 outline-none font-bold text-sm cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-violet-200 shadow-sm'}`}
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                    >
                        <option value="ALL">All Regions</option>
                        <option value="CP">Central Province</option>
                        <option value="WP">Western Province</option>
                        <option value="EP">Eastern Province</option>
                    </select>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTechnicians.map(tech => (
                            <div
                                key={tech.id}
                                onClick={() => navigate(`/field-ops/technicians/${tech.id}`)}
                                className={`group relative p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-violet-300'}`}
                            >
                                {/* Background Accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-bl-full transition-all group-hover:scale-110 ${tech.status === 'Active' ? 'from-emerald-400 to-emerald-600' : 'from-slate-400 to-slate-600'}`}></div>

                                <div className="relative z-10 flex items-start gap-4 mb-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg ${tech.status === 'Active' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-slate-400'}`}>
                                        {tech.avatar}
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tech.name}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(tech.status)}`}>
                                            {tech.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <MapPin size={16} className="text-rose-500" />
                                        <span>{tech.region} Region</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <Briefcase size={16} className="text-violet-500" />
                                        <span>{tech.activeJobs} Active Jobs</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <Star size={16} className="text-amber-400 fill-amber-400" />
                                        <span>{tech.rating} Rating</span>
                                    </div>
                                </div>

                                <div className="relative z-10 flex flex-wrap gap-2">
                                    {tech.skills.slice(0, 3).map((skill, i) => (
                                        <span key={i} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:border-violet-100 group-hover:bg-violet-50 group-hover:text-violet-700 transition-colors'}`}>
                                            {skill}
                                        </span>
                                    ))}
                                    {tech.skills.length > 3 && (
                                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                            +{tech.skills.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianList;
