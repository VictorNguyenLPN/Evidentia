import type {
    LawsOverviewResponse,
    LawDocument,
    LawArticlesResponse,
    LawArticleQueryParams
} from '../types';

export const lawService = {
    async getLawsOverview(): Promise<LawsOverviewResponse> {
        const res = await fetch('/api/laws');
        if (!res.ok) {
            throw new Error(`Failed to fetch laws overview: ${res.statusText}`);
        }
        return res.json();
    },

    async getLawDetail(documentId: string): Promise<LawDocument | null> {
        const res = await fetch(`/api/laws/${encodeURIComponent(documentId)}`);
        if (res.status === 404) {
            return null;
        }
        if (!res.ok) {
            throw new Error(`Failed to fetch law detail for ${documentId}: ${res.statusText}`);
        }
        return res.json();
    },

    async getLawArticles(
        documentId: string,
        params: LawArticleQueryParams = {}
    ): Promise<LawArticlesResponse> {
        const searchParams = new URLSearchParams();
        searchParams.set('page', String(params.page || 1));
        searchParams.set('limit', String(params.limit || 15));
        if (params.chapter_number) {
            searchParams.set('chapter_number', params.chapter_number);
        }
        if (params.search?.trim()) {
            searchParams.set('search', params.search.trim());
        }

        const res = await fetch(`/api/laws/${encodeURIComponent(documentId)}/articles?${searchParams.toString()}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch articles for law ${documentId}: ${res.statusText}`);
        }
        return res.json();
    },
};
