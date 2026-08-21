import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Search,
    ExternalLink,
    Copy,
    Check,
    Sparkles,
    ArrowLeft,
    SlidersHorizontal,
    AlertCircle,
    Loader2,
    X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';


interface LawChapterSummary {
    chapter_number: string;
    chapter_title: string;
    article_count: number;
    article_range: string;
    articles: Array<{
        article_number: number;
        article_title: string;
    }>;
}

interface LawDocument {
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
    stats: {
        total_articles: number;
        total_chapters: number;
        total_clauses: number;
        total_points: number;
        total_chunks: number;
    };
    chapters: LawChapterSummary[];
}

interface LawPoint {
    point: string;
    text: string;
    amendment_notes?: string[];
}

interface LawClause {
    clause_number: number | string;
    clause_title?: string;
    lead_in_text?: string;
    text: string;
    points: LawPoint[];
    amendment_notes?: string[];
}

interface LawArticle {
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

interface ChatSession {
    id: string;
    title: string;
    time: string;
    tag: string;
    isPinned: boolean;
}

export const LawsPage: React.FC = () => {
    const navigate = useNavigate();
    const { documentId: urlDocId } = useParams<{ documentId?: string }>();

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chats, setChats] = useState<ChatSession[]>([]);

    // Laws state
    const [lawsData, setLawsData] = useState<{
        total_laws: number;
        total_articles: number;
        total_chapters: number;
        total_chunks: number;
        laws: LawDocument[];
    } | null>(null);
    const [isLoadingLaws, setIsLoadingLaws] = useState(true);

    // Selected law state
    const [selectedDocId, setSelectedDocId] = useState<string | null>(urlDocId || null);
    const [selectedLaw, setSelectedLaw] = useState<LawDocument | null>(null);

    // Articles & Infinite Scroll State
    const [articles, setArticles] = useState<LawArticle[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingArticles, setIsLoadingArticles] = useState(false);
    const [totalArticlesCount, setTotalArticlesCount] = useState(0);

    // Filters
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // UI Copy state
    const [copiedArticleId, setCopiedArticleId] = useState<number | null>(null);

