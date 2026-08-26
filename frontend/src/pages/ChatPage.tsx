import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    SlidersHorizontal,
    MoreVertical,
    Search,
    Copy,
    Check,
    Ellipsis,
    Share,
    RefreshCw,
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Button from '../components/Button';
import ReasoningProcess from '../components/ReasoningProcess';
import CitationModal from '../components/CitationModal';
import ChatInputBar from '../components/ChatInputBar';
import { useChat } from '../contexts';
import { chatService } from '../services';
import type { Message, Citation, ChatSession, PipelineStep, QueryAnalysis, TokenUsage } from '../types';

const CURRENT_USER_EMAIL = 'huy.nguyen@evidentia.vn';

// Generate a 16-character hex hash from user email + timestamp + random entropy on frontend
const generateChatId = (email: string = CURRENT_USER_EMAIL): string => {
    const raw = `${email}::${Date.now()}::${Math.random().toString(36).substring(2, 9)}`;
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < raw.length; i++) {
        const ch = raw.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    const s1 = ((h1 ^ (h1 >>> 16)) >>> 0).toString(16).padStart(8, '0');
    const s2 = ((h2 ^ (h2 >>> 16)) >>> 0).toString(16).padStart(8, '0');
    return `${s1}${s2}`;
};

const formatChatHeaderDate = (isoStringOrDate?: string | null): string => {
    const d = isoStringOrDate ? new Date(isoStringOrDate) : new Date();
    if (isNaN(d.getTime())) return '';

    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = daysOfWeek[d.getDay()];

    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return `${dayOfWeek}, ${date}, ${time}`;
};

interface LocationState {
    prompt?: string;
}

