import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    ChevronDown,
    Search,
    Database,
    CheckCircle2,
    Calendar,
    Tag,
    FileText,
    Layers,
    Loader2
} from 'lucide-react';

export interface PipelineStep {
    step: string;
    status: string; // 'running' | 'completed'
    message: string;
    details?: {
        search_query?: string;
        target_date?: string;
        domain?: string;
        intent?: string;
        reasoning?: string;
        num_retrieved?: number;
        top_sources?: string[];
        [key: string]: any;
    };
}

export interface QueryAnalysis {
    search_query?: string;
    intent?: string;
    target_date?: string;
    domain?: string;
    reasoning?: string;
}

interface ReasoningProcessProps {
    analysis?: QueryAnalysis;
    steps?: PipelineStep[];
    citationsCount?: number;
    defaultExpanded?: boolean;
    isStreaming?: boolean;
    className?: string;
}

const getIntentLabel = (intent?: string): string => {
    switch (intent) {
        case 'search':
            return 'Tra cứu quy định';
        case 'compare':
            return 'So sánh & Đối chiếu';
        case 'temporal_update':
            return 'Kiểm tra mốc hiệu lực';
        default:
            return intent || 'Tra cứu pháp lý';
    }
};

export const ReasoningProcess: React.FC<ReasoningProcessProps> = ({
    analysis,
    steps = [],
    citationsCount = 0,
    defaultExpanded = false,
    isStreaming = false,
    className = '',
}) => {
    // When streaming, automatically keep open so user watches the process live
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded || isStreaming);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    const [hasUserToggled, setHasUserToggled] = useState<boolean>(false);

    // Live timer while streaming
    useEffect(() => {
        if (!isStreaming) return;
        const startTime = Date.now();
        const interval = setInterval(() => {
            setElapsedSeconds((Date.now() - startTime) / 1000);
        }, 100);

        return () => clearInterval(interval);
    }, [isStreaming]);

    // Keep expanded during streaming unless user manually closed it
    useEffect(() => {
        if (isStreaming && !hasUserToggled) {
            setIsExpanded(true);
        }
    }, [isStreaming, hasUserToggled]);

    // Extract step details if available
    const step1 = steps.find((s) => s.step === 'query_analysis');
    const step2 = steps.find((s) => s.step === 'hybrid_retrieval');
    const step3 = steps.find((s) => s.step === 'answer_synthesis');

    const resolvedSearchQuery = analysis?.search_query || step1?.details?.search_query;
    const resolvedTargetDate = analysis?.target_date || step1?.details?.target_date;
    const resolvedDomain = analysis?.domain || step1?.details?.domain;
    const resolvedIntent = analysis?.intent || step1?.details?.intent;
    const resolvedReasoning = analysis?.reasoning || step1?.details?.reasoning;

    const numRetrieved = step2?.details?.num_retrieved ?? (citationsCount > 0 ? citationsCount : undefined);
    const topSources = step2?.details?.top_sources || [];

    // If there is truly no thinking/analysis data and not streaming, don't render
    if (!isStreaming && !analysis && steps.length === 0) {
        return null;
    }

    const handleToggle = () => {
        setHasUserToggled(true);
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className={`w-full my-2 select-none ${className}`}>
            <div className={`rounded-xl transition-all duration-200 overflow-hidden`}>
                {/* Header Bar / Toggle Button */}
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`w-full flex items-center justify-start gap-2 p-2.5 text-left hover:bg-slate-200/80 transition-colors cursor-pointer group ${isExpanded ? "bg-slate-200/80" : ""}`}
                    aria-expanded={isExpanded}
                >
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                        <span className="text-xs font-semibold text-slate-800 tracking-tight">
                            Thực thi trong 2m
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-800' : ''
                                }`}
                        />
                    </div>
                </button>

                {/* Collapsible Steps Content */}
                {isExpanded && (
                    <div className="pl-3 py-3.5 space-y-4 text-xs">
                        <div className="relative pb-2">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        <span>Phân tích yêu cầu & Mốc thời gian</span>
                                    </h4>
                                </div>

                                {resolvedReasoning && (
                                    <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-slate-700 leading-relaxed italic">
                                        <span className="font-semibold text-indigo-900 not-italic">Lập luận ý định: </span>
                                        "{resolvedReasoning}"
                                    </div>
                                )}

                                {(resolvedSearchQuery || resolvedDomain || resolvedIntent) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-600">
                                        {resolvedSearchQuery && (
                                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                                                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-0.5">
                                                    Từ khóa tối ưu (Hybrid Query)
                                                </div>
                                                <span className="font-mono text-slate-800 text-[11px] font-medium">
                                                    {resolvedSearchQuery}
                                                </span>
                                            </div>
                                        )}

                                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 flex flex-col justify-between">
                                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-0.5">
                                                Ý định & Mốc áp dụng
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-800 font-medium">
                                                <span>{getIntentLabel(resolvedIntent)}</span>
                                                {resolvedTargetDate ? (
                                                    <span className="text-amber-700 font-semibold">• Ngày: {resolvedTargetDate}</span>
                                                ) : (
                                                    <span className="text-slate-500">• Mốc: Hiện tại</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative pl-6 pb-2 border-l-2 border-indigo-200/80 last:border-l-0">
                            {step2?.status === 'running' ? (
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                </div>
                            ) : step2?.status === 'completed' ? (
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                    ✓
                                </div>
                            ) : (
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    2
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        <Database className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>Bước 2: Truy xuất căn cứ pháp lý (Qdrant Cloud)</span>
                                    </h4>
                                    <span className="text-[11px] font-medium">
                                        {step2?.status === 'running' && (
                                            <span className="text-indigo-600 flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" /> Đang truy xuất...
                                            </span>
                                        )}
                                        {step2?.status === 'completed' && (
                                            <span className="text-emerald-700 font-medium">Hoàn tất</span>
                                        )}
                                        {!step2 && (
                                            <span className="text-slate-400">Chờ xử lý</span>
                                        )}
                                    </span>
                                </div>

                                {step2 && (
                                    <p className="text-slate-600 leading-relaxed">
                                        Tìm kiếm kết hợp <strong className="text-slate-800 font-semibold">BM25 + Dense Semantic Vector</strong> lọc theo hiệu lực thời gian.
                                        {numRetrieved !== undefined && (
                                            <span className="text-emerald-700 font-medium"> Tìm thấy {numRetrieved} đoạn trích điều khoản phù hợp.</span>
                                        )}
                                    </p>
                                )}

                                {topSources.length > 0 && (
                                    <div className="space-y-1 pt-1">
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                            Top văn bản khớp cao nhất:
                                        </div>
                                        <div className="space-y-1">
                                            {topSources.map((src, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-md border border-slate-200/60 text-slate-700 text-[11px]"
                                                >
                                                    <FileText className="w-3 h-3 text-indigo-600 shrink-0" />
                                                    <span className="truncate">{src}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="relative pl-6">
                            {step3?.status === 'running' ? (
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                </div>
                            ) : step3?.status === 'completed' ? (
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                    ✓
                                </div>
                            ) : (
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    3
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Bước 3: Kiểm chứng hiệu lực & Tổng hợp câu trả lời</span>
                                    </h4>
                                    <span className="text-[11px] font-medium">
                                        {step3?.status === 'running' && (
                                            <span className="text-indigo-600 flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" /> Đang tổng hợp...
                                            </span>
                                        )}
                                        {step3?.status === 'completed' && (
                                            <span className="text-emerald-700 font-medium">Đã kiểm chứng</span>
                                        )}
                                        {!step3 && (
                                            <span className="text-slate-400">Chờ xử lý</span>
                                        )}
                                    </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    Đối chiếu tính hiệu lực thực tế, định dạng trích dẫn chuẩn pháp lý và sinh câu trả lời có căn cứ vững chắc (Grounded).
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReasoningProcess;
