import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  MoreVertical,
  Check,
  Share,
  Sparkles,
} from 'lucide-react';
import Button from '../components/Button';
import CitationModal from '../components/CitationModal';
import ChatInputBar from '../components/ChatInputBar';
import { useChat, useAuth } from '../contexts';
import { chatService } from '../services';
import { getErrorMessage } from '../utils/error';
import {
  generateChatId,
  formatChatHeaderDate,
  reduceStreamingEvent,
} from '../utils/chatHelpers';
import { ChatMessageItem } from './chat/ChatMessageItem';
import { ChatPrivateNotice } from './chat/ChatPrivateNotice';
import { ChatEmptyState } from './chat/ChatEmptyState';
import type { Message, Citation, ChatSession, ChatStreamEvent, ChatDocumentResponse } from '../types';

interface LocationState {
  prompt?: string;
}

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setChats, fetchChats } = useChat();
  const {
    token,
    user,
    isAuthenticated,
    freeQuestionsRemaining,
    isLimitReached,
    openAuthModal,
    refreshUser,
  } = useAuth();

  const [chatCreatedAt, setChatCreatedAt] = useState<string | null>(null);
  const [isPrivateChat, setIsPrivateChat] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<{ show: boolean; message: string } | null>(null);

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
    let isMounted = true;

    if (!chatId) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setIsPrivateChat(false);
        setIsOwner(true);
        setIsShared(false);
        setChatCreatedAt(null);
        setMessages([]);
      });
      return () => {
        isMounted = false;
      };
    }

    if (isSendingMessageRef.current === chatId) {
      isSendingMessageRef.current = null;
      return () => {
        isMounted = false;
      };
    }

    chatService
      .getChatById(chatId)
      .then((chatDoc: ChatDocumentResponse | null) => {
        if (!isMounted) return;
        if (chatDoc) {
          if (chatDoc.is_private) {
            setIsPrivateChat(true);
            setMessages([]);
            return;
          }
          setIsPrivateChat(false);
          setIsOwner(chatDoc.is_owner !== false);
          setIsShared(Boolean(chatDoc.is_shared));
          setChatCreatedAt(chatDoc.created_at || chatDoc.updated_at || null);
          if (chatDoc.messages && Array.isArray(chatDoc.messages)) {
            setMessages(chatDoc.messages);
          } else {
            setMessages([]);
          }
        } else {
          navigate('/chats', { replace: true });
        }
      })
      .catch((err) => {
        console.warn(`Error loading chat ${chatId}:`, err);
        if (isMounted) {
          navigate('/chats', { replace: true });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [chatId, token, user?.id, navigate]);

  const handleShareClick = async () => {
    if (!chatId) return;
    setIsSharing(true);
    try {
      if (!isShared) {
        await chatService.toggleShareChat(chatId, true);
        setIsShared(true);
        setChats((prev: ChatSession[]) =>
          prev.map((c: ChatSession) => (c.id === chatId ? { ...c, is_shared: true } : c))
        );
      }

      const shareUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/chats/${chatId}`
          : `/chats/${chatId}`;

      await navigator.clipboard.writeText(shareUrl);
      setShareToast({
        show: true,
        message: 'Đã tạo và sao chép liên kết chia sẻ cuộc trò chuyện vào clipboard!',
      });
      setTimeout(() => {
        setShareToast(null);
      }, 3000);
    } catch (err: unknown) {
      setShareToast({
        show: true,
        message: getErrorMessage(err, 'Không thể tạo liên kết chia sẻ.'),
      });
      setTimeout(() => {
        setShareToast(null);
      }, 3000);
    } finally {
      setIsSharing(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    const trimmed = inputPrompt.trim();
    if (!trimmed || isLoading) return;

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (isLimitReached) {
      return;
    }

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

      setChats((prev: ChatSession[]) => {
        const exists = prev.some((c: ChatSession) => c.id === activeId);
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
        (event: ChatStreamEvent) => {
          if (event.type === 'done' && event.title) {
            setChats((prev: ChatSession[]) =>
              prev.map((c: ChatSession) => (c.id === activeId ? { ...c, title: event.title! } : c))
            );
          }

          setMessages((prev) =>
            reduceStreamingEvent(prev, assistantMsgId, event, currentTurnStartTime)
          );
        }
      );

      // Re-fetch chat list to get official backend summary / title
      await fetchChats();
      await refreshUser();
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Không thể kết nối đến máy chủ.');
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
        prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg))
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
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-950 relative">
      <CitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      {/* Floating Share Link Notification Toast */}
      {shareToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/90 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 text-xs font-medium tracking-tight">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{shareToast.message}</span>
          </div>
        </div>
      )}

      {/* Read-only Shared Banner */}
      {chatId && !isOwner && isShared && !isPrivateChat && (
        <div className="bg-indigo-50/90 dark:bg-indigo-950/60 px-4 py-2 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 shrink-0 select-none z-10">
          <div className="flex items-center gap-2">
            <span>Bạn đang xem cuộc trò chuyện được chia sẻ công khai.</span>
          </div>
          <button
            onClick={() => navigate('/chats')}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs cursor-pointer transition-colors shadow-xs"
          >
            Tạo chat mới
          </button>
        </div>
      )}

      <header className="p-5 sticky top-0 z-0 h-14 flex items-center justify-end bg-transparent pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Share Button (Owner only) */}
          {chatId && !isPrivateChat && isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareClick}
              disabled={isSharing}
              title="Tạo và sao chép liên kết chia sẻ"
            >
              <Share className="w-4 h-4" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </Button>
          )}

          <Button
            variant="icon"
            size="sm"
            title="Tùy chọn khác"
          >
            <MoreVertical className="w-4 h-4 text-slate-800 dark:text-slate-200" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
        {/* 403 Forbidden Private Chat Locked View */}
        {isPrivateChat ? (
          <ChatPrivateNotice />
        ) : (
          <div className="flex-1 overflow-y-auto z-20 flex flex-col justify-between">
            {activeMessages.length === 0 ? (
              <ChatEmptyState />
            ) : (
              <div className="relative z-10 max-w-4xl w-full mx-auto space-y-3.5 pb-4">
                {/* Chat Header Timestamp Row */}
                <div className="flex items-center justify-center select-none">
                  <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                    {formatChatHeaderDate(chatCreatedAt)}
                  </span>
                </div>

                {activeMessages.map((msg) => (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    copiedMessageId={copiedMessageId}
                    onCopy={handleCopy}
                  />
                ))}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Bottom Bar: Read-only prompt for shared viewer OR active ChatInputBar for owner */}
            {chatId && !isOwner && isShared ? (
              <div className="sticky bottom-0 z-20 max-w-4xl w-full mx-auto mt-auto p-4 bg-white dark:bg-slate-950">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Bạn muốn tra cứu tình huống pháp lý tương tự?
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bắt đầu cuộc trò chuyện mới với Trợ lý AI Evidentia để nhận lập luận đa tác tử theo thời điểm.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/chats')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo cuộc trò chuyện của bạn</span>
                  </button>
                </div>
              </div>
            ) : (
              <ChatInputBar
                inputPrompt={inputPrompt}
                setInputPrompt={setInputPrompt}
                targetDate={targetDate}
                setTargetDate={setTargetDate}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                textareaRef={textareaRef}
                isAuthenticated={isAuthenticated}
                freeQuestionsRemaining={freeQuestionsRemaining}
                isLimitReached={isLimitReached}
                onOpenAuthModal={() => openAuthModal('login')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
