import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChatPrivateNotice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
        Cuộc trò chuyện này đang ở chế độ riêng tư
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        Chủ sở hữu cuộc trò chuyện chưa bật tính năng chia sẻ công khai qua liên kết. Bạn cần chủ sở hữu cấp quyền hoặc chia sẻ link để xem nội dung này.
      </p>
      <button
        onClick={() => navigate('/chats')}
        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        <span>Bắt đầu cuộc trò chuyện mới</span>
      </button>
    </div>
  );
};
