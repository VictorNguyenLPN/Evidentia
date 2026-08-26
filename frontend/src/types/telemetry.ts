export interface StepTokenBreakdown {
    step: string;
    phase?: string;
    title?: string;
    prompt_tokens: number;
    system_tokens: number;
    answer_tokens: number;
    total_tokens: number;
}

export interface PhaseTokens {
    prompt_tokens: number;
    system_tokens: number;
    answer_tokens: number;
    total_tokens: number;
}

export interface TokenUsage {
    prompt_tokens: number;
    system_tokens: number;
    answer_tokens: number;
    total_tokens: number;
    thinking_tokens?: PhaseTokens;
    synthesis_tokens?: PhaseTokens;
    breakdown?: StepTokenBreakdown[];
}

export interface PipelineStepDetails {
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
    [key: string]: unknown;
}

export interface PipelineStep {
    step: string;
    status: 'running' | 'completed' | 'error' | string;
    message: string;
    title?: string;
    step_type?: 'tool_call' | 'direct_answer' | 'synthesis' | 'reflection' | string;
    tool?: string;
    tool_args?: Record<string, unknown>;
    details?: PipelineStepDetails;
}

export interface QueryAnalysis {
    search_query?: string;
    intent?: string;
    target_date?: string;
    domain?: string;
    reasoning?: string;
}
