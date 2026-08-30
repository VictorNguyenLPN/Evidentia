import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Settings,
  Info,
  BarChart2,
  User as UserIcon,
} from 'lucide-react';
import Button from './Button';
import { AccountTab } from './settings/AccountTab';
import { GeneralTab } from './settings/GeneralTab';
import { UsageTab } from './settings/UsageTab';
import { DataTab } from './settings/DataTab';
import { AboutTab } from './settings/AboutTab';
import type { ChatSession } from '../types';

export type SettingsSection = 'account' | 'general' | 'usage' | 'data' | 'about';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  onClearAllChats: () => Promise<boolean | void>;
  activeChatId?: string | null;
  initialSection?: SettingsSection;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  chats,
  onClearAllChats,
  initialSection = 'account',
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-148 max-h-[90vh] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Left Sidebar navigation */}
        <div className="w-full md:w-56 bg-slate-50/90 dark:bg-slate-950/90 border-r border-slate-200/80 dark:border-slate-800 p-3 flex flex-col justify-between shrink-0 select-none">
          <div className="space-y-1">
            <div className="px-3 py-2.5 mb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Cài đặt & Tùy chọn</span>
              </h2>
            </div>

            <nav className="space-y-1">
              <Button
                type="button"
                variant="sidebar"
                active={activeSection === 'account'}
                onClick={() => setActiveSection('account')}
                icon={<UserIcon className="w-4 h-4 shrink-0" />}
              >
                <span>Tài khoản</span>
              </Button>

              <Button
                type="button"
                variant="sidebar"
                active={activeSection === 'general'}
                onClick={() => setActiveSection('general')}
                icon={<Settings className="w-4 h-4 shrink-0" />}
              >
                <span>Chung</span>
              </Button>

              <Button
                type="button"
                variant="sidebar"
                active={activeSection === 'usage'}
                onClick={() => setActiveSection('usage')}
                icon={<BarChart2 className="w-4 h-4 shrink-0" />}
              >
                <span>Hạn mức</span>
              </Button>

              <Button
                type="button"
                variant="sidebar"
                active={activeSection === 'data'}
                onClick={() => setActiveSection('data')}
                icon={<Database className="w-4 h-4 shrink-0" />}
              >
                <span>Dữ liệu</span>
              </Button>

              <Button
                type="button"
                variant="sidebar"
                active={activeSection === 'about'}
                onClick={() => setActiveSection('about')}
                icon={<Info className="w-4 h-4 shrink-0" />}
              >
                <span>Giới thiệu</span>
              </Button>
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="px-6 flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between shrink-0 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeSection === 'account' && 'Hồ sơ & Tài khoản'}
                {activeSection === 'general' && 'Cài đặt chung'}
                {activeSection === 'usage' && 'Thống kê Token & Hạn mức'}
                {activeSection === 'data' && 'Quản lý dữ liệu'}
                {activeSection === 'about' && 'Thông tin ứng dụng'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeSection === 'account' && 'Quản lý thông tin tài khoản cá nhân và bảo mật'}
                {activeSection === 'general' && 'Tùy chỉnh giao diện hiển thị và cấu hình hệ thống'}
                {activeSection === 'usage' && 'Theo dõi dung lượng Token tiêu thụ theo tuần và tháng'}
                {activeSection === 'data' && 'Quản lý dữ liệu lưu trữ, lịch sử trò chuyện và đồng bộ hóa'}
                {activeSection === 'about' && 'Hệ thống Tra cứu & Phân tích Pháp luật Thông minh'}
              </p>
            </div>
            <Button
              type="button"
              variant="icon"
              size="xs"
              onClick={onClose}
              title="Đóng (ESC)"
              icon={<X className="w-5 h-5" />}
            />
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pb-6">
            {activeSection === 'account' && <AccountTab key={activeSection} onCloseModal={onClose} />}
            {activeSection === 'general' && <GeneralTab />}
            {activeSection === 'usage' && <UsageTab />}
            {activeSection === 'data' && <DataTab chats={chats} onClearAllChats={onClearAllChats} />}
            {activeSection === 'about' && <AboutTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
