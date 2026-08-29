import React from 'react';
import { RefreshCw, KeyRound, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import type { AdminUser } from '../../types';

interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  onResetPassword: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onResetPassword,
  onEditUser,
  onDeleteUser,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Tài khoản</th>
              <th className="py-3 px-4">Phân quyền</th>
              <th className="py-3 px-4">Gói dịch vụ</th>
              <th className="py-3 px-4 text-center">Số chat</th>
              <th className="py-3 px-4">Ngày tạo</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                  Đang tải danh sách người dùng...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Không tìm thấy người dùng nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.full_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge type="role" value={u.role} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge type="plan" value={u.plan} />
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                    {u.chats_count || 0}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onResetPassword(u)}
                        title="Đặt lại mật khẩu"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditUser(u)}
                        title="Chỉnh sửa thông tin"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteUser(u)}
                        title={u.id === 'seed-user-huy-nguyen' ? 'Không thể xóa Admin mặc định' : 'Xóa tài khoản'}
                        disabled={u.id === 'seed-user-huy-nguyen'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          u.id === 'seed-user-huy-nguyen'
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
