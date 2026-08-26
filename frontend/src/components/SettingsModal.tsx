import React, { useState, useEffect } from 'react';
import {
    X,
    Database,
    Settings,
    Info,
    BarChart2,
    ChevronDown,
} from 'lucide-react';
import Button from './Button';
import type { ChatSession } from '../types';
import { useChat } from '../contexts';

export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    chats: ChatSession[];
    onClearAllChats: () => Promise<boolean | void>;
    activeChatId?: string | null;
}

type SettingsSection = 'general' | 'usage' | 'data' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    chats,
    onClearAllChats,
}) => {
    const { isDevMode, setIsDevMode, isDarkMode, setIsDarkMode } = useChat();
    const [activeSection, setActiveSection] = useState<SettingsSection>('general');
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('vi');

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (isConfirmingClear) {
                    setIsConfirmingClear(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isConfirmingClear, onClose]);

    const handleClose = () => {
        setIsConfirmingClear(false);
        onClose();
    };

    if (!isOpen) return null;

    const handleConfirmClear = async () => {
        setIsClearing(true);
        try {
            await onClearAllChats();
            setIsConfirmingClear(false);
        } catch (err) {
            console.error('Error clearing chat history:', err);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
                {/* Backdrop overlay */}
                <div
                    className="fixed inset-0"
                    onClick={() => {
                        if (!isClearing && !isConfirmingClear) handleClose();
                    }}
                />

                {/* Modal Box */}
                <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-140 max-h-[90vh] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200">
                    {/* Left Sidebar navigation */}
                    <div className="w-full md:w-56 bg-slate-50/90 dark:bg-slate-950/90 border-r border-slate-200/80 dark:border-slate-800 p-3 flex flex-col justify-between shrink-0 select-none">
                        <div className="space-y-1">
                            <div className="px-3 py-2.5 mb-2">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>Cài đặt & Tùy chọn</span>
                                </h2>
                            </div>

                            <nav className="space-y-1">
                                <Button
                                    type="button"
                                    variant="sidebar"
                                    active={activeSection === 'general'}
                                    onClick={() => setActiveSection('general')}
                                    icon={<Settings className="w-4 h-4 shrink-0" />}
                                >
                                    <span>Chung</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="sidebar"
                                    active={activeSection === 'usage'}
                                    onClick={() => setActiveSection('usage')}
                                    icon={<BarChart2 className="w-4 h-4 shrink-0" />}
                                >
                                    <span>Hạn mức</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="sidebar"
                                    active={activeSection === 'data'}
                                    onClick={() => setActiveSection('data')}
                                    icon={<Database className="w-4 h-4 shrink-0" />}
                                >
                                    <span>Dữ liệu</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="sidebar"
                                    active={activeSection === 'about'}
                                    onClick={() => setActiveSection('about')}
                                    icon={<Info className="w-4 h-4 shrink-0" />}
                                >
                                    <span>Giới thiệu</span>
                                </Button>
                            </nav>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="px-6 flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between shrink-0 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {activeSection === 'general' && 'Cài đặt Chung'}
                                    {activeSection === 'usage' && 'Thống kê Token & Hạn mức'}
                                    {activeSection === 'data' && 'Quản lý Dữ liệu'}
                                    {activeSection === 'about' && 'Thông tin Ứng dụng'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {activeSection === 'general' &&
                                        'Tùy chỉnh giao diện hiển thị và cấu hình hệ thống'}
                                    {activeSection === 'usage' &&
                                        'Theo dõi dung lượng Token tiêu thụ theo tuần và tháng'}
                                    {activeSection === 'data' &&
                                        'Quản lý dữ liệu lưu trữ, lịch sử trò chuyện và đồng bộ hóa'}
                                    {activeSection === 'about' &&
                                        'Hệ thống Tra cứu & Phân tích Pháp luật Thông minh'}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="icon"
                                size="xs"
                                onClick={handleClose}
                                title="Đóng (ESC)"
                                icon={<X className="w-5 h-5" />}
                            />
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
                            {/* GENERAL SECTION */}
                            {activeSection === 'general' && (
                                <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                                    {/* Developer Mode */}
                                    <div className="py-2 flex items-center justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                Chế độ Nhà phát triển
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                                                Hiển thị chi tiết số lượng Token dưới mỗi câu trả lời.
                                            </p>
                                        </div>

                                        {/* Toggle Switch */}
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={isDevMode}
                                            onClick={() => setIsDevMode(!isDevMode)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDevMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                                }`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isDevMode ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Dark Mode Toggle */}
                                    <div className="py-2 flex items-center justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                Chuyển sang theme tối
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                                                Giao diện nền tối giúp dịu mắt khi làm việc ban đêm.
                                            </p>
                                        </div>

                                        {/* Toggle Switch */}
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={isDarkMode}
                                            onClick={() => setIsDarkMode(!isDarkMode)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                                }`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isDarkMode ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* USAGE & QUOTA SECTION */}
                            {activeSection === 'usage' && (
                                <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                                </div>
                            )}

                            {/* DATA SECTION */}
                            {activeSection === 'data' && (
                                <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                                    <div className="py-2 flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                Lịch sử trò chuyện ({chats.length} đoạn chat)
                                            </h4>
                                        </div>

                                        {chats.length > 0 && (
                                            <button
                                                disabled={chats.length === 0}
                                                onClick={() => setIsConfirmingClear(true)}
                                                className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-left cursor-pointer transition-colors"
                                            >
                                                <span>Xóa tất cả</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="py-2 flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                Xuất dữ liệu
                                            </h4>
                                        </div>

                                        {chats.length > 0 && (
                                            <button
                                                className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors"
                                            >
                                                <span>Xuất</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="py-2 flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                Lưu trữ tất cả đoạn chat
                                            </h4>
                                        </div>

                                        {chats.length > 0 && (
                                            <button
                                                className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors"
                                            >
                                                <span>Lưu trữ</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="py-2 flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                Gỡ ghim tất cả đoạn chat
                                            </h4>
                                        </div>

                                        {chats.length > 0 && (
                                            <button
                                                className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors"
                                            >
                                                <span>Gỡ ghim</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ABOUT SECTION */}
                            {activeSection === 'about' && (
                                <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Confirmation Modal Popup */}
            {isConfirmingClear && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div
                        className="fixed inset-0"
                        onClick={() => {
                            if (!isClearing) setIsConfirmingClear(false);
                        }}
                    />
                    <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 select-none">
                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Xác nhận xóa tất cả lịch sử trò chuyện?
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Hành động này sẽ xóa vĩnh viễn toàn bộ {chats.length} cuộc hội thoại đã lưu. Dữ liệu sau khi xóa sẽ không thể khôi phục.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isClearing}
                                onClick={() => setIsConfirmingClear(false)}
                                className="px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium"
                            >
                                <span>Hủy bỏ</span>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isClearing}
                                onClick={handleConfirmClear}
                                className="w-auto px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs disabled:opacity-50"
                            >
                                <span>{isClearing ? 'Đang xóa...' : 'Xóa tất cả'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsModal;
