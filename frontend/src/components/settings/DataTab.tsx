import React, { useState } from 'react';
import Button from '../Button';
import type { ChatSession } from '../../types';

interface DataTabProps {
  chats: ChatSession[];
  onClearAllChats: () => Promise<boolean | void>;
}

export const DataTab: React.FC<DataTabProps> = ({ chats, onClearAllChats }) => {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await onClearAllChats();
      setIsConfirmingClear(false);
    } catch (err) {
      console.error('Error clearing chat history:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
        <div className="py-2 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Lịch sử trò chuyện ({chats.length} cuộc trò chuyện)
            </h4>
          </div>

          {chats.length > 0 && (
            <button
              disabled={chats.length === 0}
              onClick={() => setIsConfirmingClear(true)}
              className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-left cursor-pointer transition-colors"
            >
              <span>Xóa tất cả</span>
            </button>
          )}
        </div>

        <div className="py-2 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Xuất dữ liệu
            </h4>
          </div>

          {chats.length > 0 && (
            <button className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors">
              <span>Xuất</span>
            </button>
          )}
        </div>

        <div className="py-2 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Lưu trữ tất cả cuộc trò chuyện
            </h4>
          </div>

          {chats.length > 0 && (
            <button className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors">
              <span>Lưu trữ</span>
            </button>
          )}
        </div>

        <div className="py-2 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Gỡ ghim tất cả cuộc trò chuyện
            </h4>
          </div>

          {chats.length > 0 && (
            <button className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors">
              <span>Gỡ ghim</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Clearing History */}
      {isConfirmingClear && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => {
              if (!isClearing) setIsConfirmingClear(false);
            }}
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 select-none">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Xác nhận xóa tất cả lịch sử trò chuyện?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Hành động này sẽ xóa vĩnh viễn toàn bộ {chats.length} cuộc hội thoại đã lưu. Dữ liệu sau khi xóa sẽ không thể khôi phục.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isClearing}
                onClick={() => setIsConfirmingClear(false)}
              >
                <span>Hủy bỏ</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isClearing}
                onClick={handleConfirmClear}
              >
                <span>{isClearing ? 'Đang xóa...' : 'Xóa tất cả'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
