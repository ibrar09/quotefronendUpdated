import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Send, Paperclip, MoreVertical, Phone, ArrowLeft, Smile, MessageSquare, Check, CheckCheck, Image as ImageIcon
} from 'lucide-react';
import { getMessages, sendMessage } from '../services/portal.service';
import { useAuth } from '../../../context/AuthContext';
import MediaSidebar from '../../FieldOperations/components/MediaSidebar';

const AdminSupportChat = ({ onBack }) => {
    const { darkMode } = useTheme();
    const { user } = useAuth();
    const scrollRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const data = await getMessages();
            setMessages(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e ? e.preventDefault() : null;
        if (!newMessage.trim()) return;

        try {
            const tempMessage = {
                id: Date.now(),
                content: newMessage,
                sender_id: user.id || 1,
                sender_type: 'USER',
                createdAt: new Date().toISOString(),
                Sender: { username: 'Me' }
            };
            setMessages([...messages, tempMessage]);
            setNewMessage('');

            await sendMessage({
                content: tempMessage.content,
                receiver_id: null,
                group_id: 'general'
            });

            fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const groupMessagesByDate = () => {
        const groups = {};
        messages.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const groupedMessages = groupMessagesByDate();

    return (
        <div className={`flex flex-col h-full ${darkMode ? 'bg-[#0b141a]' : 'bg-[#efe7dd]'} animate-[fadeIn_0.3s_ease-out]`}>
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0
                ${darkMode ? 'bg-[#202c33] border-b border-[#202c33]' : 'bg-[#f0f2f5] border-b border-[#d1d7db]'}`}>
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                        <ArrowLeft size={20} className={darkMode ? 'text-gray-300' : 'text-[#54656f]'} />
                    </button>

                    <div className="relative cursor-pointer">
                        <img src="https://ui-avatars.com/api/?name=Admin+Support&background=0D8ABC&color=fff" alt="Support" className="w-10 h-10 rounded-full" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#202c33] rounded-full"></span>
                    </div>
                    <div className="cursor-pointer">
                        <h1 className={`font-medium text-base leading-none ${darkMode ? 'text-[#e9edef]' : 'text-[#111b21]'}`}>Admin Support</h1>
                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-[#8696a0]' : 'text-[#667781]'}`}>Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[#54656f] dark:text-[#aebac1]">
                    <button
                        onClick={() => setShowGallery(true)}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                        title="Media Gallery"
                    >
                        <ImageIcon size={20} />
                    </button>
                    <button type="button" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hidden sm:block"><Phone size={20} /></button>
                    <button type="button" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4`}
                style={{ backgroundImage: darkMode ? 'none' : 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px', backgroundBlendMode: 'soft-light' }}
                ref={scrollRef}>

                {loading ? <p className="text-center text-gray-500 mt-10">Loading messages...</p> :
                    Object.keys(groupedMessages).length === 0 ?
                        <div className="flex flex-col items-center justify-center h-full text-[#8696a0]">
                            <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-6 rounded-full mb-4">
                                <MessageSquare size={48} className="opacity-40" />
                            </div>
                            <p className="text-sm font-medium">No messages here yet</p>
                            <p className="text-xs mt-1">Send a message to start the conversation.</p>
                        </div>
                        :
                        Object.keys(groupedMessages).map(date => (
                            <div key={date}>
                                <div className="flex justify-center mb-6 sticky top-2 z-10">
                                    <span className={`text-xs font-medium shadow-sm px-3 py-1.5 rounded-lg
                                        ${darkMode ? 'bg-[#202c33] text-[#8696a0]' : 'bg-white text-[#54656f]'}`}>{date}</span>
                                </div>
                                <div className="space-y-1">
                                    {groupedMessages[date].map((msg) => {
                                        const isMe = msg.Sender?.username === 'Me' || msg.sender_id === user?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}>
                                                <div className={`max-w-[75%] px-3 py-1.5 rounded-lg shadow-sm relative text-sm leading-relaxed
                                                    ${isMe
                                                        ? 'bg-[#005c4b] text-white rounded-tr-none' // WhatsApp Message Green
                                                        : darkMode ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none' : 'bg-white text-[#111b21] rounded-tl-none'
                                                    }`}>

                                                    {/* Sender Name for Others */}
                                                    {!isMe && (
                                                        <div className="text-xs font-bold mb-0.5 text-orange-600 dark:text-orange-400">
                                                            {msg.Sender?.username || 'Support'}
                                                        </div>
                                                    )}

                                                    {/* Message Content */}
                                                    {msg.type === 'IMAGE' ? (
                                                        <div className="rounded-lg overflow-hidden mb-1 mt-0.5 cursor-pointer" onClick={() => window.open(msg.media_url, '_blank')}>
                                                            <img src={msg.media_url} alt="Shared" className="max-w-full h-auto max-h-60 object-contain" />
                                                        </div>
                                                    ) : msg.type === 'AUDIO' ? (
                                                        <div className="flex items-center gap-2 py-2 min-w-[200px]">
                                                            <audio src={msg.media_url} controls className="h-8 flex-1" />
                                                        </div>
                                                    ) : (
                                                        <span className="whitespace-pre-wrap">{msg.content}</span>
                                                    )}

                                                    {/* Time & Status */}
                                                    <div className={`text-[10px] float-right mt-1 ml-2 flex items-center gap-0.5 select-none
                                                        ${isMe ? 'text-[#8696a0] dark:text-[#aebac1]' : 'text-[#667781] dark:text-[#8696a0]'}`}
                                                        style={{ color: isMe ? 'rgba(255,255,255,0.6)' : undefined }}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMe && <CheckCheck size={14} className="text-[#53bdeb] ml-0.5" />}
                                                    </div>

                                                    {/* Tail SVG (Optional CSS trick, simulating here via clip-path or absolute elements is complex, using rounded hacks instead) */}
                                                    <div className={`absolute top-0 w-3 h-3 
                                                        ${isMe
                                                            ? '-right-1.5 bg-[#005c4b] [clip-path:polygon(0_0,100%_0,0_100%)]'
                                                            : `-left-1.5 ${darkMode ? 'bg-[#202c33]' : 'bg-white'} [clip-path:polygon(100%_0,0_0,100%_100%)]`
                                                        }`}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className={`px-4 py-3 shrink-0 flex items-center gap-2 z-20
                ${darkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>

                <button type="button" className={`p-2 rounded-full transition-colors ${darkMode ? 'text-[#8696a0] hover:bg-white/10' : 'text-[#54656f] hover:bg-black/5'}`}>
                    <Smile size={24} />
                </button>
                <button type="button" className={`p-2 rounded-full transition-colors ${darkMode ? 'text-[#8696a0] hover:bg-white/10' : 'text-[#54656f] hover:bg-black/5'}`}>
                    <Paperclip size={24} />
                </button>

                <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                    ${darkMode ? 'bg-[#2a3942]' : 'bg-white'}`}>
                    <input
                        type="text"
                        placeholder="Type a message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className={`flex-1 bg-transparent text-sm focus:outline-none placeholder:text-[#8696a0] ${darkMode ? 'text-[#d1d7db]' : 'text-[#111b21]'}`}
                    />
                </div>

                <button
                    type="submit"
                    className={`p-3 rounded-full transition-all active:scale-95 flex items-center justify-center
                    ${newMessage.trim()
                            ? 'bg-[#00a884] text-white shadow-sm'
                            : darkMode ? 'text-[#8696a0] hover:bg-white/10' : 'text-[#54656f] hover:bg-black/5'}`}
                >
                    <Send size={newMessage.trim() ? 20 : 24} className={newMessage.trim() ? 'ml-0.5' : ''} />
                </button>
            </form>

            <MediaSidebar
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                messages={messages.map(m => ({
                    ...m,
                    message_type: m.type,
                    file_url: m.media_url,
                    file_name: m.content || 'Attached File'
                }))}
                darkMode={darkMode}
            />
        </div>
    );
};


export default AdminSupportChat;
