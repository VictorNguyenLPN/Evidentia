import React, { useState } from 'react';
import {
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts';
import { getErrorMessage } from '../../utils/error';

interface AccountTabProps {
  onCloseModal: () => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({ onCloseModal }) => {
  const { user, isAuthenticated, updateProfile, changePassword, openAuthModal } = useAuth();

  const [editName, setEditName] = useState(() => user?.full_name || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState<string | null>(null);
  const [pwdErrorMsg, setPwdErrorMsg] = useState<string | null>(null);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    if (!editName.trim()) {
      setProfileErrorMsg('Họ và tên không được để trống.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateProfile({ full_name: editName.trim() });
      setProfileSuccessMsg('Cập nhật họ tên thành công.');
    } catch (err: unknown) {
      setProfileErrorMsg(getErrorMessage(err, 'Lỗi cập nhật họ tên.'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccessMsg(null);
    setPwdErrorMsg(null);

    if (!currentPwd || !newPwd) {
      setPwdErrorMsg('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.');
      return;
    }
    if (newPwd.length < 6) {
      setPwdErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPwd !== confirmNewPwd) {
      setPwdErrorMsg('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setIsChangingPwd(true);
    try {
      await changePassword({ current_password: currentPwd, new_password: newPwd });
      setPwdSuccessMsg('Đổi mật khẩu thành công.');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmNewPwd('');
    } catch (err: unknown) {
      setPwdErrorMsg(getErrorMessage(err, 'Đổi mật khẩu thất bại.'));
    } finally {
      setIsChangingPwd(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
          <UserIcon className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Bạn chưa đăng nhập
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Đăng nhập hoặc đăng ký tài khoản để đồng bộ hóa lịch sử chat, mở khóa các tính năng nâng cao và quản lý hồ sơ của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onCloseModal();
              openAuthModal('login');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer transition-all"
          >
            Đăng nhập ngay
          </button>
          <button
            type="button"
            onClick={() => {
              onCloseModal();
              openAuthModal('register');
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-all"
          >
            Đăng ký
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-3">
      {/* Profile Card Banner */}
      <div className="py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
            {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{user.full_name}</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-full">
                {user.plan === 'pro' ? 'Pro' : 'Miễn phí'}
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Name Form */}
      <form onSubmit={handleUpdateName} className="space-y-3">
        <h5 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">
          Thông tin cá nhân
        </h5>
        {profileSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}
        {profileErrorMsg && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileErrorMsg}</span>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">
            Họ và tên
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
            >
              {isUpdatingProfile ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="space-y-3 pt-6">
        <h5 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">
          Đổi mật khẩu
        </h5>
        {pwdSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pwdSuccessMsg}</span>
          </div>
        )}
        {pwdErrorMsg && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pwdErrorMsg}</span>
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmNewPwd}
                onChange={(e) => setConfirmNewPwd(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isChangingPwd}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {isChangingPwd ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
