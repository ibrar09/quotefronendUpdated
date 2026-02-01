import React, { useState, useMemo } from 'react';
import { X, Image as ImageIcon, Video, FileText, Download, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MediaSidebar = ({ isOpen, onClose, messages, darkMode }) => {
    const [activeTab, setActiveTab] = useState('MEDIA'); // MEDIA, DOCS

    const mediaMessages = useMemo(() => {
        return (messages || []).filter(m => m.message_type === 'IMAGE' || m.message_type === 'VIDEO');
    }, [messages]);

    const docMessages = useMemo(() => {
        return (messages || []).filter(m => m.message_type === 'FILE' || m.message_type === 'AUDIO');
    }, [messages]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed top-0 right-0 h-full w-full md:w-96 z-50 flex flex-col shadow-2xl
                            ${darkMode ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200'}`}
                    >
                        {/* Header */}
                        <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Shared Media</h3>
                            <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-2 gap-2">
                            <button
                                onClick={() => setActiveTab('MEDIA')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                    ${activeTab === 'MEDIA'
                                        ? (darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                        : (darkMode ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50')}`}
                            >
                                <ImageIcon size={14} /> Photos & Videos
                            </button>
                            <button
                                onClick={() => setActiveTab('DOCS')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                    ${activeTab === 'DOCS'
                                        ? (darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                        : (darkMode ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50')}`}
                            >
                                <FileText size={14} /> Documents
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'MEDIA' ? (
                                mediaMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon size={48} className="mb-2 opacity-20" />
                                        <p className="text-sm">No photos or videos yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {mediaMessages.map(msg => (
                                            <div key={msg.id} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100 dark:bg-gray-800 cursor-pointer border dark:border-gray-700">
                                                {msg.message_type === 'VIDEO' ? (
                                                    <div className="w-full h-full flex items-center justify-center relative">
                                                        <video src={msg.file_url} className="w-full h-full object-cover opacity-80" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                                            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                                                <Play size={14} className="text-white fill-white ml-0.5" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-1 right-1">
                                                            <Video size={10} className="text-white drop-shadow-md" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={msg.file_url}
                                                        alt="Shared"
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                        onClick={() => window.open(msg.file_url, '_blank')}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                docMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <FileText size={48} className="mb-2 opacity-20" />
                                        <p className="text-sm">No documents shared</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {docMessages.map(msg => (
                                            <div key={msg.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-colors
                                                ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                                    ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white border text-blue-500'}`}>
                                                    {msg.message_type === 'AUDIO' ? <Play size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                        {msg.message_type === 'AUDIO' ? 'Voice Message' : (msg.file_name || 'Document')}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">
                                                        {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <a
                                                    href={msg.file_url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`p-2 rounded-full transition-colors
                                                        ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-white text-gray-500'}`}
                                                >
                                                    <Download size={16} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MediaSidebar;
