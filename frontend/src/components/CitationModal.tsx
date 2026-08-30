import React, { useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import Button from './Button';
import type { Citation } from '../types';

export interface CitationModalProps {
    citation: Citation | null;
    onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && citation) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [citation, onClose]);

    if (!citation) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {citation.document_title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {citation.hierarchy_path?.join(' > ')}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="icon"
                        size="sm"
                        onClick={onClose}
                        title="Đóng"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    <div className="flex flex-wrap gap-2 text-xs">
                        {citation.effect_status_name && (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/60 dark:border-emerald-800/60">
                                Hiệu lực: {citation.effect_status_name}
                            </span>
                        )}
                        {citation.effect_date && (
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                                Ngày hiệu lực: {citation.effect_date}
                            </span>
                        )}
                        {citation.doc_type && (
                            <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
                                Loại văn bản: {citation.doc_type}
                            </span>
                        )}
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
                        {citation.legal_content || citation.text}
                    </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CitationModal;
