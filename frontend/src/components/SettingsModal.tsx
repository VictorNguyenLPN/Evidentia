import React, { useState, useEffect } from 'react';
import {
    X,
    Database,
    CheckCircle2,
    AlertTriangle,
    Settings,
    Info,
    Sparkles,
} from 'lucide-react';
import Button from './Button';
import type { ChatSession } from './Sidebar';

export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    chats: ChatSession[];
    onClearAllChats: () => Promise<boolean | void>;
    activeChatId?: string | null;
}

type SettingsSection = 'data' | 'general' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    chats,
    onClearAllChats,
}) => {
    const [activeSection, setActiveSection] = useState<SettingsSection>('data');
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [clearSuccessMsg, setClearSuccessMsg] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    // Reset temporary states when modal closes/opens
    useEffect(() => {
        if (!isOpen) {
            setIsConfirmingClear(false);
            setClearSuccessMsg(null);
            setErrorMessage(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirmClear = async () => {
        setIsClearing(true);
        setErrorMessage(null);
        try {
            await onClearAllChats();
            setClearSuccessMsg('Đã xóa toàn bộ lịch sử trò chuyện thành công!');
            setIsConfirmingClear(false);
            setTimeout(() => {
                setClearSuccessMsg(null);
            }, 4000);
        } catch (err) {
            console.error('Error clearing chat history:', err);
            setErrorMessage('Có lỗi xảy ra khi xóa lịch sử. Vui lòng thử lại!');
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
                        if (!isClearing && !isConfirmingClear) onClose();
                    }}
                />

                {/* Modal Box */}
                <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[540px] max-h-[88vh] text-slate-800 animate-in zoom-in-95 duration-200">
                    {/* Left Sidebar navigation */}
                    <div className="w-full md:w-56 bg-slate-50/90 border-r border-slate-200/80 p-3 flex flex-col justify-between shrink-0 select-none">
                        <div className="space-y-1">
                            <div className="px-3 py-2.5 mb-2">
                                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <span>Cài đặt & Tùy chọn</span>
                                </h2>
                            </div>

                            <nav className="space-y-1">
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
                                    active={activeSection === 'general'}
                                    onClick={() => setActiveSection('general')}
                                    icon={<Settings className="w-4 h-4 shrink-0" />}
                                >
                                    <span>Chung</span>
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
                    <div className="px-6 flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between shrink-0 py-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {activeSection === 'data' && 'Quản lý Dữ liệu'}
                                    {activeSection === 'general' && 'Cài đặt Chung'}
                                    {activeSection === 'about' && 'Thông tin Ứng dụng'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {activeSection === 'data' &&
                                        'Quản lý dữ liệu lưu trữ, lịch sử trò chuyện và đồng bộ hóa'}
                                    {activeSection === 'general' &&
                                        'Tùy chỉnh giao diện và cấu hình tương tác hệ thống'}
                                    {activeSection === 'about' &&
                                        'Hệ thống Tra cứu & Phân tích Pháp luật Thông minh'}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="icon"
                                size="xs"
                                onClick={onClose}
                                title="Đóng (ESC)"
                                icon={<X className="w-5 h-5" />}
                            />
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto space-y-6">

                            {/* DATA SECTION */}
                            {activeSection === 'data' && (
                                <div className="space-y-5//">
                                    {/* Storage Info Card */}
                                    <div className="py-4 border-t border-slate-200/80 flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold// text-slate-800">
                                                Lịch sử trò chuyện ({chats.length} đoạn chat)
                                            </h4>
                                        </div>

                                        {chats.length > 0 && <button
                                            // type="button"
                                            // variant="ghost"
                                            // size="sm"
                                            disabled={chats.length === 0}
                                            onClick={() => setIsConfirmingClear(true)}
                                            className="px-3 py-2 text-sm hover:text-red-500 font-semibold hover:bg-red-50 rounded-lg text-left cursor-pointer transition-colors"
                                        >
                                            <span>Xóa tất cả</span>
                                        </button>}

                                    </div>

                                    <div className="py-4 border-t border-slate-200/80 flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold// text-slate-800">
                                                Xuất dữ liệu
                                            </h4>
                                        </div>

                                        {chats.length > 0 && <button
                                            // type="button"
                                            // variant="ghost"
                                            // size="sm"
                                            // disabled={chats.length === 0}
                                            // onClick={() => setIsConfirmingClear(true)}
                                            className="px-3 py-2 text-sm font-semibold hover:text-red-500 hover:bg-red-50 rounded-lg text-left cursor-pointer transition-colors"
                                        >
                                            <span>Xuất</span>
                                        </button>}

                                    </div>

                                    <div className="py-4 border-t border-slate-200/80 flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold// text-slate-800">
                                                Lưu trữ tất cả đoạn chat
                                            </h4>
                                        </div>

                                        {chats.length > 0 && <button
                                            // type="button"
                                            // variant="ghost"
                                            // size="sm"
                                            // disabled={chats.length === 0}
                                            // onClick={() => setIsConfirmingClear(true)}
                                            className="px-3 py-2 text-sm font-semibold hover:text-red-500 hover:bg-red-50 rounded-lg text-left cursor-pointer transition-colors"
                                        >
                                            <span>Lưu trữ</span>
                                        </button>}

                                    </div>

                                    <div className="py-4 border-t border-slate-200/80 flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold// text-slate-800">
                                                Gỡ ghim tất cả đoạn chat
                                            </h4>
                                        </div>

                                        {chats.length > 0 && <button
                                            // type="button"
                                            // variant="ghost"
                                            // size="sm"
                                            // disabled={chats.length === 0}
                                            // onClick={() => ...}
                                            className="px-3 py-2 text-sm font-semibold hover:text-red-500 hover:bg-red-50 rounded-lg text-left cursor-pointer transition-colors"
                                        >
                                            <span>Gỡ ghim</span>
                                        </button>}

                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Confirmation Modal Popup (No Icons) */}
            {isConfirmingClear && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div
                        className="fixed inset-0"
                        onClick={() => {
                            if (!isClearing) setIsConfirmingClear(false);
                        }}
                    />
                    <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 select-none">
                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-slate-900">
                                Xác nhận xóa tất cả lịch sử trò chuyện?
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
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
                                className="!px-3.5 !py-1.5 text-xs text-slate-700 !bg-slate-100 hover:!bg-slate-200 rounded-lg font-medium"
                            >
                                <span>Hủy bỏ</span>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isClearing}
                                onClick={handleConfirmClear}
                                className="!w-auto !px-3.5 !py-1.5 text-xs font-semibold !text-white !bg-red-600 hover:!bg-red-700 rounded-lg shadow-xs disabled:opacity-50"
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
