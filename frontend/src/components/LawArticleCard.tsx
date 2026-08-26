import React from 'react';
import { Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import type { LawArticle } from '../types';

export interface LawArticleCardProps {
    article: LawArticle;
    isCopied: boolean;
    onCopy: (art: LawArticle) => void;
    onAskAI: (art: LawArticle) => void;
}

export const LawArticleCard: React.FC<LawArticleCardProps> = ({
    article: art,
    isCopied,
    onCopy,
    onAskAI,
}) => {
    return (
        <div
            id={`article-${art.article_number}`}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-indigo-700 dark:text-indigo-400 rounded-md">
                            Điều {art.article_number}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 font-bold">
                            Chương {art.chapter_number}: {art.chapter_title}
                        </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mt-2">
                        {art.article_title}
                    </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => onCopy(art)}
                        className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Sao chép toàn văn điều luật"
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Đã chép</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => onAskAI(art)}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/80 dark:border-indigo-800/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Hỏi trợ lý AI phân tích điều luật này"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Hỏi AI</span>
                    </button>
                </div>
            </div>

            <div className="pt-4 space-y-3 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {art.article_text && (
                    <p className="text-slate-700 dark:text-slate-300 font-normal">
                        {art.article_text}
                    </p>
                )}

                {art.clauses && art.clauses.length > 0 && (
                    <div className="space-y-2.5">
                        {art.clauses.map((cl) => {
                            const clauseBody = cl.text || cl.lead_in_text || '';
                            return (
                                <div key={cl.clause_number} className="space-y-1.5">
                                    {clauseBody && (
                                        <div className="flex gap-2 items-baseline">
                                            <span className="font-semibold text-slate-900 dark:text-white shrink-0 select-none">
                                                {cl.clause_number}.
                                            </span>
                                            <span className="text-slate-800 dark:text-slate-200">
                                                {clauseBody}
                                            </span>
                                        </div>
                                    )}

                                    {cl.points && cl.points.length > 0 && (
                                        <div className="pl-6 space-y-1.5 border-l-2 border-slate-100 dark:border-slate-800 ml-1.5 my-1">
                                            {cl.points.map((pt, pIdx) => (
                                                <div
                                                    key={pIdx}
                                                    className="flex gap-2 items-baseline text-slate-700 dark:text-slate-300 text-xs md:text-sm"
                                                >
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 font-mono select-none">
                                                        {pt.point})
                                                    </span>
                                                    <span>{pt.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {art.amendment_notes && art.amendment_notes.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        <div className="font-semibold flex items-center gap-1 text-amber-900 dark:text-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Ghi chú sửa đổi, bổ sung:</span>
                        </div>
                        {art.amendment_notes.map((note, nIdx) => (
                            <p key={nIdx} className="pl-4 italic">
                                • {note}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LawArticleCard;
