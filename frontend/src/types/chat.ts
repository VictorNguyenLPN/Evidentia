import type { PipelineStep, QueryAnalysis, TokenUsage } from './telemetry';

export interface ChatSession {
    id: string;
    title: string;
    time?: string;
    tag?: string;
    is_pinned?: boolean;
    isPinned?: boolean;
    is_shared?: boolean;
    shared_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Citation {
    document_title: string;
    hierarchy_path: string[];
    legal_content?: string;
    text?: string;
    issue_date?: string;
    effect_date?: string;
    effect_status_name?: string;
    doc_type?: string;
    hybrid_score?: number;
    score?: number;
    vbpl_url?: string;
}

export interface Message {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    targetDate?: string;
    analysis?: QueryAnalysis;
    citations?: Citation[];
    steps?: PipelineStep[];
    token_usage?: TokenUsage;
    isStreaming?: boolean;
    duration?: number;
}

export interface ChatDocumentResponse {
    chat_id?: string;
    id?: string;
    title?: string;
    tag?: string;
    is_pinned?: boolean;
    isPinned?: boolean;
    is_shared?: boolean;
    shared_at?: string;
    is_owner?: boolean;
    is_private?: boolean;
    created_at?: string;
    updated_at?: string;
    messages?: Message[];
}

export interface ChatRequestPayload {
    query: string;
    target_date?: string;
    top_k?: number;
    chat_id?: string;
    mode?: string;
}

export type ChatStreamEventType =
    | 'step'
    | 'step_update'
    | 'step_start'
    | 'step_complete'
    | 'analysis'
    | 'chunk'
    | 'token'
    | 'citations'
    | 'answer'
    | 'final_answer'
    | 'token_usage'
    | 'done'
    | 'error';

export interface ChatStreamEvent {
    type: ChatStreamEventType;
    data?: unknown;
    step?: string;
    status?: string;
    message?: string;
    content?: string;
    details?: Record<string, unknown>;
    analysis?: QueryAnalysis;
    citations?: Citation[];
    steps?: PipelineStep[];
    token_usage?: TokenUsage;
    answer?: string;
    chat_id?: string;
    title?: string;
    tag?: string;
    detail?: string;
}