    // Intersection observer target for infinite scrolling
    const observerTarget = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch sidebar chats
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch('/api/chats');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setChats(data);
                }
            } catch (e) {
                console.warn('Could not fetch chats in LawsPage:', e);
            }
        };
        fetchChats();
    }, []);

    // Fetch overview of all laws
    const fetchLawsOverview = async () => {
        setIsLoadingLaws(true);
        try {
            const res = await fetch('/api/laws');
            if (res.ok) {
                const data = await res.json();
                setLawsData(data);
            }
        } catch (e) {
            console.error('Error fetching laws:', e);
        } finally {
            setIsLoadingLaws(false);
        }
    };

    useEffect(() => {
        fetchLawsOverview();
    }, []);

    // Sync URL doc ID changes (handles browser Back/Forward navigation)
    useEffect(() => {
        if (urlDocId) {
            setSelectedDocId(urlDocId);
        } else {
            setSelectedDocId(null);
            setSelectedLaw(null);
            setSelectedChapter(null);
            setSearchTerm('');
            setArticles([]);
        }
    }, [urlDocId]);

    // Load selected law detail
    useEffect(() => {
        if (!selectedDocId) {
            setSelectedLaw(null);
            setArticles([]);
            return;
        }

        const fetchLawDetail = async () => {
            try {
                const res = await fetch(`/api/laws/${selectedDocId}`);
                if (res.ok) {
                    const law = await res.json();
                    setSelectedLaw(law);
                }
            } catch (e) {
                console.error(`Error fetching law ${selectedDocId}:`, e);
            }
        };

        fetchLawDetail();
        // Reset articles & pagination when switching document or filters
        setPage(1);
        setArticles([]);
        setHasMore(true);
    }, [selectedDocId]);

    // Reset pagination when chapter or search changes
    useEffect(() => {
        if (selectedDocId) {
            setPage(1);
            setArticles([]);
            setHasMore(true);
        }
    }, [selectedChapter, debouncedSearch]);

    // Fetch articles batch (Infinite Scroll)
    const fetchArticlesBatch = useCallback(
        async (pageNum: number, isNewFilter: boolean = false) => {
            if (!selectedDocId || isLoadingArticles) return;

            setIsLoadingArticles(true);
            try {
                const params = new URLSearchParams();
                params.set('page', pageNum.toString());
                params.set('limit', '15');
                if (selectedChapter) params.set('chapter_number', selectedChapter);
                if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

                const res = await fetch(`/api/laws/${selectedDocId}/articles?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    const newArticles: LawArticle[] = data.articles || [];

                    setArticles((prev) => (isNewFilter || pageNum === 1 ? newArticles : [...prev, ...newArticles]));
                    setHasMore(data.has_more ?? false);
                    setTotalArticlesCount(data.total ?? 0);
                }
            } catch (e) {
                console.error('Error fetching articles batch:', e);
            } finally {
                setIsLoadingArticles(false);
            }
        },
        [selectedDocId, selectedChapter, debouncedSearch, isLoadingArticles]
    );

    // Initial batch load
    useEffect(() => {
        if (selectedDocId && page === 1) {
            fetchArticlesBatch(1, true);
        }
    }, [selectedDocId, selectedChapter, debouncedSearch]);

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingArticles && selectedDocId && articles.length > 0) {
                    setPage((prevPage) => {
                        const nextPage = prevPage + 1;
                        fetchArticlesBatch(nextPage, false);
                        return nextPage;
                    });
                }
            },
            { threshold: 0.2, rootMargin: '200px' }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [hasMore, isLoadingArticles, selectedDocId, articles.length, fetchArticlesBatch]);

    // Handle copying article full text
    const handleCopyArticle = (art: LawArticle) => {
        navigator.clipboard.writeText(art.full_rendered_text);
        setCopiedArticleId(art.article_number);
        setTimeout(() => {
            setCopiedArticleId(null);
        }, 2000);
    };

    // Ask AI about this article
    const handleAskAI = (art: LawArticle) => {
        const docName = selectedLaw?.document_title || 'Bộ luật';
        const prompt = `Hãy giải thích chi tiết quy định tại Điều ${art.article_number} (${art.article_title}) của ${docName}. Nêu rõ phạm vi áp dụng, quyền, nghĩa vụ và các lưu ý thực tiễn quan trọng.`;
        navigate('/chats', { state: { prompt } });
    };

    // Select document
    const handleSelectDocument = (docId: string) => {
        setSelectedDocId(docId);
        navigate(`/laws/${docId}`);
    };

    // Back to all laws overview
    const handleBackToOverview = () => {
        setSelectedDocId(null);
        setSelectedLaw(null);
        setSelectedChapter(null);
        setSearchTerm('');
        navigate('/laws');
    };

    return (
        <div className="flex h-screen w-screen text-slate-800 antialiased overflow-hidden font-sans">
            {/* ================= REUSABLE SIDEBAR ================= */}
            <Sidebar
                activeNav="laws"
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                chats={chats}
                setChats={setChats}
            />

            {/* Main Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Content Body */}
                <div className="flex-1 overflow-hidden flex">

                    {!selectedDocId ? (
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Dashboard Stats */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                        Tổng quan
                                    </h2>
                                    <div className="text-md text-emerald-600">
                                        Cập nhật ngày 21/08/2026
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Văn bản
                                            </span>
                                        </div>
                                        <div className="text-2xl font-extrabold text-slate-900 mt-2">
                                            {lawsData?.total_laws ?? 1}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Lĩnh vực
                                            </span>
                                        </div>
                                        <div className="text-2xl font-extrabold text-slate-900 mt-2">
                                            1
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Điều
                                            </span>
                                        </div>
                                        <div className="text-2xl font-extrabold text-slate-900 mt-2">
                                            {lawsData?.total_articles ?? 220}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Khoản
                                            </span>
                                        </div>
                                        <div className="text-2xl font-extrabold text-slate-900 mt-2">
                                            {(lawsData?.laws?.[0]?.stats?.total_clauses ?? 568)}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Điểm
                                            </span>
                                        </div>
                                        <div className="text-2xl font-extrabold text-slate-900 mt-2">
                                            {(lawsData?.laws?.[0]?.stats?.total_points ?? 287)}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Documents Grid */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                            Danh sách văn bản
                                        </h3>
                                    </div>
                                </div>

                                {isLoadingLaws ? (
                                    <div className="flex items-center justify-center py-16 text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                        <span>Đang tải danh sách luật...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {(lawsData?.laws || []).map((doc) => (
                                            <button
                                                key={doc.document_id}
                                                onClick={() => handleSelectDocument(doc.document_id)}
                                                className="text-start bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between group"
                                            >
                                                <h1
                                                    className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug cursor-pointer">
                                                    {doc.document_title}
                                                </h1>

                                                <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-slate-500">
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                                            Cơ quan ban hành
                                                        </span>
                                                        <span className="font-medium text-slate-700">
                                                            {doc.organ_names?.join(', ') || 'Quốc hội'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                                            Người ký
                                                        </span>
                                                        <span className="font-medium text-slate-700">
                                                            {doc.signer_names?.join(', ') || 'Chủ tịch Quốc hội'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                                            Trạng thái
                                                        </span>
                                                        <span className={`font-medium text-slate-700`}>
                                                            {doc.effect_status_name}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                                            Ngày ban hành
                                                        </span>
                                                        <span className="font-medium text-slate-700">
                                                            {doc.issue_date
                                                                ? new Date(doc.issue_date).toLocaleDateString('vi-VN')
                                                                : ''}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                                            Ngày có hiệu lực
                                                        </span>
                                                        <span className="font-medium text-slate-700">
                                                            {doc.effect_date
                                                                ? new Date(doc.effect_date).toLocaleDateString('vi-VN')
                                                                : ''}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                                            Ngày hết hiệu lực
                                                        </span>
                                                        <span className="font-medium text-slate-700">
                                                            {doc.expire_date
                                                                ? new Date(doc.expire_date).toLocaleDateString('vi-VN')
                                                                : ''}
                                                        </span>
                                                    </div>

                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* If DOCUMENT selected: Master-Detail Interactive Law Reader with Infinite Scroll */
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Top Breadcrumb & Document Header with Back button */}
                            <div className="bg-white px-6 py-3.5 flex items-center justify-between shrink-0">

                                <h2 className="text-sm font-bold text-slate-900 truncate">
                                    {selectedLaw?.document_title || 'Chi tiết văn bản'}
                                </h2>

                                {selectedLaw?.vbpl_url && (
                                    <a
                                        href={selectedLaw.vbpl_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium shrink-0 ml-3"
                                    >
                                        <span>Văn bản gốc</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Right Pane: Infinite Scroll Articles Feed */}
                                {/* <div
                                    ref={scrollContainerRef}
                                    className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#f8fafc]"
                                >

                                    
                                    {articles.length === 0 && !isLoadingArticles ? (
                                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                                            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <h4 className="text-sm font-bold text-slate-800">Không tìm thấy điều luật phù hợp</h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại chương mục.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {articles.map((art) => (
                                                <div
                                                    key={`${art.document_id}_${art.article_number}`}
                                                    id={`article-${art.article_number}`}
                                                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all"
                                                >
                                                    
                                                    <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 rounded-md font-mono">
                                                                    Điều {art.article_number}
                                                                </span>
                                                                <span className="text-xs text-slate-400 font-medium">
                                                                    Chương {art.chapter_number}: {art.chapter_title}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                                                                {art.article_title}
                                                            </h3>
                                                        </div>

                                                        
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                onClick={() => handleCopyArticle(art)}
                                                                className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                                title="Sao chép toàn văn điều luật"
                                                            >
                                                                {copiedArticleId === art.article_number ? (
                                                                    <>
                                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                        <span className="text-emerald-600 font-semibold">Đã chép</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                        <span>Sao chép</span>
                                                                    </>
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() => handleAskAI(art)}
                                                                className="flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                                title="Hỏi trợ lý AI phân tích điều luật này"
                                                            >
                                                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                                                <span>Hỏi AI</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    
                                                    <div className="pt-3.5 space-y-3 text-sm text-slate-800 leading-relaxed">
                                                        
                                                        {art.article_text && (
                                                            <p className="text-slate-700 font-normal">
                                                                {art.article_text}
                                                            </p>
                                                        )}

                                                        
                                                        {art.clauses && art.clauses.length > 0 && (
                                                            <div className="space-y-2.5">
                                                                {art.clauses.map((cl) => {
                                                                    const clauseBody = cl.text || cl.lead_in_text || '';
                                                                    return (
                                                                        <div
                                                                            key={cl.clause_number}
                                                                            className="space-y-1.5"
                                                                        >
                                                                            {clauseBody && (
                                                                                <div className="flex gap-2 items-baseline">
                                                                                    <span className="font-semibold text-slate-900 shrink-0 select-none">
                                                                                        {cl.clause_number}.
                                                                                    </span>
                                                                                    <span className="text-slate-800">
                                                                                        {clauseBody}
                                                                                    </span>
                                                                                </div>
                                                                            )}

                                                                            
                                                                            {cl.points && cl.points.length > 0 && (
                                                                                <div className="pl-6 space-y-1.5 border-l-2 border-slate-100 ml-1.5 my-1">
                                                                                    {cl.points.map((pt, pIdx) => (
                                                                                        <div
                                                                                            key={pIdx}
                                                                                            className="flex gap-2 items-baseline text-slate-700 text-xs md:text-sm"
                                                                                        >
                                                                                            <span className="font-semibold text-indigo-600 shrink-0 font-mono select-none">
                                                                                                {pt.point})
                                                                                            </span>
                                                                                            <span>{pt.text}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        
                                                        {art.amendment_notes && art.amendment_notes.length > 0 && (
                                                            <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-800 space-y-1">
                                                                <div className="font-semibold flex items-center gap-1 text-amber-900">
                                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                                                    <span>Ghi chú sửa đổi, bổ sung:</span>
                                                                </div>
                                                                {art.amendment_notes.map((note, nIdx) => (
                                                                    <p key={nIdx} className="pl-4 italic">
                                                                        • {note}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    
                                    <div ref={observerTarget} className="py-6 flex items-center justify-center">
                                        {isLoadingArticles && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs">
                                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                                <span>Đang tải thêm điều luật...</span>
                                            </div>
                                        )}
                                        {!hasMore && articles.length > 0 && (
                                            <div className="text-xs text-slate-400 font-medium">
                                                Đã tải toàn bộ {totalArticlesCount} điều luật
                                            </div>
                                        )}
                                    </div>
                                </div> */}
                                {/* Left Pane: Chapter TOC & Fast Navigator */}
                                {/* <div className="w-80 bg-white border-r border-slate-200/80 flex flex-col shrink-0">
                                    
                                    <div className="p-6 border-b border-slate-100 space-y-2.5">
                                        <div className="relative">
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Tìm số điều hoặc từ khóa..."
                                                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                            {searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs px-1">
                                            {selectedChapter && (
                                                <button
                                                    onClick={() => setSelectedChapter(null)}
                                                    className="text-[11px] text-indigo-600 hover:underline"
                                                >
                                                    Bỏ lọc chương
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                                            Mục lục {selectedLaw?.chapters?.length || 0} Chương
                                        </div>

                                        {(selectedLaw?.chapters || []).map((ch) => {
                                            const isSelected = selectedChapter === ch.chapter_number;
                                            return (
                                                <button
                                                    key={ch.chapter_number}
                                                    onClick={() => setSelectedChapter(isSelected ? null : ch.chapter_number)}
                                                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer block ${isSelected
                                                        ? 'bg-indigo-50/90 border border-indigo-200 text-indigo-900 shadow-xs'
                                                        : 'hover:bg-slate-100/80 text-slate-700 border border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between font-semibold">
                                                        <span className={isSelected ? 'text-indigo-700' : 'text-slate-900'}>
                                                            Chương {ch.chapter_number}
                                                        </span>
                                                        <span
                                                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected
                                                                ? 'bg-indigo-100 text-indigo-700'
                                                                : 'bg-slate-100 text-slate-500'
                                                                }`}
                                                        >
                                                            {ch.article_count} điều
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                        {ch.chapter_title}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-1 font-medium">
                                                        {ch.article_range}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LawsPage;
