import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Plus } from 'lucide-react';
import FieldOperationsService from '../../../services/FieldOperationsService';
import { useNavigate } from 'react-router-dom';

const FieldSchedule = () => {
    const { darkMode, themeStyles } = useTheme();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [jobs, setJobs] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [jobsRes, techsRes] = await Promise.all([
                FieldOperationsService.getAssignedJobs(),
                FieldOperationsService.getTechnicians()
            ]);
            setJobs(jobsRes.data || []);
            setTechnicians(techsRes.data || []);
        } catch (error) {
            console.error("Failed to load schedule data", error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Helper Functions
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (increment) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    // Filter jobs for specific day
    const getJobsForDay = (day) => {
        return jobs.filter(job => {
            const jobDate = new Date(job.assigned_date);
            return jobDate.getDate() === day &&
                jobDate.getMonth() === currentDate.getMonth() &&
                jobDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className={`h-32 border-b border-r ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayJobs = getJobsForDay(day);
            days.push(
                <div key={day} className={`group h-32 border-b border-r p-2 relative transition-colors overflow-hidden
                    ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}
                    ${isToday(day) ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50/50') : ''}`}>

                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                            ${isToday(day)
                                ? 'bg-blue-600 text-white'
                                : (darkMode ? 'text-gray-400' : 'text-gray-700')}`}>
                            {day}
                        </span>

                        {/* Hover Add Button */}
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all">
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                        {dayJobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => navigate(`/field-ops/jobs/${job.id}`)}
                                className={`text-[9px] p-1.5 rounded border cursor-pointer truncate font-medium transition-all hover:scale-[1.02]
                                    ${job.status === 'COMPLETED'
                                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
                                        : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'}`}
                            >
                                {job.brand} • {job.tech?.name.split(' ')[0]}
                            </div>
                        ))}
                        {dayJobs.length === 0 && day % 7 === 0 && ( /* Fake job for demo if empty and random condition */
                            <div className="opacity-0 group-hover:opacity-50 text-[9px] text-gray-400 text-center mt-4">
                                No jobs
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className={`p-4 md:p-6 min-h-screen ${themeStyles.container} animate-[fadeIn_0.5s_ease-out]`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                        <CalendarIcon size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-wider mb-1">Schedule</h1>
                        <div className="flex items-center gap-2">
                            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft size={16} /></button>
                            <span className={`text-base font-bold min-w-[140px] text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className={`px-4 py-2 rounded-xl font-bold text-sm border flex items-center gap-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <Filter size={16} /> Filter
                    </button>
                    <button className={`${themeStyles.button} justify-center`}>
                        <Plus size={16} /> Schedule Job
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Weekday Headers */}
                <div className={`grid grid-cols-7 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold uppercase text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7">
                    {renderCalendarDays()}
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs font-bold text-gray-500">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div> Scheduled</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500"></div> Completed</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500"></div> Pending</div>
            </div>
        </div>
    );
};

export default FieldSchedule;
