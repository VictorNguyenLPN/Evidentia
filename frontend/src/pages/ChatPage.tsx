import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    SquarePen,
    Calendar,
    Paperclip,
    ArrowUp,
    PanelLeft,
    SlidersHorizontal,
    Search,
    MoreVertical,
    MoreHorizontal,
    Pencil,
    X,
    Clock,
    ChevronRight,
    LibraryBig,
    Pin,
    PinOff,
    ArchiveRestore,
    Settings,
    LogOut,
    Sparkles,
    FileText,
    CheckCircle2,
    Loader2,
    Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Button from '../components/button';
import ScrollableText from '../components/scrollable-text';

interface Citation {
    document_title: string;
    hierarchy_path: string[];
    legal_content: string;
    issue_date?: string;
    effect_date?: string;
    effect_status_name?: string;
    doc_type?: string;
    hybrid_score?: number;
}

interface PipelineStep {
    step: string;
    status: string;
    message: string;
}

interface Message {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    targetDate?: string;
    analysis?: {
        search_query?: string;
        intent?: string;
        target_date?: string;
        domain?: string;
    };
    citations?: Citation[];
    steps?: PipelineStep[];
}

interface ChatSession {
    id: string;
    title: string;
    time: string;
    tag: string;
    isPinned: boolean;
}

const CURRENT_USER_EMAIL = 'huy.nguyen@evidentia.vn';

// Generate a 16-character hex hash from user email + timestamp + random entropy on frontend
const generateChatId = (email: string = CURRENT_USER_EMAIL): string => {
    const raw = `${email}::${Date.now()}::${Math.random().toString(36).substring(2, 9)}`;
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < raw.length; i++) {
        const ch = raw.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    const s1 = ((h1 ^ (h1 >>> 16)) >>> 0).toString(16).padStart(8, '0');
    const s2 = ((h2 ^ (h2 >>> 16)) >>> 0).toString(16).padStart(8, '0');
    return `${s1}${s2}`;
};

