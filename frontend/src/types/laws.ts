export interface LawPoint {
    point: string;
    text: string;
    amendment_notes?: string[];
}

export interface LawClause {
    clause_number: number | string;
    clause_title?: string;
    lead_in_text?: string;
    text: string;
    points: LawPoint[];
    amendment_notes?: string[];
}

export interface LawArticle {
    document_id: string;
    document_title: string;
    chapter_number: string;
    chapter_title: string;
    article_number: number;
    article_title: string;
    hierarchy_path: string[];
    article_text?: string | null;
    clauses: LawClause[];
    amendment_notes: string[];
    full_rendered_text: string;
}

export interface LawChapterArticleSummary {
    article_number: number;
    article_title: string;
}

export interface LawChapterSummary {
    chapter_number: string;
    chapter_title: string;
    article_count: number;
    article_range: string;
    articles: LawChapterArticleSummary[];
}

export interface LawStats {
    total_articles: number;
    total_chapters: number;
    total_clauses: number;
    total_points: number;
    total_chunks: number;
}

export interface LawDocument {
    document_id: string;
    document_title: string;
    doc_identity: string;
    document_type: string;
    issue_date: string | null;
    effect_date: string | null;
    effect_status_name: string;
    expire_date: string | null;
    organ_names: string[];
    signer_title_names: string[];
    signer_names: string[];
    vbpl_url: string;
    field_names: string[];
    stats: LawStats;
    chapters: LawChapterSummary[];
}

export interface LawsOverviewResponse {
    total_laws: number;
    total_articles: number;
    total_chapters: number;
    total_chunks: number;
    laws: LawDocument[];
}

export interface LawArticlesResponse {
    document_id: string;
    articles: LawArticle[];
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
}

export interface LawArticleQueryParams {
    page?: number;
    limit?: number;
    chapter_number?: string | null;
    search?: string | null;
}
