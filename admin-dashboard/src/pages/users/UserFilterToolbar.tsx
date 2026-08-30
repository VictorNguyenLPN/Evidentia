import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface UserFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedRole: string;
  onRoleChange: (val: string) => void;
  selectedPlan: string;
  onPlanChange: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const UserFilterToolbar: React.FC<UserFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedPlan,
  onPlanChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên, email hoặc ID..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả quyền hạn</option>
          <option value="admin">Quản trị viên (Admin)</option>
          <option value="editor">Biên tập viên (Editor)</option>
          <option value="user">Người dùng (User)</option>
        </select>

        {/* Plan Filter */}
        <select
          value={selectedPlan}
          onChange={(e) => onPlanChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả gói cước</option>
          <option value="free">Miễn phí (Free)</option>
          <option value="pro">Gói Pro</option>
          <option value="enterprise">Gói Doanh nghiệp</option>
        </select>

        <button
          onClick={onRefresh}
          title="Tải lại danh sách"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
