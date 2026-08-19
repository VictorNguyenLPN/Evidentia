import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    SquarePen,
    Calendar,
    Paperclip,
    ArrowUp,
    PanelLeft,
    SlidersHorizontal,
    Search,
    MoreVertical,
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
} from 'lucide-react';
import Button from '../components/button';
import ScrollableText from '../components/scrollable-text';

export const ChatPage: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChatId, setActiveChatId] = useState<string | null>('1');
    const [inputPrompt, setInputPrompt] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [chats, setChats] = useState([
        { id: '1', title: 'So sánh luật đất đai năm 2024 và năm 2021', time: '10 phút trước', tag: 'Đất đai', isPinned: true },
        { id: '2', title: 'Điều kiện hưởng trợ cấp thôi việc theo Bộ luật Lao động', time: 'Hôm qua', tag: 'Lao động', isPinned: true },
        { id: '3', title: 'Nghị định 13/2023 về bảo vệ dữ liệu cá nhân PDP', time: '3 ngày trước', tag: 'Doanh nghiệp', isPinned: false },
        { id: '4', title: 'Đánh thuốc mê bạn làm chung KLTN có phạm tội không?', time: '2 ngày trước', tag: 'Thuốc mê', isPinned: true },
    ]);

    const pinnedChats = chats.filter(c => c.isPinned);

    const togglePin = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setChats(prev => prev.map(chat =>
            chat.id === id ? { ...chat, isPinned: !chat.isPinned } : chat
        ));
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
        }
    }, [inputPrompt]);

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
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                            </div>

                            <div className="space-y-1">
                                {chats
                                    .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((item) => (
                                        <Button
                                            key={item.id}
                                            variant="sidebar"
                                            onClick={() => {
                                                setActiveChatId(item.id);
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
                            onClick={() => setActiveChatId(null)}
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
                            title="Danh sách Luật"
                        >
                            <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                <LibraryBig className="w-4 h-4" />
                            </div>
                            <span
                                className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                            >
                                Danh sách Luật
                            </span>
                        </button>

                        <button
                            className="w-full h-9 flex items-center gap-2.5 text-sm font-medium text-slate-800 hover:bg-slate-200/80 rounded-lg cursor-pointer transition-colors"
                            title="Lưu trữ chat"
                        >
                            <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                <ArchiveRestore className="w-4 h-4" />
                            </div>
                            <span
                                className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                            >
                                Lưu trữ chat
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
                                    <Button
                                        key={`pinned-${item.id}`}
                                        variant="sidebar"
                                        active={activeChatId === item.id}
                                        onClick={() => setActiveChatId(item.id)}
                                        className="group flex items-center justify-between px-3 py-2"
                                    >
                                        <div
                                            className={`flex flex-col text-left flex-1 min-w-0 pr-1.5 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                        >
                                            <ScrollableText
                                                text={item.title}
                                                className="text-sm text-slate-900 font-normal whitespace-nowrap"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => togglePin(item.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-300/50 shrink-0"
                                            title="Bỏ ghim"
                                        >
                                            <PinOff className="w-3.5 h-3.5" />
                                        </button>
                                    </Button>
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
                                    <Button
                                        key={item.id}
                                        variant="sidebar"
                                        active={activeChatId === item.id}
                                        onClick={() => setActiveChatId(item.id)}
                                        className="group flex items-center justify-between px-3 py-2"
                                    >
                                        <div
                                            className={`flex flex-col text-left flex-1 min-w-0 pr-1.5 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                        >
                                            <ScrollableText
                                                text={item.title}
                                                className="text-sm text-slate-900 font-normal whitespace-nowrap"
                                            />
                                            <span className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">
                                                {item.time}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => togglePin(item.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-300/50 rounded shrink-0"
                                            title="Ghim đoạn chat"
                                        >
                                            <Pin className="w-3.5 h-3.5" />
                                        </button>
                                    </Button>
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
                        {/* Avatar - ALWAYS fixed position (never jumps!) */}
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            H
                        </div>
                        {/* Text - Fades in/out smoothly without layout bounce */}
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
                <header className="h-14 p-2.5 pt-5 px-4 sm:px-6 flex items-center justify-between bg-white">

                    <div>
                    </div>
                    {/* Right Header Options */}
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSearchOpen(true)}
                            className="gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                            <Search className="w-3.5 h-3.5" />
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

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
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

                <div className="p-4 sm:pb-6 max-w-4xl w-full mx-auto">
                    <div className="flex flex-col rounded-2xl bg-white border border-slate-300 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-100 shadow-lg shadow-slate-200/50 p-3">
                        <textarea
                            ref={textareaRef}
                            value={inputPrompt}
                            onChange={(e) => setInputPrompt(e.target.value)}
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
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 font-medium"
                                >
                                    <span className="hidden sm:inline">Mốc thời gian</span>
                                </Button>
                            </div>

                            {/* Send Button */}
                            <Button
                                circle={true}
                                variant="primary"
                                className="w-9 h-9"
                                title="Gửi yêu cầu"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Footer Disclaimer Note */}
                    <p className="mt-8 text-center text-xs text-slate-500">
                        Evidentia có thể trả lời chưa chính xác. Vui lòng kiểm tra các thông tin quan trọng
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
