import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Database,
  RotateCcw,
  MessageSquareText,
  LogOut,
  Sparkle,
  PanelLeft,
  ExternalLink,
} from 'lucide-react';
import Button from './Button';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export interface SidebarProps {
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen: controlledIsSidebarOpen,
  setIsSidebarOpen: controlledSetIsSidebarOpen,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(true);
  const isSidebarOpen = controlledIsSidebarOpen !== undefined ? controlledIsSidebarOpen : internalIsSidebarOpen;
  const setIsSidebarOpen = controlledSetIsSidebarOpen || setInternalIsSidebarOpen;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
    { to: '/users', label: 'Người dùng', icon: Users },
    { to: '/vector-db', label: 'Vector DB', icon: Database },
    { to: '/guest-limits', label: 'Hạn mức & Reset Lượt', icon: RotateCcw },
    { to: '/chats', label: 'Nhật ký Hội thoại', icon: MessageSquareText },
  ];

  return (
    <aside
      className={`sidebar ${
        isSidebarOpen ? 'w-64 sm:w-72' : 'w-14'
      } relative z-20 shrink-0 h-full border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none transition-[width] duration-300 ease-in-out overflow-hidden bg-white dark:bg-slate-900`}
    >
      {/* Scroll container */}
      <div
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col"
      >
        {/* Header Row */}
        <div
          className={`header space-y-1.5 px-2.5 pt-2.5 sticky top-0 z-10 bg-white dark:bg-slate-900 shrink-0 transition-colors duration-150 ${
            isScrolled ? 'border-b border-slate-200 dark:border-slate-800' : 'border-b border-transparent'
          }`}
        >
          {/* Logo & Toggle */}
          <div className={`flex items-center justify-between ${isSidebarOpen ? 'pl-2.5' : 'px-2.5'}`}>
            {isSidebarOpen ? (
              <>
                <Link to="/" className="logo flex items-center min-w-0 gap-2">
                  <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    Evidentia. <span className='text-md font-bold tracking-tight text-black whitespace-nowrap'>admin</span>
                  </span>
                </Link>

                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => setIsSidebarOpen(false)}
                    title="Thu nhỏ sidebar"
                  >
                    <PanelLeft className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-center w-full">
                <Button
                  variant="icon"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Mở rộng sidebar"
                  className="group"
                >
                  <Sparkle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:hidden" />
                  <PanelLeft className="w-4 h-4 text-slate-800 dark:text-slate-200 hidden group-hover:block" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-2.5 pb-4 space-y-4 pt-1.5">
          {/* Section: Hệ thống & Quản trị */}
          <div className="space-y-1">

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    `w-full h-9 flex items-center gap-1 text-sm rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`transition-opacity duration-200 whitespace-nowrap ${
                      isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Footer */}
      <div className="h-17 p-2.5 flex items-center relative shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {isProfileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsProfileMenuOpen(false)}
            />
            <div
              className={
                isSidebarOpen
                  ? 'absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-0.5 z-50 select-none'
                  : 'fixed bottom-16 left-3 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-0.5 z-50 select-none'
              }
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.full_name || 'Quản trị viên'}
                  </p>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-1 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {user?.email || 'admin@evidentia.vn'}
                </p>
              </div>

              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <ExternalLink className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>Mở Evidentia User App</span>
              </a>

              <div className="h-px bg-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-left cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </>
        )}

        {/* Profile Trigger Button */}
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="w-full h-full flex items-center gap-2.5 px-1 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer transition-colors group"
          title={`Tài khoản: ${user?.full_name || user?.email || 'Quản trị viên'}`}
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div
            className={`min-w-0 transition-opacity duration-200 ${
              isSidebarOpen ? 'opacity-100' : 'hidden'
            }`}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight whitespace-nowrap">
              {user?.full_name || 'Quản trị viên'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 whitespace-nowrap">
              {user?.email || 'admin@evidentia.vn'}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
