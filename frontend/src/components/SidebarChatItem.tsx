import React, { useRef, useEffect } from 'react';
import {
    Ellipsis,
    Pin,
    PinOff,
    Pencil,
    Trash2,
} from 'lucide-react';
import type { ChatSession } from '../types';

export interface SidebarChatItemProps {
    item: ChatSession;
    isActive: boolean;
    isSidebarOpen: boolean;
    isEditing: boolean;
    editingTitle: string;
    isMenuOpen: boolean;
    onSelect: () => void;
    onStartEditing: () => void;
    onEditingTitleChange: (newTitle: string) => void;
    onSaveRename: (newTitle: string) => void;
    onCancelRename: () => void;
    onToggleMenu: (e: React.MouseEvent) => void;
    onCloseMenu: () => void;
    onTogglePin: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export const SidebarChatItem: React.FC<SidebarChatItemProps> = ({
    item,
    isActive,
    isSidebarOpen,
    isEditing,
    editingTitle,
    isMenuOpen,
    onSelect,
    onStartEditing,
    onEditingTitleChange,
    onSaveRename,
    onCancelRename,
    onToggleMenu,
    onCloseMenu,
    onTogglePin,
    onDelete,
}) => {
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSaveRename(editingTitle);
        } else if (e.key === 'Escape') {
            onCancelRename();
        }
    };

    return (
        <div
            onClick={onSelect}
            className={`group relative flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer select-none ${isActive
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                    : 'text-slate-900 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                }`}
        >
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {isEditing ? (
                    <input
                        ref={editInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => onEditingTitleChange(e.target.value)}
                        onBlur={() => onSaveRename(editingTitle)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-sm bg-white dark:bg-slate-900 border border-indigo-400 dark:border-indigo-500 rounded px-1.5 py-0.5 outline-none text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                    />
                ) : (
                    <span
                        className={`truncate text-sm transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        title={item.title}
                    >
                        {item.title || 'Đoạn chat không tên'}
                    </span>
                )}
            </div>

            {/* Action Popup Trigger */}
            {isSidebarOpen && !isEditing && (
                <div className="relative shrink-0 flex items-center">
                    <button
                        type="button"
                        onClick={onToggleMenu}
                        className={`p-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-700/60 transition-opacity cursor-pointer ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        title="Tùy chọn đoạn chat"
                    >
                        <Ellipsis className="w-3.5 h-3.5" />
                    </button>

                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseMenu();
                                }}
                            />
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1 space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                            >
                                <button
                                    type="button"
                                    onClick={onTogglePin}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors"
                                >
                                    {(item.is_pinned ?? item.isPinned) ? (
                                        <>
                                            <PinOff className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                            <span>Bỏ ghim</span>
                                        </>
                                    ) : (
                                        <>
                                            <Pin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                            <span>Ghim đoạn chat</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCloseMenu();
                                        onStartEditing();
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                    <span>Đổi tên</span>
                                </button>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-left cursor-pointer transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SidebarChatItem;
