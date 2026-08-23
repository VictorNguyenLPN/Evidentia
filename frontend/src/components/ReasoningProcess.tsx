import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Loader2,
    ChevronRight
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
    defaultExpanded = true,
    isStreaming = false,
    className = '',
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded || isStreaming);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    const [hasUserToggled, setHasUserToggled] = useState<boolean>(false);

    const [openSubSteps, setOpenSubSteps] = useState<Record<string, boolean>>({
        step1: true,
        step2: true,
        step3: true,
    });

    useEffect(() => {
        if (!isStreaming) return;
        const startTime = Date.now();
        const interval = setInterval(() => {
            setElapsedSeconds((Date.now() - startTime) / 1000);
        }, 100);

        return () => clearInterval(interval);
    }, [isStreaming]);

    useEffect(() => {
        if (isStreaming && !hasUserToggled) {
            setIsExpanded(true);
        }
    }, [isStreaming, hasUserToggled]);

    const toggleSubStep = (stepKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenSubSteps(prev => ({
            ...prev,
            [stepKey]: !prev[stepKey]
        }));
    };

    const step1 = steps.find((s) => s.step === 'query_analysis');
    const step2 = steps.find((s) => s.step === 'hybrid_retrieval');
    const step3 = steps.find((s) => s.step === 'answer_synthesis');

    const resolvedSearchQuery = analysis?.search_query || step1?.details?.search_query;
    const resolvedTargetDate = analysis?.target_date || step1?.details?.target_date;
    const resolvedIntent = analysis?.intent || step1?.details?.intent;
    const resolvedReasoning = analysis?.reasoning || step1?.details?.reasoning;

    const topSources = step2?.details?.top_sources || [];

    if (!isStreaming && !analysis && steps.length === 0) {
        return null;
    }

    const handleMasterToggle = () => {
        setHasUserToggled(true);
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className={`w-full mb-3.5 select-none ${className}`}>
            <button
                type="button"
                onClick={handleMasterToggle}
                className="w-full inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-200/70 transition-colors cursor-pointer font-medium"
                aria-expanded={isExpanded}
            >
                <span>
                    {isStreaming
                        ? `Đang thực thi (${elapsedSeconds.toFixed(1)}s)...`
                        : `Thực thi trong ${elapsedSeconds > 0 ? `${elapsedSeconds.toFixed(1)}s` : 'vài giây'}`}
                </span>
                <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                        }`}
                />
            </button>

            {isExpanded && (
                <div className="mt-1.5 ml-3 pl-1.5 border-l-2 border-slate-200/80 space-y-1.5 text-xs text-gray-900">
                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={(e) => toggleSubStep('step1', e)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-200/70 transition-colors cursor-pointer w-full"
                        >
                            {step1?.status === 'running' ? (
                                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                            ) : step1?.status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-500 shrink-0">1</span>
                            )}

                            <span className="truncate">Phân tích câu hỏi</span>

                            <ChevronRight
                                className={`w-3 h-3 transition-transform duration-150 ${openSubSteps.step1 ? 'rotate-90' : ''
                                    }`}
                            />
                        </button>

                        {openSubSteps.step1 && (
                            <div className="ml-5 p-2.5 space-y-2 text-[11px] text-slate-600">
                                {resolvedReasoning && (
                                    <p className="italic text-slate-700 leading-relaxed">
                                        <span className="font-semibold text-slate-900 not-italic">Suy nghĩ: </span>
                                        "{resolvedReasoning}"
                                    </p>
                                )}

                                {resolvedSearchQuery && (
                                    <p className="italic text-slate-700 leading-relaxed">
                                        <span className="font-semibold text-slate-900 not-italic">Từ khóa: </span>
                                        "{resolvedSearchQuery}"
                                    </p>
                                )}

                                {resolvedIntent && (
                                    <p className="italic text-slate-700 leading-relaxed">
                                        <span className="font-semibold text-slate-900 not-italic">Ý định: </span>
                                        {getIntentLabel(resolvedIntent)} {resolvedTargetDate ? `(Mốc: ${resolvedTargetDate})` : '(Hiện tại)'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={(e) => toggleSubStep('step2', e)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-200/70 transition-colors cursor-pointer w-full"
                        >
                            {step2?.status === 'running' ? (
                                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                            ) : step2?.status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] shrink-0">2</span>
                            )}

                            <span className="truncate">Truy xuất thông tin từ Vector Database</span>

                            <ChevronRight
                                className={`w-3 h-3 transition-transform duration-150 ${openSubSteps.step2 ? 'rotate-90' : ''
                                    }`}
                            />
                        </button>

                        {openSubSteps.step2 && (
                            <div className="ml-5 p-2.5 space-y-2 text-[11px] text-slate-600">
                                {topSources.length > 0 && (
                                    <div className="space-y-1 pt-1">
                                        <div className="font-semibold text-slate-900 not-italic">
                                            Top văn bản khớp nhất:
                                        </div>
                                        {topSources.map((src, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-1.5 px-2 py-1 text-slate-700 truncate"
                                            >
                                                {i + 1}. 
                                                <span className="truncate">{src}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={(e) => toggleSubStep('step3', e)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-200/70 transition-colors cursor-pointer w-full"
                        >
                            {step3?.status === 'running' ? (
                                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                            ) : step3?.status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] shrink-0">3</span>
                            )}

                            <span className="truncate">Kiểm chứng & Tổng hợp câu trả lời</span>

                            <ChevronRight
                                className={`w-3 h-3 transition-transform duration-150 ${openSubSteps.step3 ? 'rotate-90' : ''
                                    }`}
                            />
                        </button>

                        {openSubSteps.step3 && (
                            <div className="ml-5 p-2.5 text-[11px]">
                                <p className="leading-relaxed">
                                    Đối chiếu tính hiệu lực thực tế, định dạng trích dẫn chuẩn pháp lý và sinh câu trả lời có căn cứ xác thực.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReasoningProcess;
