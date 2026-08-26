import React, { useState } from 'react';
import { Calendar, Paperclip, ArrowUp } from 'lucide-react';
import Button from './Button';

export interface ChatInputBarProps {
    inputPrompt: string;
    setInputPrompt: (val: string) => void;
    targetDate: string;
    setTargetDate: (val: string) => void;
    isLoading: boolean;
    onSendMessage: () => void;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
    inputPrompt,
    setInputPrompt,
    targetDate,
    setTargetDate,
    isLoading,
    onSendMessage,
    textareaRef,
}) => {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className="sticky bottom-0 z-20 max-w-4xl w-full mx-auto mt-auto pt-2 bg-white dark:bg-slate-950 rounded-lg">
            {/* Date Picker Popover */}
            {isDatePickerOpen && (
                <div className="mb-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Chọn mốc thời gian tra cứu:</span>
                    <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-indigo-600"
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

            <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus-within:ring-3 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-950 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 p-3">
                <textarea
                    ref={textareaRef}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Mô tả câu hỏi hoặc yêu cầu tra cứu pháp luật theo thời điểm..."
                    className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base px-1.5 py-1 focus:outline-none resize-none font-sans min-h-10 max-h-56 overflow-y-auto"
                />

                <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<Paperclip className="w-4 h-4" />}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 font-medium"
                        >
                            <span className="hidden sm:inline">Tài liệu</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<Calendar className="w-4 h-4" />}
                            onClick={() => setIsDatePickerOpen((prev) => !prev)}
                            className={`px-3 py-1.5 font-medium ${
                                targetDate
                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
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
                        onClick={onSendMessage}
                        disabled={!inputPrompt.trim() || isLoading}
                        size="xs"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 py-2">
                Evidentia có thể mắc lỗi. Vui lòng kiểm tra các văn bản pháp luật chính thức.
            </p>
        </div>
    );
};

export default ChatInputBar;
