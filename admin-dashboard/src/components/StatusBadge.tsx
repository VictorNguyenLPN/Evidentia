import React from 'react';

interface StatusBadgeProps {
  type: 'role' | 'plan' | 'health' | 'status';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className = '' }) => {
  let label = value;
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'role') {
    switch (value) {
      case 'admin':
        label = 'Quản trị viên';
        style = 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
        break;
      case 'editor':
        label = 'Biên tập viên';
        style = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      default:
        label = 'Người dùng';
        style = 'bg-slate-100 text-slate-700 border-slate-200';
    }
  } else if (type === 'plan') {
    switch (value) {
      case 'enterprise':
        label = 'Enterprise';
        style = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
        break;
      case 'pro':
        label = 'Pro Plan';
        style = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium';
        break;
      default:
        label = 'Miễn phí';
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  } else if (type === 'health' || type === 'status') {
    switch (value) {
      case 'healthy':
      case 'in_sync':
      case 'active':
        label = 'Hoạt động tốt';
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'degraded':
      case 'count_mismatch':
      case 'warning':
        label = 'Cần chú ý';
        style = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'error':
      case 'exceeded':
      case 'not_found':
        label = 'Hết lượt / Lỗi';
        style = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'unconfigured':
        label = 'Chưa cấu hình';
        style = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
      default:
        label = value;
        style = 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
};
