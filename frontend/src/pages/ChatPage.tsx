import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    SquarePen,
    History,
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
} from 'lucide-react';
import Button from '../components/button';
import ScrollableText from '../components/scrollable-text';

export const ChatPage: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChatId, setActiveChatId] = useState<string | null>('1');
    const [inputPrompt, setInputPrompt] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [chats, setChats] = useState([
        { id: '1', title: 'So sánh luật đất đai năm 2024 và năm 2021', time: '10 phút trước', tag: 'Đất đai', isPinned: true },
        { id: '2', title: 'Điều kiện hưởng trợ cấp thôi việc theo Bộ luật Lao động', time: 'Hôm qua', tag: 'Lao động', isPinned: true },
        { id: '3', title: 'Nghị định 13/2023 về bảo vệ dữ liệu cá nhân PDP', time: '3 ngày trước', tag: 'Doanh nghiệp', isPinned: false },
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
                                className="w-full text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
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
                className={`${isSidebarOpen ? 'w-64 sm:w-72' : 'w-16'
                    } relative z-20 shrink-0 h-full border-r border-slate-200 flex flex-col justify-between select-none`}
            >
                {/* ================= TOP SECTION ================= */}
                <div className="p-2.5 pt-5">

                    {/* Header Row: Logo & Action Icons */}
                    {isSidebarOpen ? (
                        <div className="mb-4 flex items-center justify-between">
                            <Link to="/" className="flex items-center gap-2 group px-3.5">
                                <span className="text-xl font-bold tracking-tight text-indigo-600">
                                    Evidentia.
                                </span>
                            </Link>

                            {/* Search & Collapse Icons */}
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="icon"
                                    size="sm"
                                    onClick={() => setIsSearchOpen(true)}
                                    title="Tìm kiếm"
                                >
                                    <Search className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="icon"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(false)}
                                    title="Thu nhỏ sidebar"
                                >
                                    <PanelLeft className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Collapsed Top Rail: Logo 'E' (click to expand) & Search icon
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-600/25 text-white font-bold text-base cursor-pointer"
                                title="Nhấn để mở rộng Sidebar"
                            >
                                E
                            </button>

                            <Button
                                variant="icon"
                                onClick={() => setIsSearchOpen(true)}
                                title="Tìm kiếm"
                            >
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    <div className='space-y-1'>
                        {isSidebarOpen ? (
                            <Button
                                variant="sidebar"
                                icon={<SquarePen className="w-4 h-4" />}
                                onClick={() => setActiveChatId(null)}
                                className="text-slate-800"
                            >
                                <span>Đoạn chat mới</span>
                            </Button>
                        ) : (
                            <div className="flex justify-center">
                                <Button
                                    variant="icon"
                                    title="Đoạn chat mới"
                                    onClick={() => setActiveChatId(null)}
                                >
                                    <SquarePen className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {isSidebarOpen ? (
                            <Button
                                variant="sidebar"
                                icon={<LibraryBig className="w-4 h-4" />}
                                // onClick={() => setActiveChatId(null)}
                                className="text-slate-800"
                            >
                                <span>Danh sách Luật</span>
                            </Button>
                        ) : (
                            <div className="flex justify-center">
                                <Button
                                    variant="icon"
                                    title="Đoạn chat mới"
                                    onClick={() => setActiveChatId(null)}
                                >
                                    <LibraryBig className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= MIDDLE: HISTORY LIST && PINNED================= */}
                <div className="flex-1 p-2.5 pt-5 overflow-y-auto space-y-5">
                    {isSidebarOpen ? (
                        <div className="space-y-5">
                            {/* Danh sách ghim (chỉ hiện khi có đoạn chat được ghim) */}
                            {pinnedChats.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between px-3.5 mb-2 text-sm font-semibold text-gray-900 tracking-wider">
                                        <span>Lịch sử được ghim</span>
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
                                                <div className="flex flex-col text-left flex-1 min-w-0 pr-1.5">
                                                    <ScrollableText
                                                        text={item.title}
                                                        className="text-sm text-slate-900 font-normal"
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
                                <div className="flex items-center justify-between px-3.5 mb-2 text-sm font-semibold text-slate-900 tracking-wider">
                                    <span>Lịch sử tra cứu</span>
                                </div>

                                <div className="space-y-1">
                                    {chats.filter(c => !c.isPinned).map((item) => (
                                        <Button
                                            key={item.id}
                                            variant="sidebar"
                                            active={activeChatId === item.id}
                                            onClick={() => setActiveChatId(item.id)}
                                            className="group flex items-center justify-between px-3 py-2"
                                        >
                                            <div className="flex flex-col text-left flex-1 min-w-0 pr-1.5">
                                                <ScrollableText
                                                    text={item.title}
                                                    className="text-sm text-slate-900 font-normal"
                                                />
                                                <span className="text-xs text-slate-400 mt-0.5">
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
                    ) : (
                        <div className="flex flex-col items-center gap-1.5 pt-1">
                            <Button
                                variant="icon"
                                onClick={() => setIsSidebarOpen(true)}
                                title="Lịch sử tra cứu"
                            >
                                <History className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* ================= BOTTOM: SIDEBAR FOOTER ================= */}
                {/* <div className="p-2.5 border-t border-slate-200 bg-slate-100">
                    {isSidebarOpen ? (
                        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="font-medium text-slate-700">Agent Sẵn sàng</span>
                            </div>
                            <span className="font-mono text-slate-400 text-xs">v0.0.0</span>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Hệ thống trực tuyến" />
                        </div>
                    )}
                </div> */}
            </aside>

            {/* ================= MAIN CHAT AREA ================= */}
            <main className="relative z-10 flex-1 flex flex-col h-full bg-white overflow-hidden">

                {/* Top Header */}
                <header className="h-14 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <Button
                                variant="icon"
                                onClick={() => setIsSidebarOpen(true)}
                                title="Mở rộng sidebar"
                            >
                                <PanelLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-base sm:text-lg font-bold text-slate-900">
                                {activeChatId
                                    ? chats.find(c => c.id === activeChatId)?.title || 'Phiên làm việc'
                                    : 'Phiên tra cứu mới'}
                            </h1>
                        </div>
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

                {/* Middle: Chat Messages Canvas (Clean Welcome Placeholder Frame) */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
                    <div className="max-w-2xl w-full text-center space-y-5">
                        {/* Welcome Headings */}
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

                {/* Bottom: Prompt Input Box */}
                <div className="p-4 sm:pb-6 max-w-4xl w-full mx-auto">
                    <div className="flex flex-col rounded-2xl bg-white border border-slate-300 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-100 shadow-lg shadow-slate-200/50 p-3">
                        {/* Input Textarea Frame - Tự động co giãn theo chiều dài câu hỏi */}
                        <textarea
                            ref={textareaRef}
                            value={inputPrompt}
                            onChange={(e) => setInputPrompt(e.target.value)}
                            rows={1}
                            placeholder="Mô tả câu hỏi hoặc yêu cầu tra cứu pháp luật theo thời điểm..."
                            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base px-1.5 py-1 focus:outline-none resize-none font-sans min-h-[40px] max-h-56 overflow-y-auto"
                        />

                        {/* Bottom Actions Bar - Nằm tự nhiên ở hàng dưới flexbox */}
                        <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100">
                            {/* Left tools (Attach, Date Filter, etc.) */}
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
                                variant="primary"
                                className="w-9 h-9 p-0 rounded-full"
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