export const ChatPage: React.FC = () => {
    const { chatId } = useParams<{ chatId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { setChats, fetchChats, setIsSearchOpen } = useChat();

    const [chatCreatedAt, setChatCreatedAt] = useState<string | null>(null);
    const [inputPrompt, setInputPrompt] = useState<string>(() => {
        const state = location.state as LocationState | null;
        return state?.prompt || '';
    });
    const [targetDate, setTargetDate] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isSendingMessageRef = useRef<string | null>(null);

    // Focus textarea if initial prompt was provided from navigation
    useEffect(() => {
        const state = location.state as LocationState | null;
        if (state?.prompt && textareaRef.current) {
            const timer = setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Load messages when URL chatId changes
    useEffect(() => {
        if (!chatId) {
            return;
        }

        if (isSendingMessageRef.current === chatId) {
            isSendingMessageRef.current = null;
            return;
        }

        let isMounted = true;
        chatService.getChatById(chatId)
            .then((chatDoc) => {
                if (!isMounted) return;
                if (chatDoc) {
                    setChatCreatedAt(chatDoc.created_at || chatDoc.updated_at || null);
                    if (chatDoc.messages && Array.isArray(chatDoc.messages)) {
                        setMessages(chatDoc.messages);
                    } else {
                        setMessages([]);
                    }
                } else {
                    setMessages([]);
                }
            })
            .catch((err) => {
                console.warn('Could not fetch chat by ID:', err);
                if (isMounted) setMessages([]);
            });

        return () => {
            isMounted = false;
        };
    }, [chatId]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        const trimmed = inputPrompt.trim();
        if (!trimmed || isLoading) return;

        let activeId = chatId;
        if (!activeId) {
            activeId = generateChatId();
            isSendingMessageRef.current = activeId;
            navigate(`/chats/${activeId}`, { replace: true });
        }

        const userMsgId = `usr_${Date.now()}`;
        const assistantMsgId = `ast_${Date.now()}`;

        const userMessage: Message = {
            id: userMsgId,
            sender: 'user',
            text: trimmed,
            targetDate: targetDate || undefined,
            timestamp: new Date().toISOString(),
        };

        const initialAssistantMessage: Message = {
            id: assistantMsgId,
            sender: 'assistant',
            text: '',
            isStreaming: true,
            steps: [],
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
        setInputPrompt('');
        setIsLoading(true);

        const currentTurnStartTime = Date.now();

        // Optimistically add chat to sidebar
        const isFirstMessage = !chatId || messages.length === 0;
        if (isFirstMessage) {
            const truncatedTitle = trimmed.length > 35 ? trimmed.substring(0, 35) + '...' : trimmed;
            const newChatSession: ChatSession = {
                id: activeId,
                title: truncatedTitle,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_pinned: false,
                isPinned: false,
            };

            setChats((prev) => {
                const exists = prev.some((c) => c.id === activeId);
                if (exists) return prev;
                return [newChatSession, ...prev];
            });
        }

        try {
            await chatService.streamChat(
                {
                    chat_id: activeId,
                    query: trimmed,
                    target_date: targetDate || undefined,
                    mode: 'agentic',
                },
                (event) => {
                    const eventType = event.type;

                    setMessages((prev) =>
                        prev.map((msg) => {
                            if (msg.id !== assistantMsgId) return msg;

                            // 1. Pipeline step updates
                            if (eventType === 'step' || eventType === 'step_update') {
                                const stepData = event.data as PipelineStep | undefined;
                                if (!stepData) return msg;
                                const existingSteps = msg.steps ? [...msg.steps] : [];
                                const targetIdx = existingSteps.findIndex(
                                    (s) => s.step === stepData.step || (s.title && s.title === stepData.title)
                                );

                                if (targetIdx >= 0) {
                                    existingSteps[targetIdx] = {
                                        ...existingSteps[targetIdx],
                                        ...stepData,
                                        details: {
                                            ...existingSteps[targetIdx].details,
                                            ...stepData.details,
                                        },
                                    };
                                } else {
                                    existingSteps.push(stepData);
                                }

                                return {
                                    ...msg,
                                    steps: existingSteps,
                                };
                            }

                            // 2. Query analysis event
                            if (eventType === 'analysis') {
                                return {
                                    ...msg,
                                    analysis: event.data as QueryAnalysis,
                                };
                            }

                            // 3. Streaming answer token chunk
                            if (eventType === 'chunk') {
                                const chunkData = event.data as { text?: string } | string | undefined;
                                const chunkText = typeof chunkData === 'string' ? chunkData : (chunkData?.text || '');
                                return {
                                    ...msg,
                                    text: (msg.text || '') + chunkText,
                                };
                            }

                            // 4. Citations list
                            if (eventType === 'citations') {
                                return {
                                    ...msg,
                                    citations: event.data as Citation[],
                                };
                            }

                            // 5. Final full response / answer
                            if (eventType === 'answer' || eventType === 'final_answer') {
                                const answerData = event.data as { text?: string; token_usage?: TokenUsage; citations?: Citation[] } | string | undefined;
                                const finalText = typeof answerData === 'string' ? answerData : (answerData?.text || msg.text);
                                const tokenUsage = typeof answerData === 'object' && answerData ? (answerData.token_usage || msg.token_usage) : msg.token_usage;
                                const citations = typeof answerData === 'object' && answerData ? (answerData.citations || msg.citations) : msg.citations;
                                const turnDuration = +((Date.now() - currentTurnStartTime) / 1000).toFixed(1);

                                return {
                                    ...msg,
                                    text: finalText,
                                    token_usage: tokenUsage,
                                    citations: citations,
                                    isStreaming: false,
                                    duration: turnDuration,
                                };
                            }

                            // 6. Token usage telemetry update
                            if (eventType === 'token_usage') {
                                return {
                                    ...msg,
                                    token_usage: event.data as TokenUsage,
                                };
                            }

                            // 7. Error event
                            if (eventType === 'error') {
                                const errData = event.data as { message?: string } | undefined;
                                return {
                                    ...msg,
                                    text: (msg.text ? msg.text + '\n\n' : '') + `❌ Lỗi: ${errData?.message || 'Đã có lỗi xảy ra.'}`,
                                    isStreaming: false,
                                };
                            }

                            return msg;
                        })
                    );
                }
            );

            // Re-fetch chat list to get official backend summary / title
            await fetchChats();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.';
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMsgId
                        ? {
                            ...msg,
                            text: `❌ Lỗi kết nối: ${errorMsg}. Vui lòng thử lại sau.`,
                            isStreaming: false,
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
                )
            );
        }
    };

    const handleCopy = async (text?: string, messageId?: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessageId(messageId || null);
            setTimeout(() => {
                setCopiedMessageId((prev) => (prev === messageId ? null : prev));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy answer:', err);
        }
    };

    const activeMessages = chatId ? messages : [];

    return (
        <div className="flex flex-col w-full h-full bg-white dark:bg-slate-950">
            <CitationModal
                citation={selectedCitation}
                onClose={() => setSelectedCitation(null)}
            />

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

            <main className="relative z-10 flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
                <div className="flex-1 overflow-y-auto z-20 flex flex-col justify-between">
                    {activeMessages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center my-auto">
                            <div className="max-w-2xl w-full text-center space-y-5">
                                <div className="space-y-2">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        Hệ thống Sẵn sàng Hỗ trợ
                                    </h2>
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                                        Nhập câu hỏi, tình huống pháp lý hoặc đính kèm văn bản hợp đồng để kích hoạt quy trình lập luận và tra cứu theo mốc thời gian.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 max-w-4xl w-full mx-auto space-y-3.5 pb-4">
                            {/* Chat Header Timestamp Row */}
                            <div className="flex items-center justify-center select-none">
                                <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                                    {formatChatHeaderDate(chatCreatedAt)}
                                </span>
                            </div>

                            {activeMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`w-full flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    {msg.sender === 'user' ? (
                                        <div className="max-w-2xl text-slate-900 dark:text-white">
                                            <div className="flex items-center justify-end gap-2 mb-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                                                {msg.targetDate && (
                                                    <span>Mốc: {msg.targetDate}</span>
                                                )}
                                            </div>
                                            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-2xl">
                                                {msg.text}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="max-w-4xl py-4 space-y-4">
                                            {/* Reasoning Process */}
                                            {(msg.analysis || (msg.steps && msg.steps.length > 0) || msg.token_usage || msg.isStreaming) && (
                                                <ReasoningProcess
                                                    analysis={msg.analysis}
                                                    steps={msg.steps}
                                                    tokenUsage={msg.token_usage}
                                                    citationsCount={msg.citations?.length || 0}
                                                    isStreaming={msg.isStreaming}
                                                    duration={msg.duration}
                                                />
                                            )}

                                            {/* Answer Body */}
                                            <div className="text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100">
                                                {msg.text && (
                                                    <div>
                                                        <MarkdownRenderer content={msg.text} />
                                                        {msg.isStreaming && (
                                                            <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 dark:bg-indigo-400 animate-pulse align-middle" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {!msg.isStreaming && msg.text && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="icon"
                                                        size="xs"
                                                        onClick={(e) => handleCopy(msg.text, msg.id, e)}
                                                        title="Sao chép phản hồi"
                                                    >
                                                        {copiedMessageId === msg.id ? (
                                                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />
                                                        )}
                                                    </Button>

                                                    <Button
                                                        variant="icon"
                                                        size="xs"
                                                        title="Sao chép phản hồi"
                                                    >
                                                        <Share className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />
                                                    </Button>

                                                    <Button
                                                        variant="icon"
                                                        size="xs"
                                                        title="Sao chép phản hồi"
                                                    >
                                                        <RefreshCw className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />
                                                    </Button>

                                                    <Button
                                                        variant="icon"
                                                        size="xs"
                                                        title="Sao chép phản hồi"
                                                    >
                                                        <Ellipsis className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    <ChatInputBar
                        inputPrompt={inputPrompt}
                        setInputPrompt={setInputPrompt}
                        targetDate={targetDate}
                        setTargetDate={setTargetDate}
                        isLoading={isLoading}
                        onSendMessage={handleSendMessage}
                        textareaRef={textareaRef}
                    />
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
