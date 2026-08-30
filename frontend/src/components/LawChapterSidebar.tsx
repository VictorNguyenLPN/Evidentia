import React from 'react';
import { Search, X } from 'lucide-react';
import type { LawChapterSummary } from '../types';

export interface LawChapterSidebarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedChapter: string | null;
    onSelectChapter: (chapterNumber: string | null) => void;
    chapters: LawChapterSummary[];
}

export const LawChapterSidebar: React.FC<LawChapterSidebarProps> = ({
    searchTerm,
    onSearchChange,
    selectedChapter,
    onSelectChapter,
    chapters,
}) => {
    return (
        <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm số điều hoặc từ khóa..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                    {selectedChapter && (
                        <button
                            onClick={() => onSelectChapter(null)}
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                            Bỏ lọc chương
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5">
                    Mục lục ({chapters.length} chương)
                </div>

                {chapters.map((ch) => {
                    const isSelected = selectedChapter === ch.chapter_number;
                    return (
                        <button
                            key={ch.chapter_number}
                            onClick={() => onSelectChapter(isSelected ? null : ch.chapter_number)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer block ${
                                isSelected
                                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 shadow-xs'
                                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-transparent'
                            }`}
                        >
                            <div className="flex items-center justify-between font-semibold">
                                <span className={isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}>
                                    Chương {ch.chapter_number}
                                </span>
                                <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                        isSelected
                                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    {ch.article_count} điều
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {ch.chapter_title}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                                {ch.article_range}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LawChapterSidebar;
