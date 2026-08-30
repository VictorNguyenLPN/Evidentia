import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import type { AdminUser } from '../../types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  user: AdminUser | null;
  isLoading: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}) => {
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newPassword);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đặt lại mật khẩu" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-600">
          Đặt mật khẩu mới cho tài khoản: <span className="font-semibold text-slate-900">{user?.email}</span>
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới *</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            required
            minLength={6}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Cập nhật mật khẩu
          </button>
        </div>
      </form>
    </Modal>
  );
};
