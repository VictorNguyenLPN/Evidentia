import React from 'react';
import type { LawDocument } from '../types';

export interface LawOverviewCardProps {
    doc: LawDocument;
    onSelect: (docId: string) => void;
}

export const LawOverviewCard: React.FC<LawOverviewCardProps> = ({ doc, onSelect }) => {
    return (
        <button
            onClick={() => onSelect(doc.document_id)}
            className="text-start bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between group cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
            <h1 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                {doc.document_title}
            </h1>

            <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400 w-full">
                <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                        Cơ quan ban hành
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {doc.organ_names?.join(', ') || 'Quốc hội'}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                        Người ký
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {doc.signer_names?.join(', ') || 'Chủ tịch Quốc hội'}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                        Trạng thái
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {doc.effect_status_name}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                        Ngày ban hành
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {doc.issue_date
                            ? new Date(doc.issue_date).toLocaleDateString('vi-VN')
                            : ''}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                        Ngày có hiệu lực
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {doc.effect_date
                            ? new Date(doc.effect_date).toLocaleDateString('vi-VN')
                            : ''}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                        Ngày hết hiệu lực
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {doc.expire_date
                            ? new Date(doc.expire_date).toLocaleDateString('vi-VN')
                            : ''}
                    </span>
                </div>
            </div>
        </button>
    );
};

export default LawOverviewCard;
