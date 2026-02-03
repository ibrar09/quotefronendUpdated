import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Image as ImageIcon, Video, Mic, X, Paperclip, CheckCheck, Trash2, CheckSquare, Square, MoreVertical, MessageSquare } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import API_BASE_URL from '../../../config/api';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import MediaSidebar from './MediaSidebar';
import { CHAT_BACKGROUND_IMAGE } from '../../../config/constants';

const JobChat = ({ jobId, onClose, quoteNo, title, allowDelete = true }) => {
    const { darkMode } = useTheme();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showGallery, setShowGallery] = useState(false);

    // Selection Mode State
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMsgs, setSelectedMsgs] = useState(new Set());

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (!selectionMode) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectionMode]);

    // Fetch initial messages & Mark as Read
    useEffect(() => {
        fetchMessages();
        markMessagesRead();
    }, [jobId]);

    const markMessagesRead = async () => {
        try {
            await axios.put(
                `${API_BASE_URL}/api/jobs/${jobId}/messages/read`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Setup Socket.io
    useEffect(() => {
        const token = localStorage.getItem('token');
        const newSocket = io(API_BASE_URL, {
            auth: { token }
        });

        newSocket.emit('join_job', jobId);

        newSocket.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
            if (!selectionMode) toast.success('New message received');
        });

        newSocket.on('message_deleted', ({ messageIds }) => {
            setMessages((prev) => prev.filter((msg) => !messageIds.includes(msg.id)));
            if (selectionMode) {
                setSelectedMsgs((prev) => new Set(Array.from(prev).filter((id) => !messageIds.includes(id))));
            }
        });

        newSocket.on('all_messages_read', ({ job_id: eventJobId, reader_id }) => {
            if (parseInt(eventJobId) === parseInt(jobId) && reader_id !== currentUser.id) {
                setMessages(prev => prev.map(msg =>
                    msg.sender_id === currentUser.id ? { ...msg, is_read: true } : msg
                ));
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave_job', jobId);
            newSocket.disconnect();
        };
    }, [jobId, selectionMode]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/jobs/${jobId}/messages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(response.data.data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const sendTextMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/jobs/${jobId}/messages`,
                { message_text: newMessage, message_type: 'TEXT' },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.data.success) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleFileUpload = async (file, type) => {
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('message_type', type);

            await axios.post(
                `${API_BASE_URL}/api/jobs/${jobId}/messages`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            toast.success(`${type} uploaded successfully`);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file');
        }
    };

    // Selection Logic
    const toggleSelection = (id) => {
        setSelectedMsgs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleLongPress = (id) => {
        if (!allowDelete) return;
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedMsgs(new Set([id]));
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    const selectAll = () => {
        if (selectedMsgs.size === messages.length) {
            setSelectedMsgs(new Set());
        } else {
            setSelectedMsgs(new Set(messages.map(m => m.id)));
        }
    };

    const deleteSelected = async () => {
        if (selectedMsgs.size === 0) return;
        if (!window.confirm(`Delete ${selectedMsgs.size} messages?`)) return;

        try {
            const ids = Array.from(selectedMsgs);
            const response = await axios.post(
                `${API_BASE_URL}/api/messages/batch-delete`,
                { message_ids: ids, job_id: jobId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                setSelectionMode(false);
                setSelectedMsgs(new Set());
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(error.response?.data?.message || 'Failed to delete messages');
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'voice-note.webm', { type: 'audio/webm' });
                handleFileUpload(file, 'AUDIO');
                stream.getTracks().forEach(track => track.stop());
            };

            setMediaRecorder(recorder);
            recorder.start();
            setRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && recording) {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    // Sub-component for individual messages
    const MessageBubble = ({ message, isSelected, onClick, onLongPress }) => {
        const isOwn = message.sender_id === currentUser.id;
        const isSystem = message.message_type === 'SYSTEM';
        const timerRef = useRef(null);

        if (isSystem) {
            return (
                <div className="flex justify-center w-full my-3 px-4">
                    <div className={`${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100/80 text-gray-500'} 
                        px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm border border-transparent dark:border-gray-700
                        animate-[fadeIn_0.3s_ease-out]`}>
                        {message.message_text}
                    </div>
                </div>
            );
        }

        const handleTouchStart = () => {
            timerRef.current = setTimeout(() => {
                onLongPress(message.id);
            }, 500);
        };

        const handleTouchEnd = () => {
            clearTimeout(timerRef.current);
        };

        const getSenderColor = (name) => {
            if (!name) return '#00a884';
            const colors = ['#34b7f1', '#ffbc38', '#e542a3', '#9141ac', '#00a884'];
            let hash = 0;
            for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
            return colors[Math.abs(hash) % colors.length];
        };

        return (
            <div
                className={`flex w-full mb-1 relative group ${isOwn ? 'justify-end' : 'justify-start'}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onContextMenu={(e) => { e.preventDefault(); onLongPress(message.id); }}
            >
                {selectionMode && (
                    <div className={`absolute inset-y-0 ${isOwn ? 'left-0' : 'right-0'} flex items-center px-2 z-10`}>
                        <div
                            onClick={(e) => { e.stopPropagation(); onClick(message.id); }}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer
                                ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                        >
                            {isSelected && <X size={12} className="text-white" />}
                        </div>
                    </div>
                )}

                <div
                    className={`max-w-[85%] md:max-w-[70%] px-3 py-1.5 rounded-2xl relative shadow-sm transition-all
                        ${isSelected ? 'brightness-90 scale-[0.98]' : ''}
                        ${isOwn ? 'bg-[#dcf8c6] text-[#111b21] rounded-tr-none' : 'bg-white text-[#111b21] rounded-tl-none'}`}
                >
                    {!isOwn && message.sender_name && (
                        <p className="text-[11px] font-bold mb-0.5" style={{ color: getSenderColor(message.sender_name) }}>
                            {message.sender_name}
                        </p>
                    )}

                    {message.message_type === 'IMAGE' ? (
                        <div className="rounded-lg overflow-hidden mb-1 mt-0.5 cursor-pointer" onClick={() => window.open(message.file_url, '_blank')}>
                            <img src={message.file_url} alt="Shared" className="max-w-full h-auto max-h-60 object-contain" />
                        </div>
                    ) : message.message_type === 'VIDEO' ? (
                        <div className="rounded-lg overflow-hidden mb-1 mt-0.5">
                            <video src={message.file_url} controls className="max-w-full h-auto max-h-60" />
                        </div>
                    ) : message.message_type === 'AUDIO' ? (
                        <div className="flex items-center gap-2 py-2 min-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                                <Mic size={20} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                            </div>
                            <audio src={message.file_url} controls className="h-8 flex-1" />
                        </div>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed py-0.5">{message.message_text}</p>
                    )}

                    <div className="flex items-center justify-end gap-1 -mr-1 mt-0.5 opacity-60">
                        <span className="text-[10px]">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOwn && (
                            <CheckCheck size={14} className={message.is_read ? 'text-blue-400' : 'text-gray-400'} />
                        )}
                    </div>

                    {/* Speech Bubbles Tails */}
                    <div className={`absolute top-0 w-2 h-2.5 
                        ${isOwn
                            ? `right-[-6px] text-[#dcf8c6]`
                            : `left-[-6px] text-white`
                        }`}
                    >
                        <svg viewBox="0 0 8 10" className="w-full h-full fill-current">
                            {isOwn ? <path d="M0 0 L8 0 L0 10 Z" /> : <path d="M8 0 L0 0 L8 10 Z" />}
                        </svg>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full relative bg-white`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-2.5 shadow-sm shrink-0 z-20 
                    ${selectionMode ? 'bg-cyan-50 text-cyan-900' : 'bg-[#f0f2f5] border-b border-[#d1d7db]'}`}>

                {selectionMode ? (
                    <>
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setSelectionMode(false); setSelectedMsgs(new Set()); }} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                                <X size={20} />
                            </button>
                            <span className="font-bold text-lg">{selectedMsgs.size} Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={selectAll} className="p-2 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 rounded-full" title="Select All">
                                <CheckSquare size={20} />
                            </button>
                            <button
                                onClick={deleteSelected}
                                disabled={selectedMsgs.size === 0}
                                className={`p-2 rounded-full ${selectedMsgs.size > 0 ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-300'}`}
                                title="Delete Selected"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col min-w-0">
                                <h3 className={`font-bold text-base truncate text-[#111b21]`}>
                                    {title || 'Job Chat'}
                                </h3>
                                <p className={`text-[10px] truncate text-[#667781]`}>
                                    {quoteNo ? `Job: #${quoteNo}` : 'Direct Messaging'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowGallery(true)}
                                className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                                title="Media Gallery"
                            >
                                <ImageIcon size={20} />
                            </button>

                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#54656f] dark:text-[#aebac1] ml-1`}
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Messages Container */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-1 select-none"
                style={{
                    backgroundImage: `url("${CHAT_BACKGROUND_IMAGE}")`,
                    backgroundSize: '400px',
                    backgroundBlendMode: 'soft-light',
                    backgroundColor: 'white'
                }}
            >
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center h-full ${darkMode ? 'text-[#8696a0]' : 'text-[#667781]'}`}>
                        <div className={`p-6 rounded-full mb-4 ${darkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
                            <MessageSquare size={48} className="opacity-40" />
                        </div>
                        <p className="font-bold text-sm">No messages yet.</p>
                        <p className="text-xs mt-1 opacity-60">Start the conversation about this job.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isSelected={selectedMsgs.has(msg.id)}
                            onClick={toggleSelection}
                            onLongPress={handleLongPress}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!selectionMode && (
                <div className={`px-2 py-3 sm:px-4 shrink-0 flex items-center gap-1 sm:gap-2 z-20 bg-[#f0f2f5] border-t border-[#d1d7db]`}>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-full transition-colors text-[#54656f] hover:bg-black/5 shrink-0`}
                    >
                        <Paperclip size={24} />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const type = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
                                handleFileUpload(file, type);
                                e.target.value = '';
                            }
                        }}
                    />

                    <form onSubmit={sendTextMessage} className="flex-1 flex items-center gap-1 sm:gap-2">
                        <div className={`flex-1 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] rounded-xl sm:rounded-2xl transition-all
                            bg-white shadow-sm`}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message"
                                className={`flex-1 bg-transparent text-sm sm:text-base focus:outline-none placeholder:text-[#8696a0] text-[#111b21]`}
                            />
                        </div>

                        {newMessage.trim() ? (
                            <button
                                type="submit"
                                className="p-3.5 sm:p-3 rounded-full transition-all active:scale-90 bg-[#00a884] text-white shadow-md flex items-center justify-center shrink-0"
                            >
                                <Send size={22} className="ml-0.5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={recording ? stopRecording : startRecording}
                                className={`p-3.5 sm:p-3 rounded-full transition-all active:scale-90 flex items-center justify-center shrink-0
                                    ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-[#54656f] shadow-sm'}`}
                            >
                                <Mic size={24} />
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* Media Sidebar */}
            <MediaSidebar
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                messages={messages}
                darkMode={darkMode}
            />
        </div>
    );
};

export default JobChat;
