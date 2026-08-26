import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Search,
    ExternalLink,
    SlidersHorizontal,
    AlertCircle,
    Loader2,
    MoreVertical,
} from 'lucide-react';
import Button from '../components/Button';
import LawOverviewStats from '../components/LawOverviewStats';
import LawOverviewCard from '../components/LawOverviewCard';
import LawArticleCard from '../components/LawArticleCard';
import LawChapterSidebar from '../components/LawChapterSidebar';
import { useChat } from '../contexts';
import { lawService } from '../services';
import type {
    LawsOverviewResponse,
    LawDocument,
    LawArticle,
} from '../types';

export const LawsPage: React.FC = () => {
    const navigate = useNavigate();
    const { documentId: urlDocId } = useParams<{ documentId?: string }>();
    const { setIsSearchOpen } = useChat();

    // Laws state
    const [lawsData, setLawsData] = useState<LawsOverviewResponse | null>(null);
    const [isLoadingLaws, setIsLoadingLaws] = useState(true);

    // Selected law state
    const selectedDocId = urlDocId || null;
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

    // Calculate effect status counts dynamically from laws list
    const statusCounts = useMemo(() => {
        const laws = lawsData?.laws || [];
        let active = 0;
        let partiallyExpired = 0;
        let expired = 0;

        laws.forEach((doc) => {
            const status = (doc.effect_status_name || '').trim().toLowerCase();
            if (status.includes('hết hiệu lực một phần') || status.includes('ngưng hiệu lực một phần')) {
                partiallyExpired++;
            } else if (status.includes('hết hiệu lực') || status.includes('ngưng hiệu lực') || status.includes('hết hạn')) {
                expired++;
            } else if (status.includes('còn hiệu lực') || status.includes('đang có hiệu lực') || status.includes('có hiệu lực')) {
                active++;
            } else if (status) {
                active++;
            }
        });

        return {
            active,
            partiallyExpired,
            expired,
        };
    }, [lawsData?.laws]);

    // Calculate unique fields count
    const totalFieldsCount = useMemo(() => {
        const fields = new Set((lawsData?.laws || []).flatMap((d) => d.field_names || []));
        return fields.size > 0 ? fields.size : 1;
    }, [lawsData?.laws]);

    // Fetch overview of all laws
    useEffect(() => {
        let isMounted = true;
        lawService.getLawsOverview()
            .then((data) => {
                if (isMounted) {
                    setLawsData(data);
                    setIsLoadingLaws(false);
                }
            })
            .catch((e) => {
                console.error('Error fetching laws:', e);
                if (isMounted) {
                    setIsLoadingLaws(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Load selected law detail
    useEffect(() => {
        if (!selectedDocId) {
            return;
        }

        let isMounted = true;
        lawService.getLawDetail(selectedDocId)
            .then((law) => {
                if (isMounted) {
                    setSelectedLaw(law);
                }
            })
            .catch((e) => {
                console.error(`Error fetching law ${selectedDocId}:`, e);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedDocId]);

    // Initial batch load when filters or selectedDocId change
    useEffect(() => {
        if (!selectedDocId) {
            return;
        }

        let isMounted = true;
        lawService.getLawArticles(selectedDocId, {
            page: 1,
            limit: 15,
            chapter_number: selectedChapter,
            search: debouncedSearch,
        })
            .then((data) => {
                if (!isMounted) return;
                setArticles(data.articles || []);
                setHasMore(data.has_more ?? false);
                setTotalArticlesCount(data.total ?? 0);
                setPage(1);
            })
            .catch((e) => {
                console.error('Error fetching articles initial batch:', e);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedDocId, selectedChapter, debouncedSearch]);

    // Load next page function
    const loadNextPage = useCallback(async () => {
        if (!selectedDocId || isLoadingArticles || !hasMore) return;
        const nextPage = page + 1;
        setIsLoadingArticles(true);
        try {
            const data = await lawService.getLawArticles(selectedDocId, {
                page: nextPage,
                limit: 15,
                chapter_number: selectedChapter,
                search: debouncedSearch,
            });
            setArticles((prev) => [...prev, ...(data.articles || [])]);
            setHasMore(data.has_more ?? false);
            setTotalArticlesCount(data.total ?? 0);
            setPage(nextPage);
        } catch (e) {
            console.error('Error fetching next page of articles:', e);
        } finally {
            setIsLoadingArticles(false);
        }
    }, [selectedDocId, isLoadingArticles, hasMore, page, selectedChapter, debouncedSearch]);

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingArticles && selectedDocId && articles.length > 0) {
                    loadNextPage();
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
    }, [hasMore, isLoadingArticles, selectedDocId, articles.length, loadNextPage]);

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
        navigate(`/laws/${docId}`);
    };

    const activeLaw = selectedDocId ? selectedLaw : null;
    const activeArticles = selectedDocId ? articles : [];

    return (
        <div className="flex flex-col w-full h-full">
            <header className="p-5 sticky top-0 z-0 h-14 flex items-center justify-end bg-transparent pointer-events-none">
                <div className="flex items-center gap-1.5 pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearchOpen(true)}
                        title="Tìm kiếm"
                    >
                        <Search className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                        <span className="hidden sm:inline font-medium">Tìm kiếm</span>
                    </Button>
                    <Button
                        variant="icon"
                        size="sm"
                        onClick={() => setIsSearchOpen(true)}
                        title="Cấu hình"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                    </Button>
                    <Button
                        variant="icon"
                        size="sm"
                        onClick={() => setIsSearchOpen(true)}
                        title="Tùy chọn khác"
                    >
                        <MoreVertical className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-slate-950">
                <div className="flex-1 overflow-y-auto z-20 flex flex-col justify-between">
                    {!selectedDocId ? (
                        <div className="flex-1 overflow-y-auto px-6 pt-3.5 pb-6 space-y-8">
                            <LawOverviewStats
                                totalLaws={lawsData?.total_laws ?? (lawsData?.laws?.length || 0)}
                                totalFields={totalFieldsCount}
                                totalArticles={lawsData?.total_articles ?? 0}
                                activeCount={statusCounts.active}
                                partiallyExpiredCount={statusCounts.partiallyExpired}
                                expiredCount={statusCounts.expired}
                            />

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                        Danh sách văn bản
                                    </h3>
                                </div>

                                {isLoadingLaws ? (
                                    <div className="flex items-center justify-center py-16 text-slate-400 dark:text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                        <span>Đang tải danh sách luật...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
                                        {(lawsData?.laws || []).map((doc) => (
                                            <LawOverviewCard
                                                key={doc.document_id}
                                                doc={doc}
                                                onSelect={handleSelectDocument}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-6 py-3.5 gap-4 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center justify-start shrink-0 gap-2">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                        {activeLaw?.document_title}
                                    </h2>
                                    {activeLaw?.vbpl_url && (
                                        <a
                                            href={activeLaw.vbpl_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 shrink-0"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center justify-start gap-4 mt-2 flex-wrap">
                                    <h2 className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                        Ban hành: {activeLaw?.issue_date}
                                    </h2>
                                    <h2 className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                        Hiệu lực từ: {activeLaw?.effect_date}
                                    </h2>
                                    <h2 className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                        Hết hiệu lực: {activeLaw?.expire_date || 'Null'}
                                    </h2>
                                    <h2 className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                        Trạng thái: {activeLaw?.effect_status_name}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                <div
                                    ref={scrollContainerRef}
                                    className="flex-1 overflow-y-auto space-y-5"
                                >
                                    {activeArticles.length === 0 && !isLoadingArticles ? (
                                        <div className="bg-white dark:bg-slate-950 text-center h-full flex flex-col items-center justify-center">
                                            <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">Văn bản không tồn tại</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại chương mục.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 px-6 py-3.5">
                                            {activeArticles.map((art) => (
                                                <LawArticleCard
                                                    key={`${art.document_id}_${art.article_number}`}
                                                    article={art}
                                                    isCopied={copiedArticleId === art.article_number}
                                                    onCopy={handleCopyArticle}
                                                    onAskAI={handleAskAI}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div ref={observerTarget} className="py-6 flex items-center justify-center">
                                        {isLoadingArticles && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs">
                                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                                                <span>Đang tải thêm điều luật...</span>
                                            </div>
                                        )}
                                        {!hasMore && activeArticles.length > 0 && (
                                            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                Đã tải toàn bộ {totalArticlesCount} điều luật
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <LawChapterSidebar
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    selectedChapter={selectedChapter}
                                    onSelectChapter={setSelectedChapter}
                                    chapters={activeLaw?.chapters || []}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LawsPage;
