import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Trash2,
  User,
  Pin,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/error';
import type { AdminChatSummary } from '../types';
import Button from '../components/Button';

export const ChatsLogPage: React.FC = () => {
  const [chats, setChats] = useState<AdminChatSummary[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [targetChat, setTargetChat] = useState<AdminChatSummary | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { toasts, addToast, dismissToast } = useToast();

  const loadChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getChats({
        query: searchQuery,
        limit: 100,
      });
      setChats(res.chats);
      setTotal(res.total);
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi tải nhật ký hội thoại.'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, addToast]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleOpenDelete = (chat: AdminChatSummary) => {
    setTargetChat(chat);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteChat = async () => {
    if (!targetChat) return;
    setIsActionLoading(true);
    try {
      const res = await adminService.deleteChat(targetChat.id);
      addToast('success', res.message || 'Đã xóa phiên chat.');
      setIsDeleteConfirmOpen(false);
      loadChats();
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi xóa phiên chat.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nhật ký hội thoại toàn hệ thống</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng <span className="font-semibold text-slate-800">{total}</span> phiên hỏi đáp pháp lý từ người dùng và khách.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, ID hoặc câu hỏi..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            {chats.length} / {total} phiên chat
          </span>
          <Button
            variant="icon"
            size="sm"
            onClick={loadChats}
            title="Tải lại danh sách"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Tiêu đề</th>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4 text-center">Số lượng</th>
                <th className="py-3 px-4">Chủ đề</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải nhật ký hội thoại...
                  </td>
                </tr>
              ) : chats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Chưa có phiên hội thoại nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                chats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {chat.is_pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        <span className="font-bold text-slate-900 truncate block">{chat.title}</span>
                      </div>
                      {chat.latest_preview ? (
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                          "{chat.latest_preview}"
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">ID: {chat.id}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800 text-[11px]">{chat.user_name || 'Khách vãng lai'}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{chat.user_email || 'Chưa đăng nhập'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">
                      {chat.messages_count}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {chat.tag || 'Pháp luật'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {chat.updated_at ? new Date(chat.updated_at).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="icon"
                        size="xs"
                        onClick={() => handleOpenDelete(chat)}
                        title="Xóa phiên chat"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CONFIRM DIALOG XÓA CHAT --- */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteChat}
        title="Xác nhận xóa phiên hội thoại"
        message={`Bạn có chắc muốn xóa phiên hội thoại "${targetChat?.title}" (ID: ${targetChat?.id})? Dữ liệu không thể phục hồi.`}
        confirmText="Xóa phiên hội thoại"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default ChatsLogPage;
