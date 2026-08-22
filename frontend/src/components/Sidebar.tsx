import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    SquarePen,
    Search,
    PanelLeft,
    LibraryBig,
    ArchiveRestore,
    Pin,
    PinOff,
    MoreHorizontal,
    Pencil,
    Trash2,
    Settings,
    LogOut,
    Sparkles,
    Clock,
    ChevronRight,
    ChevronDown,
    X,
} from 'lucide-react';
import Button from './button';
import ScrollableText from './scrollable-text';

export interface ChatSession {
    id: string;
    title: string;
    time: string;
    tag: string;
    isPinned: boolean;
}

export interface SidebarProps {
    activeNav?: 'chat' | 'laws' | 'archive';
    activeChatId?: string | null;
    isSidebarOpen?: boolean;
    setIsSidebarOpen?: (open: boolean) => void;
    isSearchOpen?: boolean;
    setIsSearchOpen?: (open: boolean) => void;
    chats?: ChatSession[];
    setChats?: React.Dispatch<React.SetStateAction<ChatSession[]>>;
    onNewChat?: () => void;
    onSelectChat?: (chatId: string) => void;
    onDeleteChat?: (chatId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeNav = 'chat',
    activeChatId = null,
    isSidebarOpen: controlledIsSidebarOpen,
    setIsSidebarOpen: controlledSetIsSidebarOpen,
    isSearchOpen: controlledIsSearchOpen,
    setIsSearchOpen: controlledSetIsSearchOpen,
    chats: controlledChats,
    setChats: controlledSetChats,
    onNewChat,
    onSelectChat,
    onDeleteChat,
}) => {
    const navigate = useNavigate();

    // Internal state if not controlled from parent
    const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(true);
    const isSidebarOpen = controlledIsSidebarOpen !== undefined ? controlledIsSidebarOpen : internalIsSidebarOpen;
    const setIsSidebarOpen = controlledSetIsSidebarOpen || setInternalIsSidebarOpen;

    const [internalIsSearchOpen, setInternalIsSearchOpen] = useState(false);
    const isSearchOpen = controlledIsSearchOpen !== undefined ? controlledIsSearchOpen : internalIsSearchOpen;
    const setIsSearchOpen = controlledSetIsSearchOpen || setInternalIsSearchOpen;

    const [internalChats, setInternalChats] = useState<ChatSession[]>([]);
    const chats = controlledChats !== undefined ? controlledChats : internalChats;
    const setChats = controlledSetChats || setInternalChats;

    // Search dialog & dropdown states
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>('');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isPinnedExpanded, setIsPinnedExpanded] = useState(true);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

    // Fetch chats if not supplied by parent
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
            console.warn('Could not fetch chats in Sidebar:', err);
        }
    };

    useEffect(() => {
        if (controlledChats === undefined) {
            fetchChats();
        }
    }, [controlledChats]);

    const handleNewChat = () => {
        if (onNewChat) {
            onNewChat();
        } else {
            navigate('/chats');
        }
    };

    const handleSelectChat = (id: string) => {
        if (onSelectChat) {
            onSelectChat(id);
        } else {
            navigate(`/chats/${id}`);
        }
    };

    const togglePin = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/chats/${id}/pin`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setChats((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, isPinned: data.is_pinned } : c))
                );
            }
        } catch (err) {
            console.error('Failed to toggle pin:', err);
        }
    };

    const handleRenameChat = async (id: string, newTitle: string) => {
        const clean = newTitle.trim();
        if (!clean) {
            setEditingChatId(null);
            return;
        }
        try {
            const res = await fetch(`/api/chats/${id}/rename`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: clean }),
            });
            if (res.ok) {
                setChats((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, title: clean } : c))
                );
            }
        } catch (err) {
            console.error('Failed to rename chat:', err);
        } finally {
            setEditingChatId(null);
        }
    };

    const deleteChat = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setChats((prev) => prev.filter((c) => c.id !== id));
                if (onDeleteChat) {
                    onDeleteChat(id);
                } else if (activeChatId === id) {
                    navigate('/chats');
                }
            }
        } catch (err) {
            console.error('Failed to delete chat:', err);
        }
    };

    const pinnedChats = chats.filter((c) => c.isPinned);
    const unpinnedChats = chats.filter((c) => !c.isPinned);

    return (
        <>
            {/* ================= SEARCH POPUP MODAL ================= */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div
                        className="fixed inset-0"
                        onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
                        {/* Search Input Bar */}
                        <div className="flex items-center px-4 border-b border-slate-200 bg-white">
                            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                            <input
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm đoạn chat..."
                                className="w-full py-4 text-sm bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Recent / Search Results list */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Gần đây</span>
                                <Clock className="w-4 h-4 text-slate-400" />
                            </div>

                            <div className="space-y-1">
                                {chats
                                    .filter((item) =>
                                        item.title.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
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

            {/* ================= SIDEBAR CONTAINER ================= */}
            <aside
                className={`${isSidebarOpen ? 'w-64 sm:w-72' : 'w-14'
                    } relative z-20 shrink-0 h-full border-r border-slate-200 flex flex-col justify-between select-none transition-[width] duration-300 ease-in-out overflow-hidden bg-white`}
            >
                {/* ================= TOP SECTION ================= */}
                <div className="px-2.5 shrink-0">
                    {/* Header Row: Logo & Action Icons */}
                    <div className="flex items-center justify-between h-14 px-2.5">
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
                            className={`w-full h-9 flex items-center gap-2.5 text-sm font-medium ${activeNav === 'chat' && !activeChatId
                                ? 'bg-slate-200/80 text-slate-900'
                                : 'text-slate-800 hover:bg-slate-200/80'
                                } rounded-lg cursor-pointer transition-colors`}
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
                            onClick={() => navigate('/laws')}
                            className={`w-full h-9 flex items-center gap-2.5 text-sm font-medium ${activeNav === 'laws'
                                ? 'bg-slate-200/80'
                                : 'text-slate-800 hover:bg-slate-200/80'
                                } rounded-lg cursor-pointer transition-colors`}
                            title="Danh sách luật"
                        >
                            <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                <LibraryBig
                                    className={`w-4 h-4`}
                                />
                            </div>
                            <span
                                className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                            >
                                Danh sách luật
                            </span>
                        </button>

                        <button
                            onClick={() => navigate('/achieves')}
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

                {/* ================= MIDDLE: HISTORY LIST && PINNED ================= */}
                <div
                    className={`flex-1 px-2.5 pt-4 overflow-y-auto overflow-x-hidden space-y-2 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    {/* Danh sách ghim (chỉ hiện khi có đoạn chat được ghim) */}
                    {pinnedChats.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between px-2.5 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPinnedExpanded((prev) => !prev)}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-900/50 hover:text-gray-900/80 tracking-wider transition-colors cursor-pointer select-none group"
                                    title={isPinnedExpanded ? 'Thu gọn chat được ghim' : 'Mở rộng chat được ghim'}
                                >
                                    <span
                                        className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                            }`}
                                    >
                                        Chat được ghim
                                    </span>
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isPinnedExpanded ? 'rotate-0' : '-rotate-90'
                                            }`}
                                    />
                                </button>
                            </div>

                            {isPinnedExpanded && (
                                <div className="space-y-1">
                                    {pinnedChats.map((item) => (
                                        <div
                                            key={`pinned-${item.id}`}
                                            onClick={() => handleSelectChat(item.id)}
                                            className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer select-none transition-colors w-full text-left text-sm text-slate-900 ${activeChatId === item.id
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
                                                        setOpenMenuChatId(
                                                            openMenuChatId === item.id ? null : item.id
                                                        );
                                                    }}
                                                    className={`p-1 rounded text-slate-400 hover:text-slate-900 transition-opacity ${openMenuChatId === item.id
                                                        ? 'opacity-100 bg-slate-300/60'
                                                        : 'opacity-0 group-hover:opacity-100'
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
                                                            {/* Bỏ ghim */}
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
                            )}
                        </div>
                    )}

                    {/* Danh sách lịch sử chat */}
                    <div>
                        <div className="flex items-center justify-between px-2.5 mb-2">
                            <button
                                type="button"
                                onClick={() => setIsHistoryExpanded((prev) => !prev)}
                                className="flex items-center gap-1.5 text-sm font-semibold text-gray-900/50 hover:text-gray-900/80 tracking-wider transition-colors cursor-pointer select-none group"
                                title={isHistoryExpanded ? 'Thu gọn lịch sử chat' : 'Mở rộng lịch sử chat'}
                            >
                                <span
                                    className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                >
                                    Lịch sử chat
                                </span>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isHistoryExpanded ? 'rotate-0' : '-rotate-90'
                                        }`}
                                />
                            </button>
                        </div>

                        {isHistoryExpanded && (
                            <div className="space-y-1">
                                {unpinnedChats.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelectChat(item.id)}
                                        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer select-none transition-colors w-full text-left text-sm text-slate-900 ${activeChatId === item.id
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
                                                    setOpenMenuChatId(
                                                        openMenuChatId === item.id ? null : item.id
                                                    );
                                                }}
                                                className={`p-1 rounded text-slate-400 hover:text-slate-900 transition-opacity ${openMenuChatId === item.id
                                                    ? 'opacity-100 bg-slate-300/60'
                                                    : 'opacity-0 group-hover:opacity-100'
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
                                                        {/* Ghim */}
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
                        )}
                    </div>
                </div>

                {/* ================= BOTTOM: SIDEBAR FOOTER (ACCOUNT PROFILE) ================= */}
                <div className="h-[68px] p-2.5 flex items-center relative shrink-0">
                    {/* Account Settings Popover */}
                    {isProfileMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileMenuOpen(false)}
                            />
                            <div
                                className={
                                    isSidebarOpen
                                        ? 'absolute bottom-full left-2 right-2 mb-2 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 z-50 select-none'
                                        : 'fixed bottom-16 left-3 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 z-50 select-none'
                                }
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
                        className="w-full h-full flex items-center gap-2.5 px-2 hover:bg-slate-200/80 rounded-lg text-left cursor-pointer transition-colors group"
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
        </>
    );
};

export default Sidebar;
