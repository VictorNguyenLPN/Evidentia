import React from 'react';

export interface LawOverviewStatsProps {
    totalLaws: number;
    totalFields: number;
    totalArticles: number;
    activeCount: number;
    partiallyExpiredCount: number;
    expiredCount: number;
}

export const LawOverviewStats: React.FC<LawOverviewStatsProps> = ({
    totalLaws,
    totalFields,
    totalArticles,
    activeCount,
    partiallyExpiredCount,
    expiredCount,
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Tổng quan
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Trạng thái
                        </span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                        Đã cập nhật
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Văn bản
                        </span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                        {totalLaws}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Lĩnh vực
                        </span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                        {totalFields}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Điều
                        </span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                        {totalArticles}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Còn hiệu lực
                        </span>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                        {activeCount}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Hết hiệu lực một phần
                        </span>
                    </div>
                    <div className="text-2xl font-extrabold text-amber-500 dark:text-amber-400 mt-2">
                        {partiallyExpiredCount}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Hết hiệu lực
                        </span>
                    </div>
                    <div className="text-2xl font-extrabold text-red-500 dark:text-red-400 mt-2">
                        {expiredCount}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawOverviewStats;
