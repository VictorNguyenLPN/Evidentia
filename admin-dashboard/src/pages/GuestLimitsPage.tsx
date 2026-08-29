import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Search,
  RefreshCw,
  User as UserIcon,
  Filter,
  Sparkles,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ToastContainer } from '../components/Toast';
import { Button } from '../components/Button';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/error';
import type { UserQuotaRecord, UserPlan } from '../types';

export const GuestLimitsPage: React.FC = () => {
  const [quotas, setQuotas] = useState<UserQuotaRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [planLimits, setPlanLimits] = useState<Record<string, number>>({});
  const [defaultFreeLimit, setDefaultFreeLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Modals & Dialogs
  const [isResetAllConfirmOpen, setIsResetAllConfirmOpen] = useState<boolean>(false);
  const [resetAllPlanTarget, setResetAllPlanTarget] = useState<string>('all');
  const [targetUser, setTargetUser] = useState<UserQuotaRecord | null>(null);
  const [isResetSingleConfirmOpen, setIsResetSingleConfirmOpen] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const { toasts, addToast, dismissToast } = useToast();

  const loadUserLimits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUserLimits(searchQuery, planFilter);
      setQuotas(res.user_quotas);
      setTotal(res.total);
      if (res.plan_limits) setPlanLimits(res.plan_limits);
      if (res.default_free_limit) setDefaultFreeLimit(res.default_free_limit);
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi tải danh sách hạn mức người dùng.'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, planFilter, addToast]);

  useEffect(() => {
    loadUserLimits();
  }, [loadUserLimits]);

  // Reset Single User
  const handleOpenResetSingle = (user: UserQuotaRecord) => {
    setTargetUser(user);
    setIsResetSingleConfirmOpen(true);
  };

  const handleResetSingleUser = async () => {
    if (!targetUser) return;
    setIsActionLoading(true);
    try {
      const res = await adminService.resetUserLimit(targetUser.id);
      addToast('success', res.message || `Đã đặt lại số câu hỏi về 0 cho người dùng ${targetUser.email}.`);
      setIsResetSingleConfirmOpen(false);
      loadUserLimits();
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi đặt lại hạn mức.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reset All Users (by plan or all)
  const handleResetAllUsers = async () => {
    setIsActionLoading(true);
    try {
      const res = await adminService.resetAllUserLimits(resetAllPlanTarget);
      addToast('success', res.message || 'Đã đặt lại số câu hỏi cho người dùng thành công.');
      setIsResetAllConfirmOpen(false);
      loadUserLimits();
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi đặt lại hạn mức cho người dùng.'));
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Hạn Mức & Reset Lượt Chat</h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi số câu hỏi đã dùng của người dùng trên toàn hệ thống (Gói Free: {defaultFreeLimit} câu, Pro/Enterprise: Không giới hạn) và đặt lại hạn mức linh hoạt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setIsResetAllConfirmOpen(true)}
            icon={<RotateCcw className="w-4 h-4" />}
            className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white"
          >
            <span>Reset Lượt Toàn Bộ</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo email, họ tên..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">Tất cả gói cước</option>
              <option value="free">Gói Miễn phí (Free - {defaultFreeLimit} câu)</option>
              <option value="pro">Gói Chuyên nghiệp (Pro - Không giới hạn)</option>
              <option value="enterprise">Gói Doanh nghiệp (Enterprise)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            {quotas.length} / {total} người dùng
          </span>
          <button
            onClick={loadUserLimits}
            title="Tải lại danh sách"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4 text-center">Gói cước</th>
                <th className="py-3 px-4 text-center">Số câu đã dùng</th>
                <th className="py-3 px-4 text-center">Trạng thái hạn mức</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4">Hoạt động gần nhất</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải danh sách hạn mức người dùng...
                  </td>
                </tr>
              ) : quotas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không có người dùng nào khớp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                quotas.map((rec) => {
                  const isUnlimited = rec.questions_limit === -1 || rec.role === 'admin';
                  const isExceeded = !isUnlimited && rec.questions_used >= rec.questions_limit;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {rec.full_name?.charAt(0)?.toUpperCase() || rec.email?.charAt(0)?.toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{rec.full_name || 'Chưa đặt tên'}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{rec.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <StatusBadge type="plan" value={rec.plan} />
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        <span className={isExceeded ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                          {rec.questions_used}
                        </span>
                        <span className="text-slate-400">
                          {' '}
                          / {isUnlimited ? '∞' : rec.questions_limit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isUnlimited ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <InfinityIcon className="w-3 h-3" />
                            Không giới hạn
                          </span>
                        ) : isExceeded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Đã hết {rec.questions_used}/{rec.questions_limit} câu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Sparkles className="w-3 h-3" />
                            Còn {rec.questions_remaining} câu
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {rec.created_at ? new Date(rec.created_at).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {rec.updated_at ? new Date(rec.updated_at).toLocaleString('vi-VN') : '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenResetSingle(rec)}
                            disabled={isActionLoading || rec.questions_used === 0}
                            icon={<RotateCcw className="w-3 h-3" />}
                            title="Đặt lại số câu hỏi đã dùng về 0"
                          >
                            <span>Reset lượt ({rec.questions_used})</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DIALOG RESET SINGLE USER --- */}
      <ConfirmDialog
        isOpen={isResetSingleConfirmOpen}
        onClose={() => setIsResetSingleConfirmOpen(false)}
        onConfirm={handleResetSingleUser}
        title="Xác nhận Reset Lượt Câu Hỏi"
        message={`Bạn có chắc muốn đặt lại số câu hỏi đã dùng về 0 cho người dùng ${targetUser?.full_name || targetUser?.email} (${targetUser?.email})?`}
        confirmText="Reset về 0 câu"
        variant="warning"
        isLoading={isActionLoading}
      />

      {/* --- DIALOG RESET ALL USERS --- */}
      <ConfirmDialog
        isOpen={isResetAllConfirmOpen}
        onClose={() => setIsResetAllConfirmOpen(false)}
        onConfirm={handleResetAllUsers}
        title="Xác nhận Reset Lượt Toàn Hệ Thống"
        message={
          <div className="space-y-3">
            <p>
              Bạn đang chuẩn bị đặt lại số câu hỏi đã dùng về 0. Chọn nhóm đối tượng người dùng cần reset:
            </p>
            <div className="mt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nhóm người dùng áp dụng:</label>
              <select
                value={resetAllPlanTarget}
                onChange={(e) => setResetAllPlanTarget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white"
              >
                <option value="all">Tất cả người dùng (Mọi gói cước)</option>
                <option value="free">Chỉ người dùng gói Free ({defaultFreeLimit} câu)</option>
                <option value="pro">Chỉ người dùng gói Pro</option>
                <option value="enterprise">Chỉ người dùng gói Enterprise</option>
              </select>
            </div>
          </div>
        }
        confirmText="Xác nhận Reset"
        variant="warning"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default GuestLimitsPage;
