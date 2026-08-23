import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Calendar,
    Paperclip,
    ArrowUp,
    SlidersHorizontal,
    MoreVertical,
    X,
    FileText,
    CheckCircle2,
    Loader2,
    Search,
    Sparkles,
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Button from '../components/Button';
import ReasoningProcess, { type PipelineStep, type QueryAnalysis } from '../components/ReasoningProcess';
import { useChat, type ChatSession } from '../contexts/ChatContext';

interface Citation {
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

interface Message {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    targetDate?: string;
    analysis?: QueryAnalysis;
    citations?: Citation[];
    steps?: PipelineStep[];
    isStreaming?: boolean;
}

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

export const ChatPage: React.FC = () => {
    const { chatId } = useParams<{ chatId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { setChats, fetchChats, setIsSearchOpen } = useChat();

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);
    const [chatCreatedAt, setChatCreatedAt] = useState<string | null>(null);
    const [inputPrompt, setInputPrompt] = useState('');
    const [targetDate, setTargetDate] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Handle initial prompt from navigation state (e.g. from LawsPage "Hỏi AI về điều này")
    useEffect(() => {
        if (location.state && typeof location.state === 'object' && 'prompt' in location.state) {
            const initialText = (location.state as any).prompt;
            if (initialText) {
                setInputPrompt(initialText);
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.focus();
                    }
                }, 100);
            }
        }
    }, [location.state]);

    // Load messages when URL chatId changes
    useEffect(() => {
        if (!chatId) {
            setActiveChatId(null);
            setMessages([]);
            setChatCreatedAt(null);
            return;
        }

        // If this navigation was triggered by submitting the first question, skip premature 404 fetch
        if (isSendingMessageRef.current === chatId) {
            isSendingMessageRef.current = null;
            setActiveChatId(chatId);
            return;
        }

        setActiveChatId(chatId);

        const loadChatDetails = async () => {
            try {
                const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}`);
                if (res.ok) {
                    const chatDoc = await res.json();
                    if (chatDoc) {
                        if (chatDoc.created_at) {
                            setChatCreatedAt(chatDoc.created_at);
                        } else if (chatDoc.updated_at) {
                            setChatCreatedAt(chatDoc.updated_at);
                        }
                        if (Array.isArray(chatDoc.messages)) {
                            setMessages(chatDoc.messages);
                        }
                    }
                } else if (res.status === 404) {
                    console.warn(`Chat ${chatId} not found`);
                    setMessages([]);
                    setChatCreatedAt(null);
                }
            } catch (err) {
                console.warn('Error loading chat messages:', err);
            }
        };

        loadChatDetails();
    }, [chatId]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const isSendingMessageRef = useRef<string | null>(null);

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
        }
    }, [inputPrompt]);


    // Handle Escape key to close citation modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedCitation) {
                setSelectedCitation(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCitation]);

    // Send Message Handler (Real-Time SSE Streaming)
    const handleSendMessage = async () => {
        const queryText = inputPrompt.trim();
        if (!queryText || isLoading) return;

        // Generate chat ID immediately on frontend if starting a new chat
        const isNewChat = !chatId && !activeChatId;
        const currentChatId = chatId || activeChatId || generateChatId(CURRENT_USER_EMAIL);

        // Instantly update URL and active state when the first question is submitted
        if (isNewChat) {
            isSendingMessageRef.current = currentChatId;
            setActiveChatId(currentChatId);
            navigate(`/chats/${encodeURIComponent(currentChatId)}`, { replace: true });

            // Optimistically add to sidebar immediately
            const now = new Date();
            setChatCreatedAt(now.toISOString());
            const formattedTimeDate = `${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
            const newChatSession: ChatSession = {
                id: currentChatId,
                title: queryText,
                time: formattedTimeDate,
                created_at: now.toISOString(),
                updated_at: now.toISOString(),
                tag: 'Pháp luật',
                isPinned: false
            };
            setChats(prev => [newChatSession, ...prev.filter(c => c.id !== currentChatId)]);
        }

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg: Message = {
            id: String(Date.now()),
            sender: 'user',
            text: queryText,
            timestamp: currentTime,
            targetDate: targetDate || undefined,
        };

        const assistantMsgId = String(Date.now() + 1);
        const initialAssistantMsg: Message = {
            id: assistantMsgId,
            sender: 'assistant',
            text: '',
            timestamp: currentTime,
            targetDate: targetDate || undefined,
            analysis: undefined,
            citations: [],
            steps: [],
            isStreaming: true,
        };

        setMessages(prev => [...prev, userMsg, initialAssistantMsg]);
        setInputPrompt('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: queryText,
                    target_date: targetDate || undefined,
                    top_k: 5,
                    chat_id: currentChatId,
                }),
            });

            if (!res.ok || !res.body) {
                const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || 'Lỗi kết nối máy chủ');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const block of lines) {
                    const trimmed = block.trim();
                    if (!trimmed.startsWith('data:')) continue;
                    const jsonStr = trimmed.replace(/^data:\s*/, '');
                    if (!jsonStr) continue;

                    try {
                        const event = JSON.parse(jsonStr);

                        if (event.type === 'step_start') {
                            setMessages(prev =>
                                prev.map(msg => {
                                    if (msg.id !== assistantMsgId) return msg;
                                    const existingSteps = msg.steps || [];
                                    const stepIdx = existingSteps.findIndex(s => s.step === event.step);
                                    const newSteps = [...existingSteps];
                                    if (stepIdx >= 0) {
                                        newSteps[stepIdx] = {
                                            ...newSteps[stepIdx],
                                            status: 'running',
                                            message: event.message
                                        };
                                    } else {
                                        newSteps.push({
                                            step: event.step,
                                            status: 'running',
                                            message: event.message
                                        });
                                    }
                                    return { ...msg, steps: newSteps, isStreaming: true };
                                })
                            );
                        } else if (event.type === 'step_complete') {
                            setMessages(prev =>
                                prev.map(msg => {
                                    if (msg.id !== assistantMsgId) return msg;
                                    const existingSteps = msg.steps || [];
                                    const stepIdx = existingSteps.findIndex(s => s.step === event.step);
                                    const newSteps = [...existingSteps];
                                    if (stepIdx >= 0) {
                                        newSteps[stepIdx] = {
                                            ...newSteps[stepIdx],
                                            status: 'completed',
                                            message: event.message || newSteps[stepIdx].message,
                                            details: event.details || newSteps[stepIdx].details
                                        };
                                    } else {
                                        newSteps.push({
                                            step: event.step,
                                            status: 'completed',
                                            message: event.message,
                                            details: event.details
                                        });
                                    }
                                    return {
                                        ...msg,
                                        steps: newSteps,
                                        analysis: event.analysis || msg.analysis,
                                        citations: event.citations || msg.citations,
                                        isStreaming: true
                                    };
                                })
                            );
                        } else if (event.type === 'token') {
                            setMessages(prev =>
                                prev.map(msg => {
                                    if (msg.id !== assistantMsgId) return msg;
                                    return {
                                        ...msg,
                                        text: msg.text + event.content,
                                        isStreaming: true
                                    };
                                })
                            );
                        } else if (event.type === 'done') {
                            setMessages(prev =>
                                prev.map(msg => {
                                    if (msg.id !== assistantMsgId) return msg;
                                    return {
                                        ...msg,
                                        text: event.answer || msg.text,
                                        analysis: event.analysis || msg.analysis,
                                        citations: event.citations || msg.citations,
                                        steps: event.steps || msg.steps,
                                        isStreaming: false
                                    };
                                })
                            );

                            if (event.chat_id) {
                                setActiveChatId(event.chat_id);
                            }
                            fetchChats();
                        } else if (event.type === 'error') {
                            throw new Error(event.detail || 'Lỗi xử lý luồng stream');
                        }
                    } catch (parseErr) {
                        console.warn('Error parsing SSE event chunk:', parseErr);
                    }
                }
            }
        } catch (err: any) {
            console.error('Error in chat stream request:', err);
            setMessages(prev =>
                prev.map(msg => {
                    if (msg.id !== assistantMsgId) return msg;
                    return {
                        ...msg,
                        text: msg.text
                            ? `${msg.text}\n\n⚠️ *Ngắt kết nối luồng: ${err.message}*`
                            : `⚠️ **Không thể hoàn tất tra cứu**: ${err.message || 'Lỗi kết nối máy chủ hoặc API'}. Vui lòng kiểm tra lại cấu hình.`,
                        isStreaming: false
                    };
                })
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col w-full h-full">
            {selectedCitation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="fixed inset-0" onClick={() => setSelectedCitation(null)} />
                    <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 truncate">
                                        {selectedCitation.document_title}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate">
                                        {selectedCitation.hierarchy_path?.join(' > ')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="icon"
                                size="sm"
                                onClick={() => setSelectedCitation(null)}
                                title="Đóng"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-700">
                            <div className="flex flex-wrap gap-2 text-xs">
                                {selectedCitation.effect_status_name && (
                                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                                        Hiệu lực: {selectedCitation.effect_status_name}
                                    </span>
                                )}
                                {selectedCitation.effect_date && (
                                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                                        Ngày hiệu lực: {selectedCitation.effect_date}
                                    </span>
                                )}
                                {selectedCitation.doc_type && (
                                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                                        Loại VB: {selectedCitation.doc_type}
                                    </span>
                                )}
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                                {selectedCitation.legal_content}
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSelectedCitation(null)}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <header className="py-5 sticky top-0 z-0 h-14 flex items-center justify-end bg-transparent pointer-events-none">
                <div className="flex items-center gap-1.5 pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearchOpen(true)}
                        title="Tìm kiếm"
                    >
                        <Search className="w-4 h-4 text-slate-800" />
                        <span className="hidden sm:inline font-medium">Tìm kiếm</span>
                    </Button>
                    <Button
                        variant="icon"
                        size="sm"
                        onClick={() => setIsSearchOpen(true)}
                        title="Cấu hình"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-slate-800" />
                    </Button>
                    <Button
                        variant="icon"
                        size="sm"
                        onClick={() => setIsSearchOpen(true)}
                        title="Tùy chọn khác"
                    >
                        <MoreVertical className="w-4 h-4 text-slate-800" />
                    </Button>
                </div>
            </header>

            <main className="relative z-10 flex-1 flex flex-col h-full bg-white overflow-hidden">
                <div className="flex-1 overflow-y-auto z-20 flex flex-col justify-between">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center my-auto">
                            <div className="max-w-2xl w-full text-center space-y-5">
                                <div className="space-y-2">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Hệ thống Sẵn sàng Hỗ trợ
                                    </h2>
                                    <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                                        Nhập câu hỏi, tình huống pháp lý hoặc đính kèm văn bản hợp đồng để kích hoạt quy trình lập luận và tra cứu theo mốc thời gian.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Active Conversation Messages */
                        <div className="relative z-10 max-w-4xl w-full mx-auto space-y-3.5 pb-4">
                            {/* Chat Header Timestamp Row */}
                            <div className="flex items-center justify-center select-none">
                                <span className="text-sm text-slate-400 font-medium">
                                    {formatChatHeaderDate(chatCreatedAt)}
                                </span>
                            </div>

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`w-full flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    {msg.sender === 'user' ? (
                                        <div className="max-w-2xl text-black">
                                            <div className="flex items-center justify-end gap-2 mb-1.5 text-[11px] text-gray-700">
                                                {msg.targetDate && (
                                                    <span>Mốc: {msg.targetDate}</span>
                                                )}
                                            </div>
                                            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-slate-200 px-4 py-3 rounded-2xl">
                                                {msg.text}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="max-w-4xl py-4 space-y-4">
                                            {/* Reasoning / Thinking Process Step-by-Step */}
                                            {(msg.analysis || (msg.steps && msg.steps.length > 0) || msg.isStreaming) && (
                                                <ReasoningProcess
                                                    analysis={msg.analysis}
                                                    steps={msg.steps}
                                                    citationsCount={msg.citations?.length || 0}
                                                    isStreaming={msg.isStreaming}
                                                />
                                            )}

                                            {/* Citations Header Bar */}
                                            {/* {msg.citations && msg.citations.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                        <span>Căn cứ pháp lý trích dẫn ({msg.citations.length})</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.citations.map((cit, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setSelectedCitation(cit)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-xs text-slate-700 hover:text-indigo-700 transition-colors shadow-2xs cursor-pointer"
                                                            >
                                                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                                                <span className="font-medium truncate max-w-[200px]">
                                                                    {cit.document_title}
                                                                </span>
                                                                {cit.effect_status_name && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-medium">
                                                                        {cit.effect_status_name}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )} */}

                                            {/* Answer Body (Markdown with Live Token Streaming) */}
                                            <div className="text-sm sm:text-base leading-relaxed text-slate-900">
                                                {msg.text && (
                                                    <div>
                                                        <MarkdownRenderer content={msg.text} />
                                                        {msg.isStreaming && (
                                                            <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 animate-pulse align-middle" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* ================= INPUT FOOTER AREA (STICKY BOTTOM INSIDE SCROLL CONTAINER) ================= */}
                    <div className="sticky bottom-0 z-20 max-w-4xl w-full mx-auto mt-auto pt-2 bg-white rounded-lg">
                        {/* Date Picker Popover */}
                        {isDatePickerOpen && (
                            <div className="mb-2 p-3 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs">
                                <span className="font-medium text-slate-700">Chọn mốc thời gian tra cứu:</span>
                                <input
                                    type="date"
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    className="border border-slate-300 rounded-md px-2 py-1 text-slate-800 text-xs focus:outline-indigo-600"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsDatePickerOpen(false)}
                                    className="px-2 py-1 h-auto text-xs"
                                >
                                    Đóng
                                </Button>
                            </div>
                        )}

                        <div className="flex flex-col rounded-2xl bg-white border border-slate-300 focus-within:ring-3 focus-within:ring-indigo-100 shadow-lg shadow-slate-200/50 p-3">
                            <textarea
                                ref={textareaRef}
                                value={inputPrompt}
                                onChange={(e) => setInputPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                placeholder="Mô tả câu hỏi hoặc yêu cầu tra cứu pháp luật theo thời điểm..."
                                className="w-full bg-transparent text-slate-900 text-sm sm:text-base px-1.5 py-1 focus:outline-none resize-none font-sans min-h-10 max-h-56 overflow-y-auto"
                            />

                            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Paperclip className="w-4 h-4" />}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 font-medium"
                                    >
                                        <span className="hidden sm:inline">Tài liệu</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Calendar className="w-4 h-4" />}
                                        onClick={() => setIsDatePickerOpen(prev => !prev)}
                                        className={`px-3 py-1.5 font-medium ${targetDate ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                    >
                                        <span className="hidden sm:inline">
                                            {targetDate ? `Mốc: ${targetDate}` : 'Mốc thời gian'}
                                        </span>
                                    </Button>
                                </div>

                                {/* Send Button */}
                                <Button
                                    circle={true}
                                    variant="primary"
                                    onClick={handleSendMessage}
                                    disabled={!inputPrompt.trim() || isLoading}
                                    className="w-9 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Gửi yêu cầu"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Footer Disclaimer Note */}
                        <p className="my-3 text-center text-xs text-slate-500">
                            Evidentia có thể trả lời chưa chính xác. Vui lòng kiểm tra các thông tin quan trọng
                        </p>
                    </div>
                </div>


            </main>
        </div>
    );
};

export default ChatPage;
