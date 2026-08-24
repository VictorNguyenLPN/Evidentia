import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle2,
    Loader2,
    ChevronRight
} from 'lucide-react';

export interface PipelineStep {
    step: string;
    status: string; // 'running' | 'completed' | 'error'
    message: string;
    title?: string;
    step_type?: string; // 'tool_call' | 'direct_answer' | 'synthesis' | 'reflection'
    tool?: string;
    tool_args?: Record<string, any>;
    details?: {
        thought?: string;
        reasoning?: string;
        search_query?: string;
        target_date?: string;
        domain?: string;
        intent?: string;
        num_retrieved?: number;
        top_sources?: string[];
        document_title?: string;
        article_title?: string;
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
    duration?: number;
    className?: string;
}

export const ReasoningProcess: React.FC<ReasoningProcessProps> = ({
    analysis,
    steps = [],
    citationsCount = 0,
    defaultExpanded = false,
    isStreaming = false,
    duration,
    className = '',
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded || isStreaming);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(duration || 0);
    const [openStepIds, setOpenStepIds] = useState<Record<string, boolean>>({});
    const prevStreamingRef = useRef<boolean>(isStreaming);

    useEffect(() => {
        if (!isStreaming) return;
        const startTime = Date.now();
        const interval = setInterval(() => {
            setElapsedSeconds((Date.now() - startTime) / 1000);
        }, 100);

        return () => clearInterval(interval);
    }, [isStreaming]);

    useEffect(() => {
        if (isStreaming) {
            setIsExpanded(true);
        } else if (prevStreamingRef.current && !isStreaming) {
            setIsExpanded(false);
        }
        prevStreamingRef.current = isStreaming;
    }, [isStreaming]);

    const isStepOpen = (stepKey: string): boolean => {
        return openStepIds[stepKey] !== undefined ? openStepIds[stepKey] : false;
    };

    const toggleStep = (stepKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenStepIds(prev => ({
            ...prev,
            [stepKey]: !isStepOpen(stepKey)
        }));
    };

    if (!isStreaming && (!steps || steps.length === 0) && !analysis) {
        return null;
    }

    const handleMasterToggle = () => {
        setIsExpanded((prev) => !prev);
    };

    const displayDuration = elapsedSeconds > 0
        ? elapsedSeconds
        : (duration !== undefined && duration > 0
            ? duration
            : (steps.length > 0 ? +(steps.length * 1.4 + 0.6).toFixed(1) : 2.0));

    return (
        <div className={`w-full mb-3.5 ${className}`}>
            <button
                type="button"
                onClick={handleMasterToggle}
                className="w-full flex items-center justify-start gap-1.5 px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-200/70 transition-colors cursor-pointer font-medium text-slate-900"
                aria-expanded={isExpanded}
            >
                <span>
                    {isStreaming
                        ? `Agent đang suy luận (${elapsedSeconds.toFixed(1)}s)...`
                        : `Quá trình suy luận (${steps.length > 0 ? `${steps.length} bước` : 'hoàn tất'} - ${displayDuration.toFixed(1)}s)`}
                </span>
                <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                    }`}
                />
            </button>

            {isExpanded && (
                <div className="mt-1.5 ml-3 pl-2.5 border-l-2 border-slate-200/90 space-y-2 text-xs text-gray-900">
                    {steps.map((step, idx) => {
                        const stepKey = step.step || `step_${idx}`;
                        const isOpen = isStepOpen(stepKey);
                        const title = step.title || step.message || step.tool || `Bước ${idx + 1}`;
                        const thought = step.details?.thought || step.details?.reasoning;
                        const topSources = step.details?.top_sources || [];
                        const searchQuery = step.tool_args?.query || step.details?.search_query;
                        const targetDate = step.tool_args?.target_date || step.details?.target_date;

                        return (
                            <div key={stepKey} className="space-y-1">
                                <button
                                    type="button"
                                    onClick={(e) => toggleStep(stepKey, e)}
                                    className="flex items-center justify-start gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-200/70 transition-colors cursor-pointer w-full group"
                                >
                                    {step.status === 'running' ? (
                                        <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}

                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <span className="font-medium text-slate-900 truncate text-[11.5px]">{title}</span>
                                    </div>

                                    <ChevronRight
                                        className={`w-3 h-3 text-slate-900 transition-transform duration-150 shrink-0 ${
                                            isOpen ? 'rotate-90' : ''
                                        }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="ml-5.5 px-2.5 space-y-2 text-[11px] text-slate-600">
                                        {thought && (
                                            <p className="italic text-slate-700 leading-relaxed">
                                                <span className="font-medium text-slate-900 not-italic">Suy nghĩ: </span>
                                                "{thought}"
                                            </p>
                                        )}

                                        {searchQuery && (
                                            <p className="text-slate-700">
                                                <span className="font-medium text-slate-900">Truy vấn: </span>
                                                <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[10.5px] font-mono text-slate-800">{searchQuery}</code>
                                                {targetDate && <span className="ml-1.5 text-slate-500">(Mốc hiệu lực: {targetDate})</span>}
                                            </p>
                                        )}

                                        {topSources.length > 0 && (
                                            <div className="space-y-1 pt-0.5">
                                                <div className="text-slate-900 font-medium">
                                                    Căn cứ pháp lý tìm thấy ({topSources.length}):
                                                </div>
                                                <div className="space-y-1 pl-1">
                                                    {topSources.map((src, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-1.5 text-slate-700 text-[10.5px] truncate"
                                                        >
                                                            <span className="text-slate-400">•</span>
                                                            <span className="truncate">{src}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReasoningProcess;
