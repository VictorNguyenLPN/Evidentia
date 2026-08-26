import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ChevronRight } from 'lucide-react';
import Button from './Button';
import type { ChatSession } from '../types';

export interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    chats: ChatSession[];
    onSelectChat?: (chatId: string) => void;
}

const formatChatDateTime = (timeStr?: string, isoDate?: string): string => {
    if (isoDate) {
        try {
            const d = new Date(isoDate);
            if (!isNaN(d.getTime())) {
                const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                return `${time} - ${date}`;
            }
        } catch {
            // fallback
        }
    }
    if (!timeStr) return '';
    if (timeStr.includes('/') || (timeStr.includes('-') && timeStr.length > 8)) {
        return timeStr;
    }
    if (/^\d{1,2}:\d{2}$/.test(timeStr.trim())) {
        const date = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${timeStr.trim()} - ${date}`;
    }
    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} - ${date}`;
};

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    chats,
    onSelectChat,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleClose = () => {
        setSearchQuery('');
        onClose();
    };

    if (!isOpen) return null;

    const filteredChats = chats.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleItemClick = (id: string) => {
        if (onSelectChat) {
            onSelectChat(id);
        }
        handleClose();
    };

    return (
        <div className="search-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div
                className="fixed inset-0"
                onClick={handleClose}
            />
            <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[70vh] text-slate-800 dark:text-slate-100">
                {/* Search Input Bar */}
                <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm đoạn chat..."
                        className="w-full py-4 text-sm bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Gần đây</span>
                        <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    </div>

                    {filteredChats.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            Không tìm thấy đoạn chat nào
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredChats.map((item) => (
                                <Button
                                    key={item.id}
                                    variant="sidebar"
                                    onClick={() => handleItemClick(item.id)}
                                    className="p-3 justify-between items-start group w-full"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                                {item.title}
                                            </p>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                {formatChatDateTime(item.time, item.updated_at || item.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-start gap-2 shrink-0 pt-0.5">
                                        {item.tag && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950 text-slate-600 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 font-medium">
                                                {item.tag}
                                            </span>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Mẹo: Nhấn <strong>ESC</strong> để đóng</span>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
