import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import { adminService } from '../services/adminService';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/error';
import { UserFilterToolbar } from './users/UserFilterToolbar';
import { UserTable } from './users/UserTable';
import { UserFormModal } from './users/UserFormModal';
import { ResetPasswordModal } from './users/ResetPasswordModal';
import type { AdminUser, UserRole, UserPlan } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { toasts, addToast, dismissToast } = useToast();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({
        query: searchQuery,
        role: selectedRole,
        plan: selectedPlan,
      });
      setUsers(res.users);
      setTotal(res.total);
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi tải danh sách người dùng.'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRole, selectedPlan, addToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Add User
  const handleCreateUser = async (data: {
    full_name: string;
    email: string;
    password?: string;
    role: UserRole;
    plan: UserPlan;
  }) => {
    if (!data.email || !data.password || !data.full_name) {
      addToast('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await adminService.createUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: data.role,
        plan: data.plan,
      });
      addToast('success', res.message || 'Tạo người dùng thành công.');
      setIsAddModalOpen(false);
      loadUsers();
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi tạo người dùng.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Edit User
  const handleOpenEdit = (u: AdminUser) => {
    setTargetUser(u);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (data: {
    full_name: string;
    email: string;
    role: UserRole;
    plan: UserPlan;
  }) => {
    if (!targetUser) return;

    setIsActionLoading(true);
    try {
      const res = await adminService.updateUser(targetUser.id, {
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        plan: data.plan,
      });
      addToast('success', res.message || 'Cập nhật người dùng thành công.');
      setIsEditModalOpen(false);
      loadUsers();
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi cập nhật.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Reset Password
  const handleOpenResetPass = (u: AdminUser) => {
    setTargetUser(u);
    setIsResetPassModalOpen(true);
  };

  const handleResetPassword = async (password: string) => {
    if (!targetUser || !password || password.length < 6) {
      addToast('error', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await adminService.resetUserPassword(targetUser.id, password);
      addToast('success', res.message || 'Đã đặt lại mật khẩu.');
      setIsResetPassModalOpen(false);
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi đặt lại mật khẩu.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Delete User
  const handleOpenDelete = (u: AdminUser) => {
    if (u.id === 'seed-user-huy-nguyen') {
      addToast('error', 'Không thể xóa tài khoản Quản trị viên mặc định.');
      return;
    }
    setTargetUser(u);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!targetUser) return;
    setIsActionLoading(true);
    try {
      const res = await adminService.deleteUser(targetUser.id);
      addToast('success', res.message || 'Đã xóa người dùng.');
      setIsDeleteConfirmOpen(false);
      loadUsers();
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi xóa người dùng.'));
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Người Dùng</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng <span className="font-semibold text-slate-800">{total}</span> tài khoản được đăng ký trong hệ thống.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Người Dùng</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <UserFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        onRefresh={loadUsers}
        isLoading={isLoading}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        onResetPassword={handleOpenResetPass}
        onEditUser={handleOpenEdit}
        onDeleteUser={handleOpenDelete}
      />

      {/* Add User Modal */}
      <UserFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateUser}
        isLoading={isActionLoading}
      />

      {/* Edit User Modal */}
      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateUser}
        initialUser={targetUser}
        isLoading={isActionLoading}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPassModalOpen}
        onClose={() => setIsResetPassModalOpen(false)}
        onSubmit={handleResetPassword}
        user={targetUser}
        isLoading={isActionLoading}
      />

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteUser}
        title="Xác nhận Xóa Người Dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản ${targetUser?.email}? Toàn bộ lịch sử hội thoại và dữ liệu liên quan sẽ bị xóa vĩnh viễn.`}
        confirmText="Xóa Tài Khoản"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default UsersPage;
