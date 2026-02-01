import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Clock, MapPin, User, AlertCircle, CheckCircle } from 'lucide-react';
import FieldOperationsService from '../../../services/FieldOperationsService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const KanbanBoard = ({ jobs, onJobUpdate }) => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    // Group jobs by status
    const [columns, setColumns] = useState({
        'PENDING': [],
        'ASSIGNED': [],
        'IN_PROGRESS': [],
        'COMPLETED': []
    });

    useEffect(() => {
        if (jobs) {
            const newColumns = {
                'PENDING': jobs.filter(j => !j.status || j.status === 'PENDING'),
                'ASSIGNED': jobs.filter(j => j.status === 'ASSIGNED'),
                'IN_PROGRESS': jobs.filter(j => j.status === 'IN_PROGRESS'),
                'COMPLETED': jobs.filter(j => j.status === 'COMPLETED')
            };
            setColumns(newColumns);
        }
    }, [jobs]);

    const handleDragStart = (e, jobId, sourceCol) => {
        e.dataTransfer.setData('jobId', jobId);
        e.dataTransfer.setData('sourceCol', sourceCol);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetCol) => {
        e.preventDefault();
        const jobId = parseInt(e.dataTransfer.getData('jobId'));
        const sourceCol = e.dataTransfer.getData('sourceCol');

        if (sourceCol === targetCol) return;

        // Optimistic UI Update
        const jobToMove = columns[sourceCol].find(j => j.id === jobId);
        if (!jobToMove) return;

        const updatedJob = { ...jobToMove, status: targetCol };

        setColumns(prev => ({
            ...prev,
            [sourceCol]: prev[sourceCol].filter(j => j.id !== jobId),
            [targetCol]: [...prev[targetCol], updatedJob]
        }));

        try {
            // Call API to update status
            let progress = 0;
            if (targetCol === 'IN_PROGRESS') progress = 10;
            if (targetCol === 'COMPLETED') progress = 100;

            // We'll update both status and progress
            // Note: In a real app, you might have separate endpoints or a more robust 'updateJob'
            // For now, we simulate the status change impact
            await FieldOperationsService.updateJobProgress(jobId, progress);

            // If the parent component passed a refresh callback, call it
            if (onJobUpdate) onJobUpdate();

            toast.success(`Job moved to ${targetCol.replace('_', ' ')}`);
        } catch (error) {
            console.error("Failed to update job status:", error);
            toast.error("Failed to move job");
            // Revert changes if needed (omitted for brevity)
        }
    };

    const getColumnColor = (status) => {
        switch (status) {
            case 'PENDING': return 'border-orange-200 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-900/10';
            case 'ASSIGNED': return 'border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10';
            case 'IN_PROGRESS': return 'border-purple-200 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-900/10';
            case 'COMPLETED': return 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    const getStatusTitle = (status) => {
        switch (status) {
            case 'PENDING': return 'To Do';
            case 'ASSIGNED': return 'Assigned';
            case 'IN_PROGRESS': return 'In Progress';
            case 'COMPLETED': return 'Done';
            default: return status;
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-200px)]">
            {Object.keys(columns).map(status => (
                <div
                    key={status}
                    className={`flex-shrink-0 w-80 flex flex-col rounded-2xl border ${getColumnColor(status)} transition-colors`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                >
                    {/* Column Header */}
                    <div className="p-4 flex justify-between items-center border-b dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${status === 'COMPLETED' ? 'bg-green-500' :
                                    status === 'IN_PROGRESS' ? 'bg-purple-500' :
                                        status === 'ASSIGNED' ? 'bg-blue-500' : 'bg-orange-500'
                                }`}></span>
                            <h3 className={`font-black uppercase text-sm tracking-wider ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                {getStatusTitle(status)}
                            </h3>
                        </div>
                        <span className="px-2 py-1 rounded bg-white dark:bg-gray-800 text-xs font-bold text-gray-500 shadow-sm border dark:border-gray-700">
                            {columns[status].length}
                        </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        <AnimatePresence>
                            {columns[status].map(job => (
                                <motion.div
                                    key={job.id}
                                    layoutId={job.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`p-4 rounded-xl shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative
                                        ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, job.id, status)}
                                    onClick={() => navigate(`/field-ops/jobs/${job.id}`)}
                                >
                                    {/* Priority Badge */}
                                    {job.priority !== 'Normal' && (
                                        <div className="absolute top-3 right-3">
                                            <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border
                                                ${job.priority === 'Critical'
                                                    ? 'bg-red-100 text-red-600 border-red-200'
                                                    : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
                                                <AlertCircle size={10} /> {job.priority}
                                            </span>
                                        </div>
                                    )}

                                    <h4 className="font-bold text-sm mb-1 pr-6 truncate">{job.brand}</h4>
                                    <p className="text-[10px] text-gray-500 line-clamp-2 mb-3 h-8">{job.work_description}</p>

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                                            ${job.tech ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-300'}`}>
                                            {job.tech ? job.tech.avatar : '?'}
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium truncate max-w-[120px]">
                                            {job.tech ? job.tech.name : 'Unassigned'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700 text-[10px] text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={10} /> {job.city || 'CP'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} /> {new Date(job.assigned_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>

                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {columns[status].length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 py-10 border-2 border-dashed rounded-xl dark:border-gray-700">
                                <span className="text-xs font-bold uppercase">No Jobs</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
