import React from 'react';
import {
  Copy,
  Check,
  Ellipsis,
  RefreshCw,
  FaceSlightlySmilingPlus,
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import Button from '../../components/Button';
import ReasoningProcess from '../../components/ReasoningProcess';
import type { Message } from '../../types';

interface ChatMessageItemProps {
  message: Message;
  copiedMessageId: string | null;
  onCopy: (text?: string, messageId?: string, e?: React.MouseEvent) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  copiedMessageId,
  onCopy,
}) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`w-full flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      {isUser ? (
        <div className="max-w-xl text-slate-900 dark:text-white">
          <div className="flex items-center justify-end gap-2 mb-1.5 text-[11px] text-gray-600 dark:text-gray-400">
            {message.targetDate && <span>Mốc: {message.targetDate}</span>}
          </div>
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-5 py-3 rounded-2xl">
            {message.text}
          </p>
        </div>
      ) : (
        <div className="max-w-4xl py-4 space-y-4">
          {/* Reasoning Process */}
          {(message.analysis ||
            (message.steps && message.steps.length > 0) ||
            message.token_usage ||
            message.isStreaming) && (
            <ReasoningProcess
              analysis={message.analysis}
              steps={message.steps}
              tokenUsage={message.token_usage}
              citationsCount={message.citations?.length || 0}
              isStreaming={message.isStreaming}
              duration={message.duration}
            />
          )}

          {/* Answer Body */}
          <div className="text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100">
            {message.text && (
              <div>
                <MarkdownRenderer content={message.text} />
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 dark:bg-indigo-400 animate-pulse align-middle" />
                )}
              </div>
            )}
          </div>

          {!message.isStreaming && message.text && (
            <div className="flex items-center gap-1">
              <Button
                variant="icon"
                size="xs"
                onClick={(e) => onCopy(message.text, message.id, e)}
                title="Sao chép phản hồi"
              >
                {copiedMessageId === message.id ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />
                )}
              </Button>

              <Button
                variant="icon"
                size="xs"
                title="Đánh giá câu trả lời"
              >
                <FaceSlightlySmilingPlus className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />
              </Button>

              <Button
                variant="icon"
                size="xs"
                title="Thử lại"
              >
                <RefreshCw className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />
              </Button>

              <Button
                variant="icon"
                size="xs"
                title="Tùy chọn khác"
              >
                <Ellipsis className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
