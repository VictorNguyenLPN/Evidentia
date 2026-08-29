export type UserRole = 'admin' | 'user' | 'editor';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar?: string;
  role: UserRole;
  plan: UserPlan;
  chats_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminOverviewStats {
  total_users: number;
  free_users?: number;
  pro_users: number;
  admin_users: number;
  total_chats: number;
  total_messages: number;
  total_questions_asked?: number;
  total_guest_ips?: number;
  total_laws: number;
  total_articles: number;
  mongodb_connected: boolean;
  timestamp: string;
}

export interface QdrantOverviewInfo {
  configured: boolean;
  count: number;
  collection: string;
  exists?: boolean;
  error?: string;
}

export interface GeminiOverviewInfo {
  model: string;
  ready: boolean;
}

export interface AdminOverviewResponse {
  stats: AdminOverviewStats;
  qdrant: QdrantOverviewInfo;
  gemini: GeminiOverviewInfo;
  admin: { id: string; email: string; full_name: string };
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'error' | 'unconfigured' | 'warning';
  latency_ms?: number;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SystemHealthResponse {
  timestamp: string;
  services: {
    mongodb: ServiceHealth;
    qdrant: ServiceHealth;
    gemini: ServiceHealth;
    embeddings: ServiceHealth;
    dataset: ServiceHealth;
  };
}

export interface UserQuotaRecord {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  plan: UserPlan;
  questions_used: number;
  questions_limit: number;
  questions_remaining: number;
  limit_reached: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestLimitRecord {
  ip: string;
  question_count: number;
  first_used_at?: string;
  last_used_at?: string;
  last_reset_at?: string;
}

export interface VectorSyncStatus {
  status: 'in_sync' | 'count_mismatch' | 'not_found_warning' | 'unconfigured' | 'file_not_found' | 'error';
  local_count: number;
  cloud_count: number;
  message: string;
  error?: string;
}

export interface VectorStatusResponse {
  sync_status: VectorSyncStatus;
  collection_name: string;
  qdrant_url_configured: boolean;
  dense_dimension: number;
  local_data_path: string;
  local_data_exists: boolean;
}

export interface RetrievalResultChunk {
  chunk_id?: string;
  score?: number;
  text?: string;
  document_title?: string;
  doc_identity?: string;
  document_type?: string;
  issue_date?: string;
  effect_date?: string;
  expire_date?: string;
  hierarchy_path?: string[];
  article_number?: number;
  article_title?: string;
  vbpl_url?: string;
}

export interface TestRetrievalResponse {
  query: string;
  target_date?: string;
  top_k: number;
  latency_ms: number;
  results_count: number;
  results: RetrievalResultChunk[];
}

export interface AdminChatSummary {
  id: string;
  title: string;
  tag: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  messages_count: number;
  latest_preview?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}
