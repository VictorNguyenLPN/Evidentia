import React from 'react';
import { useChat } from '../../contexts';

export const GeneralTab: React.FC = () => {
  const { isDevMode, setIsDevMode, isDarkMode, setIsDarkMode } = useChat();

  return (
    <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
      {/* Developer Mode */}
      <div className="py-2 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Chế độ Nhà phát triển
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Hiển thị chi tiết số lượng Token dưới mỗi câu trả lời.
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isDevMode}
          onClick={() => setIsDevMode(!isDevMode)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isDevMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isDevMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <div className="py-2 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Chuyển sang theme tối
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Giao diện nền tối giúp dịu mắt khi làm việc ban đêm.
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isDarkMode}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isDarkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isDarkMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
