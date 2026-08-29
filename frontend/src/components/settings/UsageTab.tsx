import React from 'react';
import { useAuth } from '../../contexts';

export const UsageTab: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  return (
    <div className="divide-y divide-slate-200/80 dark:divide-slate-800 space-y-3 pt-2">
      <div className="py-2 space-y-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Thông tin Gói cước & Hạn mức
        </h4>
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-2 mt-2">
          {isAuthenticated && user ? (
            <>
              <p>
                Tài khoản của bạn đang thuộc gói{' '}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                  {user.plan || 'Free'}
                </span>
                .
              </p>
              {user.plan === 'free' && user.role !== 'admin' ? (
                <p>
                  Số câu hỏi đã sử dụng:{' '}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {user.questions_used || 0} / 5 câu
                  </span>{' '}
                  (Còn lại: {Math.max(0, 5 - (user.questions_used || 0))} câu).
                </p>
              ) : (
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Tài khoản có quyền tra cứu không giới hạn.
                </p>
              )}
            </>
          ) : (
            <p>
              Vui lòng{' '}
              <button
                onClick={() => openAuthModal('login')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold underline cursor-pointer"
              >
                đăng nhập
              </button>{' '}
              để xem thông tin gói cước. Tài khoản mới sẽ nhận 5 câu hỏi miễn phí.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
