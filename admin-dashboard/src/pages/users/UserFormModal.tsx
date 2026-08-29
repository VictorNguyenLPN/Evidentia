import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import type { AdminUser, UserRole, UserPlan } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    full_name: string;
    email: string;
    password?: string;
    role: UserRole;
    plan: UserPlan;
  }) => Promise<void>;
  initialUser?: AdminUser | null;
  isLoading: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUser,
  isLoading,
}) => {
  const isEdit = Boolean(initialUser);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('user');
  const [formPlan, setFormPlan] = useState<UserPlan>('free');

  useEffect(() => {
    if (isOpen) {
      if (initialUser) {
        setFormName(initialUser.full_name);
        setFormEmail(initialUser.email);
        setFormPassword('');
        setFormRole(initialUser.role);
        setFormPlan(initialUser.plan);
      } else {
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormRole('user');
        setFormPlan('free');
      }
    }
  }, [isOpen, initialUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      full_name: formName.trim(),
      email: formEmail.trim(),
      password: isEdit ? undefined : formPassword,
      role: formRole,
      plan: formPlan,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa Người Dùng' : 'Thêm Người Dùng Mới'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên *</label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Nguyễn Văn A"
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
          <input
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {!isEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu ban đầu *</label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              minLength={6}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phân quyền</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as UserRole)}
              disabled={isEdit && initialUser?.id === 'seed-user-huy-nguyen'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              <option value="user">Người dùng (User)</option>
              <option value="editor">Biên tập viên (Editor)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gói cước</label>
            <select
              value={formPlan}
              onChange={(e) => setFormPlan(e.target.value as UserPlan)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="free">Miễn phí (Free)</option>
              <option value="pro">Gói Pro</option>
              <option value="enterprise">Doanh nghiệp (Enterprise)</option>
            </select>
          </div>
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
            {isEdit ? 'Lưu Thay Đổi' : 'Tạo Người Dùng'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
