import React, { useState } from 'react';
import {
    Share,
    X,
    Copy,
    Check,
    Globe,
    Lock,
    ShieldCheck,
    ExternalLink,
    Loader2
} from 'lucide-react';
import Button from './Button';

export interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string | null;
    chatTitle: string;
    isShared: boolean;
    onShareChange: (newShared: boolean) => Promise<void>;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    chatId,
    chatTitle,
    isShared,
    onShareChange,
}) => {
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setCopied(false);
        setError(null);
        onClose();
    };

    if (!isOpen || !chatId) return null;

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/chats/${chatId}`
        : `/chats/${chatId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            setError('Không thể tự động sao chép vào bộ nhớ tạm. Vui lòng sao chép thủ công.');
        }
    };

    const handleToggleShare = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await onShareChange(!isShared);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái chia sẻ.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/60">
                            <Share className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                Chia sẻ cuộc trò chuyện
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Quản lý quyền truy cập và liên kết công khai
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Đóng"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4">
                    {error && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Chat Target Title Card */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Chủ đề cuộc trò chuyện
                        </span>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {chatTitle || 'Cuộc trò chuyện chưa có tiêu đề'}
                        </p>
                    </div>

                    {/* Security Toggle Section */}
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Chia sẻ công khai qua liên kết
                                    </span>
                                    {isShared ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-full border border-emerald-200 dark:border-emerald-800">
                                            <Globe className="w-3 h-3" />
                                            Đã bật
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                            <Lock className="w-3 h-3" />
                                            Riêng tư
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {isShared
                                        ? 'Bất kỳ ai có đường liên kết này đều có thể đọc toàn bộ cuộc hội thoại.'
                                        : 'Chỉ có bạn mới có quyền xem nội dung này. Người khác mở link sẽ bị khóa.'}
                                </p>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={handleToggleShare}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isShared ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                role="switch"
                                aria-checked={isShared}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isShared ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Link Display when Shared */}
                        {isShared ? (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    Liên kết chia sẻ
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            readOnly
                                            value={shareUrl}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-mono focus:outline-none select-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs shrink-0 ${copied
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Đã sao chép</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Sao chép</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                {copied && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-0.5 animate-in fade-in duration-150">
                                        <Check className="w-3 h-3" />
                                        Đã sao chép liên kết vào bộ nhớ tạm!
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={handleToggleShare}
                                    disabled={isLoading}
                                    className="w-full py-2 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800/60"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Globe className="w-3.5 h-3.5" />
                                    )}
                                    <span>Bật chia sẻ & Lấy liên kết công khai</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Security Notice */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <span>
                            Chế độ chia sẻ cho phép người có liên kết đọc câu hỏi, câu trả lời, mốc thời gian và trích dẫn luật liên quan. Bạn có thể tắt chia sẻ bất kỳ lúc nào để khóa quyền xem.
                        </span>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {isShared ? (
                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                        >
                            <span>Xem trang chia sẻ</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    ) : (
                        <span className="text-xs text-slate-400">Đang ở chế độ riêng tư</span>
                    )}

                    <Button variant="ghost" size="sm" onClick={onClose} className="px-4">
                        Hoàn tất
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