export const ChatPage: React.FC = () => {
    const { chatId } = useParams<{ chatId?: string }>();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);
    const [inputPrompt, setInputPrompt] = useState('');
    const [targetDate, setTargetDate] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>('');

    const [chats, setChats] = useState<ChatSession[]>([]);

    // Fetch all chats from MongoDB / backend on mount
    const fetchChats = async () => {
        try {
            const res = await fetch('/api/chats');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setChats(data);
                }
            }
        } catch (err) {
            console.warn('Could not fetch chats from backend:', err);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    // Load messages when URL chatId changes
    useEffect(() => {
        if (!chatId) {
            setActiveChatId(null);
            setMessages([]);
            return;
        }

        // If this navigation was triggered by submitting the first question, skip premature 404 fetch
        if (isSendingMessageRef.current === chatId) {
            isSendingMessageRef.current = null;
            setActiveChatId(chatId);
            return;
        }

        setActiveChatId(chatId);

        const loadChatDetails = async () => {
            try {
                const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}`);
                if (res.ok) {
                    const chatDoc = await res.json();
                    if (chatDoc && Array.isArray(chatDoc.messages)) {
                        setMessages(chatDoc.messages);
                    }
                } else if (res.status === 404) {
                    console.warn(`Chat ${chatId} not found`);
                    setMessages([]);
                }
            } catch (err) {
                console.warn('Error loading chat messages:', err);
            }
        };

        loadChatDetails();
    }, [chatId]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const pinnedChats = chats.filter(c => c.isPinned);

    // Select chat handler
    const handleSelectChat = (id: string) => {
        isSendingMessageRef.current = null;
        navigate(`/chats/${encodeURIComponent(id)}`);
    };

    // New chat handler
    const handleNewChat = () => {
        isSendingMessageRef.current = null;
        navigate('/chats');
        setActiveChatId(null);
        setMessages([]);
        setInputPrompt('');
        setTargetDate('');
    };

    const isSendingMessageRef = useRef<string | null>(null);

    // Rename chat handler
    const handleRenameChat = async (id: string, newTitle: string) => {
        const cleanTitle = newTitle.trim();
        setEditingChatId(null);
        if (!cleanTitle) return;

        // Optimistic UI update
        setChats(prev => prev.map(c => c.id === id ? { ...c, title: cleanTitle } : c));

        try {
            await fetch(`/api/chats/${encodeURIComponent(id)}/rename`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: cleanTitle }),
            });
        } catch (err) {
            console.error('Error renaming chat:', err);
        }
    };

    // Toggle Pin on MongoDB
    const togglePin = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        // Optimistic UI update
        setChats(prev => prev.map(chat =>
            chat.id === id ? { ...chat, isPinned: !chat.isPinned } : chat
        ));

        try {
            await fetch(`/api/chats/${encodeURIComponent(id)}/pin`, { method: 'POST' });
        } catch (err) {
            console.error('Error toggling pin in MongoDB:', err);
        }
    };

    // Delete Chat on MongoDB
    const deleteChat = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setChats(prev => prev.filter(c => c.id !== id));
        if (activeChatId === id || chatId === id) {
            isSendingMessageRef.current = null;
            navigate('/chats');
            setActiveChatId(null);
            setMessages([]);
        }
        try {
            await fetch(`/api/chats/${encodeURIComponent(id)}`, { method: 'DELETE' });
        } catch (err) {
            console.error('Error deleting chat in MongoDB:', err);
        }
    };

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
        }
    }, [inputPrompt]);

    // Handle shortcut Cmd/Ctrl + K for search modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen]);

    // Send Message Handler
    const handleSendMessage = async () => {
        const queryText = inputPrompt.trim();
        if (!queryText || isLoading) return;

        // Generate chat ID immediately on frontend if starting a new chat
        const isNewChat = !chatId && !activeChatId;
        const currentChatId = chatId || activeChatId || generateChatId(CURRENT_USER_EMAIL);

        // Instantly update URL and active state when the first question is submitted
        if (isNewChat) {
            isSendingMessageRef.current = currentChatId;
            setActiveChatId(currentChatId);
            navigate(`/chats/${encodeURIComponent(currentChatId)}`, { replace: true });

            // Optimistically add to sidebar immediately
            const newChatSession: ChatSession = {
                id: currentChatId,
                title: queryText,
                time: 'Vừa xong',
                tag: 'Pháp luật',
                isPinned: false
            };
            setChats(prev => [newChatSession, ...prev.filter(c => c.id !== currentChatId)]);
        }

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg: Message = {
            id: String(Date.now()),
            sender: 'user',
            text: queryText,
            timestamp: currentTime,
            targetDate: targetDate || undefined,
        };

        setMessages(prev => [...prev, userMsg]);
        setInputPrompt('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: queryText,
                    target_date: targetDate || undefined,
                    top_k: 5,
                    chat_id: currentChatId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || 'Lỗi xử lý truy vấn pháp lý');
            }

            const data = await res.json();
            const assistantMsg: Message = {
                id: String(Date.now() + 1),
                sender: 'assistant',
                text: data.answer,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                targetDate: targetDate || undefined,
                analysis: data.analysis,
                citations: data.citations || [],
                steps: data.steps || [],
            };

            setMessages(prev => [...prev, assistantMsg]);

            if (data.chat_id) {
                setActiveChatId(data.chat_id);
            }

            // Refresh chat list from MongoDB
            fetchChats();
        } catch (err: any) {
            console.error('Error in chat request:', err);
            const errorMsg: Message = {
                id: String(Date.now() + 1),
                sender: 'assistant',
                text: `⚠️ **Không thể hoàn tất tra cứu**: ${err.message || 'Lỗi kết nối máy chủ hoặc API'}. Vui lòng kiểm tra lại cấu hình hệ thống.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="relative h-screen w-full bg-slate-50 text-slate-800 flex overflow-hidden font-sans">

            {/* ================= SEARCH MODAL (SPOTLIGHT / POPUP) ================= */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-xs">
                    {/* Backdrop Click to close */}
                    <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />

                    {/* Dialog Container */}
                    <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                        {/* Search Input Bar */}
                        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
                            <Search className="w-5 h-5 shrink-0" />
                            <input
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm đoạn chat, điều luật, văn bản quy phạm..."
                                className="w-full text-base text-slate-800 bg-transparent focus:outline-none font-medium"
                            />
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    variant="icon"
                                    size="sm"
                                    onClick={() => setIsSearchOpen(false)}
                                    title="Đóng tìm kiếm"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Results / Suggestions */}
                        <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
                                <span>Gần đây</span>
                                <Clock className="w-4 h-4 text-slate-400" />
                            </div>

                            <div className="space-y-1">
                                {chats
                                    .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((item) => (
                                        <Button
                                            key={item.id}
                                            variant="sidebar"
                                            onClick={() => {
                                                handleSelectChat(item.id);
                                                setIsSearchOpen(false);
                                            }}
                                            className="p-3 justify-between items-start group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-900 truncate">
                                                        {item.title}
                                                    </p>
                                                    <span className="text-xs text-slate-400">{item.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-start gap-2 shrink-0 pt-0.5">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-700 font-medium">
                                                    {item.tag}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                            </div>
                                        </Button>
                                    ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Mẹo: Nhấn <strong>Enter</strong> để chọn</span>
                            <span><strong>ESC</strong> để đóng</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= CITATION DETAIL MODAL ================= */}
            {selectedCitation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="fixed inset-0" onClick={() => setSelectedCitation(null)} />
                    <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 truncate">
                                        {selectedCitation.document_title}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate">
                                        {selectedCitation.hierarchy_path?.join(' > ')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="icon"
                                size="sm"
                                onClick={() => setSelectedCitation(null)}
                                title="Đóng"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-700">
                            <div className="flex flex-wrap gap-2 text-xs">
                                {selectedCitation.effect_status_name && (
                                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                                        Hiệu lực: {selectedCitation.effect_status_name}
                                    </span>
                                )}
                                {selectedCitation.effect_date && (
                                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                                        Ngày hiệu lực: {selectedCitation.effect_date}
                                    </span>
                                )}
                                {selectedCitation.doc_type && (
                                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                                        Loại VB: {selectedCitation.doc_type}
                                    </span>
                                )}
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                                {selectedCitation.legal_content}
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSelectedCitation(null)}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`${isSidebarOpen ? 'w-64 sm:w-72' : 'w-14'
                    } relative z-20 shrink-0 h-full border-r border-slate-200 flex flex-col justify-between select-none transition-[width] duration-300 ease-in-out overflow-hidden`}
            >
                {/* ================= TOP SECTION ================= */}
                <div className="p-2.5 pt-5 shrink-0">

                    {/* Header Row: Logo & Action Icons */}
                    <div className="mb-4 flex items-center justify-between h-9 px-2.5">
                        {isSidebarOpen ? (
                            <>
                                <Link
                                    to="/chats"
                                    onClick={handleNewChat}
                                    className="flex items-center min-w-0"
                                >
                                    <span className="text-xl font-bold tracking-tight text-indigo-600 whitespace-nowrap">
                                        Evidentia.
                                    </span>
                                </Link>

                                <div className="flex items-center gap-0.5 shrink-0">
                                    <Button
                                        variant="icon"
                                        size="sm"
                                        onClick={() => setIsSearchOpen(true)}
                                        title="Tìm kiếm"
                                    >
                                        <Search className="w-4 h-4 text-slate-800" />
                                    </Button>
                                    <Button
                                        variant="icon"
                                        size="sm"
                                        onClick={() => setIsSidebarOpen(false)}
                                        title="Thu nhỏ sidebar"
                                    >
                                        <PanelLeft className="w-4 h-4 text-slate-800" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-center w-full">
                                <Button
                                    variant="icon"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(true)}
                                    title="Mở rộng sidebar"
                                >
                                    <PanelLeft className="w-4 h-4 text-slate-800" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Quick Action Navigation items */}
                    <div className="space-y-1">
                        <button
                            onClick={handleNewChat}
                            className="w-full h-9 flex items-center gap-2.5 text-sm font-medium text-slate-800 hover:bg-slate-200/80 rounded-lg cursor-pointer transition-colors"
                            title="Đoạn chat mới"
                        >
                            <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                <SquarePen className="w-4 h-4" />
                            </div>
                            <span
                                className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                            >
                                Đoạn chat mới
                            </span>
                        </button>

                        <button
                            className="w-full h-9 flex items-center gap-2.5 text-sm font-medium text-slate-800 hover:bg-slate-200/80 rounded-lg cursor-pointer transition-colors"
                            title="Danh sách luật"
                        >
                            <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                <LibraryBig className="w-4 h-4" />
                            </div>
                            <span
                                className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                            >
                                Danh sách luật
                            </span>
                        </button>

                        <button
                            className="w-full h-9 flex items-center gap-2.5 text-sm font-medium text-slate-800 hover:bg-slate-200/80 rounded-lg cursor-pointer transition-colors"
                            title="Kho lưu trữ chat"
                        >
                            <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                <ArchiveRestore className="w-4 h-4" />
                            </div>
                            <span
                                className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                            >
                                Kho lưu trữ chat
                            </span>
                        </button>
                    </div>
                </div>

                {/* ================= MIDDLE: HISTORY LIST && PINNED================= */}
                <div
                    className={`flex-1 p-2.5 pt-2 overflow-y-auto space-y-5 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    {/* Danh sách ghim (chỉ hiện khi có đoạn chat được ghim) */}
                    {pinnedChats.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between px-3 mb-2 text-sm font-semibold text-gray-900/50 tracking-wider">
                                <span
                                    className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                >
                                    Chat được ghim
                                </span>
                            </div>

                            <div className="space-y-1">
                                {pinnedChats.map((item) => (
                                    <div
                                        key={`pinned-${item.id}`}
                                        onClick={() => handleSelectChat(item.id)}
                                        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer select-none transition-colors w-full text-left text-sm text-slate-900 ${activeChatId === item.id
                                            ? 'bg-slate-200'
                                            : 'bg-transparent hover:bg-slate-200/80'
                                            }`}
                                    >
                                        <div
                                            className={`flex flex-col text-left flex-1 min-w-0 pr-1.5 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                        >
                                            {editingChatId === item.id ? (
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleRenameChat(item.id, editingTitle);
                                                        } else if (e.key === 'Escape') {
                                                            setEditingChatId(null);
                                                        }
                                                    }}
                                                    onBlur={() => handleRenameChat(item.id, editingTitle)}
                                                    className="w-full bg-white border border-indigo-400 rounded px-1.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                                                />
                                            ) : (
                                                <ScrollableText
                                                    text={item.title}
                                                    className="text-sm text-slate-900 font-normal whitespace-nowrap"
                                                />
                                            )}
                                        </div>

                                        {/* 3-Dots Action Button & Dropdown */}
                                        <div className="relative flex items-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuChatId(openMenuChatId === item.id ? null : item.id);
                                                }}
                                                className={`p-1 rounded text-slate-400 hover:text-slate-900 transition-opacity ${openMenuChatId === item.id ? 'opacity-100 bg-slate-300/60' : 'opacity-0 group-hover:opacity-100'
                                                    }`}
                                                title="Tùy chọn đoạn chat"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>

                                            {openMenuChatId === item.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuChatId(null);
                                                        }}
                                                    />
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute -right-3 top-9 mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 space-y-0.5 select-none"
                                                    >
                                                        {/* Ghim đoạn chat */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                togglePin(item.id, e);
                                                                setOpenMenuChatId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg text-left cursor-pointer transition-colors"
                                                        >
                                                            <PinOff className="w-4 h-4 text-slate-500 shrink-0" />
                                                            <span>Bỏ ghim</span>
                                                        </button>

                                                        {/* Đổi tên */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingChatId(item.id);
                                                                setEditingTitle(item.title);
                                                                setOpenMenuChatId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg text-left cursor-pointer transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
                                                            <span>Đổi tên</span>
                                                        </button>

                                                        <div className="h-px bg-slate-100 my-0.5" />

                                                        {/* Xóa */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                deleteChat(item.id, e);
                                                                setOpenMenuChatId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-100 rounded-lg text-left cursor-pointer text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                                                            <span>Xóa đoạn chat</span>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between px-3 mb-2 text-sm font-semibold text-slate-900/50 tracking-wider">
                            <span
                                className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                            >
                                Lịch sử chat
                            </span>
                        </div>

                        <div className="space-y-1">
                            {chats
                                .filter((c) => !c.isPinned)
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelectChat(item.id)}
                                        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer select-none transition-colors w-full text-left text-sm text-slate-900 ${activeChatId === item.id
                                            ? 'bg-slate-200'
                                            : 'bg-transparent hover:bg-slate-200/80'
                                            }`}
                                    >
                                        <div
                                            className={`flex flex-col text-left flex-1 min-w-0 pr-1.5 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                        >
                                            {editingChatId === item.id ? (
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleRenameChat(item.id, editingTitle);
                                                        } else if (e.key === 'Escape') {
                                                            setEditingChatId(null);
                                                        }
                                                    }}
                                                    onBlur={() => handleRenameChat(item.id, editingTitle)}
                                                    className="w-full bg-white border border-indigo-400 rounded px-1.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                                                />
                                            ) : (
                                                <ScrollableText
                                                    text={item.title}
                                                    className="text-sm text-slate-900 font-normal whitespace-nowrap"
                                                />
                                            )}
                                        </div>

                                        {/* 3-Dots Action Button & Dropdown */}
                                        <div className="relative flex items-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuChatId(openMenuChatId === item.id ? null : item.id);
                                                }}
                                                className={`p-1 rounded text-slate-400 hover:text-slate-900 transition-opacity ${openMenuChatId === item.id ? 'opacity-100 bg-slate-300/60' : 'opacity-0 group-hover:opacity-100'
                                                    }`}
                                                title="Tùy chọn đoạn chat"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>

                                            {openMenuChatId === item.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuChatId(null);
                                                        }}
                                                    />
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute -right-3 top-9 mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 space-y-0.5 select-none"
                                                    >
                                                        {/* Ghim đoạn chat */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                togglePin(item.id, e);
                                                                setOpenMenuChatId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg text-left cursor-pointer transition-colors"
                                                        >
                                                            <Pin className="w-4 h-4 text-slate-500 shrink-0" />
                                                            <span>Ghim</span>
                                                        </button>

                                                        {/* Đổi tên */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingChatId(item.id);
                                                                setEditingTitle(item.title);
                                                                setOpenMenuChatId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg text-left cursor-pointer transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
                                                            <span>Đổi tên</span>
                                                        </button>

                                                        <div className="h-px bg-slate-100 my-0.5" />

                                                        {/* Xóa */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                deleteChat(item.id, e);
                                                                setOpenMenuChatId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-100 rounded-lg text-left cursor-pointer text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                                                            <span>Xóa đoạn chat</span>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* ================= BOTTOM: SIDEBAR FOOTER (ACCOUNT PROFILE) ================= */}
                <div className="h-[68px] p-2 border-t border-slate-200 flex items-center relative shrink-0">
                    {/* Account Settings Popover */}
                    {isProfileMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsProfileMenuOpen(false)}
                            />
                            <div
                                className={`absolute bottom-full left-2 ${isSidebarOpen ? 'right-2' : 'w-56'
                                    } mb-2 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 z-40`}
                            >
                                <button
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg text-left cursor-pointer transition-colors"
                                >
                                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span className="font-medium">Nâng cấp gói Pro</span>
                                </button>
                                <button
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg text-left cursor-pointer transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                                    <span>Cài đặt & Tùy chọn</span>
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left cursor-pointer transition-colors"
                                >
                                    <LogOut className="w-4 h-4 shrink-0" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Persistent Unified Account Profile Row */}
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-full h-full flex items-center gap-2.5 px-1.5 hover:bg-slate-200/80 rounded-lg text-left cursor-pointer transition-colors group overflow-hidden"
                        title="Tài khoản: Nguyễn Quang Huy"
                    >
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            H
                        </div>
                        <div
                            className={`min-w-0 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                        >
                            <p className="text-sm font-semibold text-slate-900 truncate leading-tight whitespace-nowrap">
                                Nguyễn Quang Huy
                            </p>
                            <p className="text-xs text-slate-400 truncate mt-0.5 whitespace-nowrap">
                                huy.nguyen@evidentia.vn
                            </p>
                        </div>
                    </button>
                </div>
            </aside>

            {/* ================= MAIN CHAT AREA ================= */}
            <main className="relative z-10 flex-1 flex flex-col h-full bg-white overflow-hidden">

                {/* Top Header */}


                {/* ================= MESSAGES & FOOTER SCROLL AREA ================= */}
                <div className="flex-1 overflow-y-auto px-2 z-20 flex flex-col justify-between">
                    <header className="py-5 sticky top-0 z-0 h-14 flex items-center justify-between bg-transparent pointer-events-none">
                        <div className="flex items-center gap-2 pointer-events-auto">
                            {targetDate && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    Áp dụng tại mốc: {targetDate}
                                    <button
                                        onClick={() => setTargetDate('')}
                                        className="hover:text-indigo-900"
                                        title="Xóa mốc thời gian"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>

                        {/* Right Header Options */}
                        <div className="flex items-center gap-1.5 pointer-events-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsSearchOpen(true)}
                                className="gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700"
                            >
                                <Search className="w-4 h-4" />
                                <span className="hidden sm:inline font-medium">Tìm kiếm</span>
                            </Button>

                            <Button variant="icon" size="sm" title="Cấu hình">
                                <SlidersHorizontal className="w-4 h-4" />
                            </Button>
                            <Button variant="icon" size="sm" title="Tùy chọn khác">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>
                    </header>

                    {messages.length === 0 ? (
                        /* Welcome Hero Screen */
                        <div className="flex-1 flex flex-col items-center justify-center my-auto">
                            <div className="max-w-2xl w-full text-center space-y-5">
                                <div className="space-y-2">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Hệ thống Sẵn sàng Hỗ trợ
                                    </h2>
                                    <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                                        Nhập câu hỏi, tình huống pháp lý hoặc đính kèm văn bản hợp đồng để kích hoạt quy trình lập luận và tra cứu theo mốc thời gian.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Active Conversation Messages */
                        <div className="relative z-10 max-w-4xl w-full mx-auto space-y-6 pb-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    {msg.sender === 'user' ? (
                                        <div className="max-w-2xl bg-indigo-100 text-black rounded-2xl rounded-br-sm px-4 py-3 shadow-xs">
                                            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                                {msg.text}
                                            </p>
                                            <div className="flex items-center justify-end gap-2 mt-1.5 text-[11px] text-gray-700">
                                                {msg.targetDate && (
                                                    <span>Mốc: {msg.targetDate}</span>
                                                )}
                                                <span>{msg.timestamp}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-4xl w-full bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-xs space-y-4">
                                            {/* Reasoning & Citations Header Bar */}
                                            {msg.citations && msg.citations.length > 0 && (
                                                <div className="space-y-2 pb-3 border-b border-slate-200/70">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                        <span>Căn cứ pháp lý trích dẫn ({msg.citations.length})</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.citations.map((cit, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setSelectedCitation(cit)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-xs text-slate-700 hover:text-indigo-700 transition-colors cursor-pointer"
                                                            >
                                                                <FileText className="w-3 h-3 text-indigo-600" />
                                                                <span className="font-medium truncate max-w-[200px]">
                                                                    {cit.document_title}
                                                                </span>
                                                                {cit.effect_status_name && (
                                                                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-100/70 text-emerald-800 font-medium">
                                                                        {cit.effect_status_name}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Answer Body (Markdown) */}
                                            <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-800">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-[11px] text-slate-400">
                                                <span>Evidentia Legal Assistant</span>
                                                <span>{msg.timestamp}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Thinking / Loading indicator */}
                            {isLoading && (
                                <div className="flex flex-col items-start">
                                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-sm p-4 shadow-xs space-y-2.5 max-w-md">
                                        <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                            <span>Evidentia đang phân tích và tra cứu...</span>
                                        </div>
                                        <div className="space-y-1 text-xs text-slate-500 pl-6">
                                            <p>• Phân tích câu hỏi & ràng buộc mốc thời gian</p>
                                            <p>• Hybrid Retrieval (BM25 + Dense) trên Qdrant Cloud</p>
                                            <p>• Kiểm chứng căn cứ pháp lý với Gemini Flash Lite</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* ================= INPUT FOOTER AREA (STICKY BOTTOM INSIDE SCROLL CONTAINER) ================= */}
                    <div className="sticky bottom-0 z-20 max-w-4xl w-full mx-auto mt-auto pt-2 bg-white rounded-lg">
                        {/* Date Picker Popover */}
                        {isDatePickerOpen && (
                            <div className="mb-2 p-3 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs">
                                <span className="font-medium text-slate-700">Chọn mốc thời gian tra cứu:</span>
                                <input
                                    type="date"
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    className="border border-slate-300 rounded-md px-2 py-1 text-slate-800 text-xs focus:outline-indigo-600"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsDatePickerOpen(false)}
                                    className="px-2 py-1 h-auto text-xs"
                                >
                                    Đóng
                                </Button>
                            </div>
                        )}

                        <div className="flex flex-col rounded-2xl bg-white border border-slate-300 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-100 shadow-lg shadow-slate-200/50 p-3">
                            <textarea
                                ref={textareaRef}
                                value={inputPrompt}
                                onChange={(e) => setInputPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                placeholder="Mô tả câu hỏi hoặc yêu cầu tra cứu pháp luật theo thời điểm..."
                                className="w-full bg-transparent text-slate-900 text-sm sm:text-base px-1.5 py-1 focus:outline-none resize-none font-sans min-h-[40px] max-h-56 overflow-y-auto"
                            />

                            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Paperclip className="w-4 h-4" />}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 font-medium"
                                    >
                                        <span className="hidden sm:inline">Tài liệu</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Calendar className="w-4 h-4" />}
                                        onClick={() => setIsDatePickerOpen(prev => !prev)}
                                        className={`px-3 py-1.5 font-medium ${targetDate ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                    >
                                        <span className="hidden sm:inline">
                                            {targetDate ? `Mốc: ${targetDate}` : 'Mốc thời gian'}
                                        </span>
                                    </Button>
                                </div>

                                {/* Send Button */}
                                <Button
                                    circle={true}
                                    variant="primary"
                                    onClick={handleSendMessage}
                                    disabled={!inputPrompt.trim() || isLoading}
                                    className="w-9 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Gửi yêu cầu"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Footer Disclaimer Note */}
                        <p className="my-3 text-center text-xs text-slate-500">
                            Evidentia có thể trả lời chưa chính xác. Vui lòng kiểm tra các thông tin quan trọng
                        </p>
                    </div>
                </div>


            </main>
        </div>
    );
};

export default ChatPage;
