import React, { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle2,
    Loader2,
    ChevronRight,
} from 'lucide-react';
import type { PipelineStep, QueryAnalysis, TokenUsage, StepTokenBreakdown } from '../types';
import { useChat } from '../contexts';

export type { PipelineStep, QueryAnalysis, TokenUsage, StepTokenBreakdown };

interface ReasoningProcessProps {
    analysis?: QueryAnalysis;
    steps?: PipelineStep[];
    tokenUsage?: TokenUsage;
    citationsCount?: number;
    defaultExpanded?: boolean;
    isStreaming?: boolean;
    duration?: number;
    className?: string;
}

export const ReasoningProcess: React.FC<ReasoningProcessProps> = ({
    analysis,
    steps = [],
    tokenUsage,
    defaultExpanded = false,
    isStreaming = false,
    duration,
    className = '',
}) => {
    const { isDevMode } = useChat();
    const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(duration || 0);
    const [openStepIds, setOpenStepIds] = useState<Record<string, boolean>>({});

    // Keep live timer during streaming
    useEffect(() => {
        if (!isStreaming) return;
        const startTime = Date.now();
        const interval = setInterval(() => {
            setElapsedSeconds((Date.now() - startTime) / 1000);
        }, 100);

        return () => clearInterval(interval);
    }, [isStreaming]);

    // Top-level useMemo to respect React Rules of Hooks
    const stepBreakdownMap = useMemo(() => {
        const map: Record<string, StepTokenBreakdown> = {};
        if (tokenUsage?.breakdown) {
            for (const b of tokenUsage.breakdown) {
                if (b.step) map[b.step] = b;
            }
        }
        return map;
    }, [tokenUsage]);

    // Compute effective expansion state: user override > streaming auto-open > default
    const isExpanded = userExpanded !== null ? userExpanded : (isStreaming || defaultExpanded);

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

    const handleMasterToggle = () => {
        setUserExpanded(!isExpanded);
    };

    if (!isStreaming && (!steps || steps.length === 0) && !analysis && !tokenUsage) {
        return null;
    }

    const displayDuration = elapsedSeconds > 0
        ? elapsedSeconds
        : (duration !== undefined && duration > 0
            ? duration
            : (steps.length > 0 ? +(steps.length * 1.4 + 0.6).toFixed(1) : 2.0));

    const formatNum = (n?: number): string => {
        if (n === undefined || n === null) return '0';
        return Number(n).toLocaleString('vi-VN');
    };

    return (
        <div className={`w-full mb-3.5 ${className}`}>
            {/* Master Header Bar */}
            <button
                type="button"
                onClick={handleMasterToggle}
                className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer font-medium text-slate-900 dark:text-slate-100"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-1.5 min-w-0">
                    <span>
                        {isStreaming
                            ? `Agent đang suy luận (${elapsedSeconds.toFixed(1)}s)...`
                            : `Quá trình suy luận (${steps.length > 0 ? `${steps.length} bước` : 'hoàn tất'} - ${displayDuration.toFixed(1)}s)`}
                    </span>
                    <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                </div>
            </button>

            {/* Collapsible Content */}
            {isExpanded && (
                <div className="mt-1.5 ml-3 pl-2.5 border-l-2 border-slate-200/90 dark:border-slate-800 space-y-2 text-xs text-slate-900 dark:text-slate-100">
                    {/* List of Steps */}
                    {steps.map((step, idx) => {
                        const stepKey = step.step || `step_${idx}`;
                        const isOpen = isStepOpen(stepKey);
                        const title = step.title || step.message || step.tool || `Bước ${idx + 1}`;
                        const thought = step.details?.thought || step.details?.reasoning;
                        const topSources = step.details?.top_sources || [];
                        const queryParam = step.tool_args?.query;
                        const searchQuery = (typeof queryParam === 'string' ? queryParam : '') || step.details?.search_query;
                        const dateParam = step.tool_args?.target_date;
                        const targetDate = (typeof dateParam === 'string' ? dateParam : '') || step.details?.target_date;
                        const stepTokens = stepBreakdownMap[stepKey];

                        return (
                            <div key={stepKey} className="space-y-1">
                                <button
                                    type="button"
                                    onClick={(e) => toggleStep(stepKey, e)}
                                    className="flex items-center justify-start gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer w-full group"
                                >
                                    {step.status === 'running' ? (
                                        <Loader2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    )}

                                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate text-[11.5px]">{title}</span>

                                    <ChevronRight
                                        className={`w-3 h-3 text-slate-900 dark:text-slate-100 transition-transform duration-150 shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="ml-5.5 px-2.5 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                                        {thought && (
                                            <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed">
                                                <span className="font-medium text-slate-900 dark:text-slate-100 not-italic">Suy nghĩ: </span>
                                                "{thought}"
                                            </p>
                                        )}

                                        {searchQuery && (
                                            <p className="text-slate-700 dark:text-slate-300">
                                                <span className="font-medium text-slate-900 dark:text-slate-100">Truy vấn: </span>
                                                <code className="bg-slate-200/60 dark:bg-slate-800 px-1 py-0.5 rounded text-[10.5px] font-mono text-slate-800 dark:text-slate-200">{searchQuery}</code>
                                                {targetDate && <span className="ml-1.5 text-slate-500 dark:text-slate-400">(Mốc hiệu lực: {targetDate})</span>}
                                            </p>
                                        )}

                                        {topSources.length > 0 && (
                                            <div className="space-y-1 pt-0.5">
                                                <div className="text-slate-900 dark:text-slate-100 font-medium">
                                                    Căn cứ pháp lý tìm thấy ({topSources.length}):
                                                </div>
                                                <div className="space-y-1 pl-1">
                                                    {topSources.map((src, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[10.5px] truncate"
                                                        >
                                                            <span className="text-slate-400 dark:text-slate-500">•</span>
                                                            <span className="truncate">{src}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {isDevMode && stepTokens && (
                                            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono pt-1 space-x-1.5 flex items-center flex-wrap">
                                                <span>Prompt: <strong className="text-slate-700 dark:text-slate-200 font-medium">{formatNum(stepTokens.prompt_tokens)}</strong></span>
                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                <span>System: <strong className="text-slate-700 dark:text-slate-200 font-medium">{formatNum(stepTokens.system_tokens)}</strong></span>
                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                <span>Answer: <strong className="text-slate-700 dark:text-slate-200 font-medium">{formatNum(stepTokens.answer_tokens)}</strong></span>
                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                <span>Total: <strong className="text-slate-900 dark:text-white">{formatNum(stepTokens.total_tokens)}</strong></span>
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
