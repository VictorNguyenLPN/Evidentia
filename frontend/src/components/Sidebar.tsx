import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    SquarePen,
    Search,
    PanelLeft,
    LibraryBig,
    ArchiveRestore,
    Settings,
    LogOut,
    Sparkle,
    ChevronDown,
    LogIn,
    User as UserIcon,
} from 'lucide-react';
import Button from './Button';
import SettingsModal, { type SettingsSection } from './SettingsModal';
import SearchModal from './SearchModal';
import SidebarChatItem from './SidebarChatItem';
import type { ChatSession } from '../types';
import { chatService } from '../services';
import { useAuth } from '../contexts';

export type { ChatSession };

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

    const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(true);
    const isSidebarOpen = controlledIsSidebarOpen !== undefined ? controlledIsSidebarOpen : internalIsSidebarOpen;
    const setIsSidebarOpen = controlledSetIsSidebarOpen || setInternalIsSidebarOpen;

    const [internalIsSearchOpen, setInternalIsSearchOpen] = useState(false);
    const isSearchOpen = controlledIsSearchOpen !== undefined ? controlledIsSearchOpen : internalIsSearchOpen;
    const setIsSearchOpen = controlledSetIsSearchOpen || setInternalIsSearchOpen;

    const [internalChats, setInternalChats] = useState<ChatSession[]>([]);
    const chats = controlledChats !== undefined ? controlledChats : internalChats;
    const setChats = controlledSetChats || setInternalChats;

    const { user, isAuthenticated, logout, openAuthModal } = useAuth();
    const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>('');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsInitialSection, setSettingsInitialSection] = useState<SettingsSection>('general');
    const [isPinnedExpanded, setIsPinnedExpanded] = useState(true);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    const fetchChats = useCallback(async () => {
        try {
            const data = await chatService.getChats();
            setChats(data);
        } catch (err) {
            console.warn('Could not fetch chats in Sidebar:', err);
        }
    }, [setChats]);

    useEffect(() => {
        if (controlledChats === undefined) {
            fetchChats();
        }
    }, [controlledChats, fetchChats]);

    // Handle shortcut Cmd/Ctrl + K and Escape for search modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(!isSearchOpen);
            }
            if (e.key === 'Escape' && isSearchOpen) {
                e.preventDefault();
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen, setIsSearchOpen]);

    const handleNewChat = () => {
        if (onNewChat) {
            onNewChat();
        } else {
            navigate('/chats');
        }
    };

    const handleSelectChat = (chatId: string) => {
        if (onSelectChat) {
            onSelectChat(chatId);
        } else {
            navigate(`/chats/${chatId}`);
        }
    };

    const deleteChat = async (chatId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setOpenMenuChatId(null);
        try {
            await chatService.deleteChat(chatId);
            setChats((prev) => prev.filter((c) => c.id !== chatId));
            if (onDeleteChat) {
                onDeleteChat(chatId);
            } else if (activeChatId === chatId) {
                navigate('/chats');
            }
        } catch (err) {
            console.error('Error deleting chat session:', err);
        }
    };

    const togglePin = async (chatId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setOpenMenuChatId(null);
        const chat = chats.find((c) => c.id === chatId);
        if (!chat) return;

        const isPinned = Boolean(chat.is_pinned ?? chat.isPinned);
        const newPinned = !isPinned;
        setChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, is_pinned: newPinned, isPinned: newPinned } : c))
        );

        try {
            await chatService.togglePinChat(chatId);
        } catch (err) {
            console.error('Error pinning chat:', err);
            setChats((prev) =>
                prev.map((c) => (c.id === chatId ? { ...c, is_pinned: isPinned, isPinned: isPinned } : c))
            );
        }
    };

    const handleRenameChat = async (chatId: string, newTitle: string) => {
        const trimmed = newTitle.trim();
        if (!trimmed) {
            setEditingChatId(null);
            return;
        }

        const originalChat = chats.find((c) => c.id === chatId);
        const originalTitle = originalChat?.title || '';

        setChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, title: trimmed } : c))
        );
        setEditingChatId(null);

        try {
            await chatService.renameChat(chatId, trimmed);
        } catch (err) {
            console.error('Error renaming chat:', err);
            setChats((prev) =>
                prev.map((c) => (c.id === chatId ? { ...c, title: originalTitle } : c))
            );
        }
    };

    const handleClearAllChats = async () => {
        try {
            await chatService.clearAllChats();
            setChats([]);
            setIsSettingsOpen(false);
            navigate('/chats');
            return true;
        } catch (err) {
            console.error('Error clearing all chats:', err);
            return false;
        }
    };

    const pinnedChats = chats.filter((c) => Boolean(c.is_pinned ?? c.isPinned));
    const unpinnedChats = chats.filter((c) => !(c.is_pinned ?? c.isPinned));

    return (
        <>
            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                chats={chats}
                onSelectChat={(chatId) => {
                    handleSelectChat(chatId);
                    setIsSearchOpen(false);
                }}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                chats={chats}
                onClearAllChats={handleClearAllChats}
                activeChatId={activeChatId}
                initialSection={settingsInitialSection}
            />

            <aside
                className={`sidebar ${isSidebarOpen ? 'w-64 sm:w-72' : 'w-14'
                    } relative z-20 shrink-0 h-full border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none transition-[width] duration-300 ease-in-out overflow-hidden bg-white dark:bg-slate-900`}
            >
                {/* Scroll container */}
                <div
                    onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}
                    className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col"
                >
                    {/* Header Row */}
                    <div
                        className={`header space-y-1.5 px-2.5 pt-2.5 sticky top-0 z-10 bg-white dark:bg-slate-900 shrink-0 transition-colors duration-150 ${isScrolled ? 'border-b border-slate-200 dark:border-slate-800' : 'border-b border-transparent'
                            }`}
                    >
                        {/* Logo */}
                        <div className={`flex items-center justify-between ${isSidebarOpen ? "pl-2.5" : "px-2.5"}`}>
                            {isSidebarOpen ? (
                                <>
                                    <Link
                                        to="/chats"
                                        onClick={handleNewChat}
                                        className="logo flex items-center min-w-0"
                                    >
                                        <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
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
                                            <Search className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                                        </Button>
                                        <Button
                                            variant="icon"
                                            size="sm"
                                            onClick={() => setIsSidebarOpen(false)}
                                            title="Thu nhỏ sidebar"
                                        >
                                            <PanelLeft className="w-4 h-4 text-slate-800 dark:text-slate-200" />
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
                                        className="group"
                                    >
                                        <Sparkle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:hidden" />
                                        <PanelLeft className="w-4 h-4 text-slate-800 dark:text-slate-200 hidden group-hover:block" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* New Chat Button */}
                        <div className="mb-1">
                            <button
                                onClick={handleNewChat}
                                className={`w-full h-9 flex items-center gap-1 text-sm ${activeNav === 'chat' && !activeChatId
                                        ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
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
                        </div>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="px-2.5 pb-4 space-y-4">
                        {/* Navigation Items */}
                        <div className="space-y-1">
                            <button
                                onClick={() => navigate('/laws')}
                                className={`w-full h-9 flex items-center gap-1 text-sm ${activeNav === 'laws'
                                        ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                                    } rounded-lg cursor-pointer transition-colors`}
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
                                onClick={() => navigate('/achieves')}
                                className="w-full h-9 flex items-center gap-1 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
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

                        {pinnedChats.length > 0 && isSidebarOpen && (
                            <div>
                                <div className="flex items-center justify-between px-2.5 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsPinnedExpanded((prev) => !prev)}
                                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 tracking-wider transition-colors cursor-pointer select-none group"
                                        title={isPinnedExpanded ? 'Thu gọn chat được ghim' : 'Mở rộng chat được ghim'}
                                    >
                                        <span
                                            className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                        >
                                            Đã ghim
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
                                            <SidebarChatItem
                                                key={`pinned-${item.id}`}
                                                item={item}
                                                isActive={activeChatId === item.id}
                                                isSidebarOpen={isSidebarOpen}
                                                isEditing={editingChatId === item.id}
                                                editingTitle={editingTitle}
                                                isMenuOpen={openMenuChatId === item.id}
                                                onSelect={() => handleSelectChat(item.id)}
                                                onStartEditing={() => {
                                                    setEditingChatId(item.id);
                                                    setEditingTitle(item.title);
                                                }}
                                                onEditingTitleChange={setEditingTitle}
                                                onSaveRename={(newTitle) => handleRenameChat(item.id, newTitle)}
                                                onCancelRename={() => setEditingChatId(null)}
                                                onToggleMenu={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuChatId(openMenuChatId === item.id ? null : item.id);
                                                }}
                                                onCloseMenu={() => setOpenMenuChatId(null)}
                                                onTogglePin={(e) => togglePin(item.id, e)}
                                                onDelete={(e) => deleteChat(item.id, e)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {isSidebarOpen && (
                            <div>
                                <div className="flex items-center justify-between px-2.5 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsHistoryExpanded((prev) => !prev)}
                                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 tracking-wider transition-colors cursor-pointer select-none group"
                                        title={isHistoryExpanded ? 'Thu gọn lịch sử chat' : 'Mở rộng lịch sử chat'}
                                    >
                                        <span
                                            className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                        >
                                            Đoạn chat
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
                                            <SidebarChatItem
                                                key={item.id}
                                                item={item}
                                                isActive={activeChatId === item.id}
                                                isSidebarOpen={isSidebarOpen}
                                                isEditing={editingChatId === item.id}
                                                editingTitle={editingTitle}
                                                isMenuOpen={openMenuChatId === item.id}
                                                onSelect={() => handleSelectChat(item.id)}
                                                onStartEditing={() => {
                                                    setEditingChatId(item.id);
                                                    setEditingTitle(item.title);
                                                }}
                                                onEditingTitleChange={setEditingTitle}
                                                onSaveRename={(newTitle) => handleRenameChat(item.id, newTitle)}
                                                onCancelRename={() => setEditingChatId(null)}
                                                onToggleMenu={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuChatId(openMenuChatId === item.id ? null : item.id);
                                                }}
                                                onCloseMenu={() => setOpenMenuChatId(null)}
                                                onTogglePin={(e) => togglePin(item.id, e)}
                                                onDelete={(e) => deleteChat(item.id, e)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Footer */}
                <div className="h-17 p-2.5 flex items-center relative shrink-0 border-t border-slate-200 dark:border-slate-800">
                    {isAuthenticated && user ? (
                        <>
                            {isProfileMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    />
                                    <div
                                        className={
                                            isSidebarOpen
                                                ? 'absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-0.5 z-50 select-none'
                                                : 'fixed bottom-16 left-3 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-0.5 z-50 select-none'
                                        }
                                    >
                                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {user.full_name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                setSettingsInitialSection('account');
                                                setIsSettingsOpen(true);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors"
                                        >
                                            <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                                            <span>Hồ sơ tài khoản</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                setSettingsInitialSection('general');
                                                setIsSettingsOpen(true);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                                            <span>Cài đặt & Tùy chọn</span>
                                        </button>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                logout();
                                                navigate('/chats');
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-left cursor-pointer transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 shrink-0" />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="w-full h-full flex items-center gap-2.5 px-1 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors group"
                                title={`Tài khoản: ${user.full_name || user.email}`}
                            >
                                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div
                                    className={`min-w-0 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'hidden'
                                        }`}
                                >
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight whitespace-nowrap">
                                        {user.full_name}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 whitespace-nowrap">
                                        {user.email}
                                    </p>
                                </div>
                            </button>
                        </>
                    ) : (
                        isSidebarOpen ? (
                            <button
                                onClick={() => openAuthModal('login')}
                                className="w-full h-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Đăng nhập / Đăng ký</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => openAuthModal('login')}
                                className="w-full h-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Đăng nhập / Đăng ký"
                            >
                                <LogIn className="w-4 h-4" />
                            </button>
                        )
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
