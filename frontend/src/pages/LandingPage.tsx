import React from 'react';
import {
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative h-screen w-full bg-slate-50 text-slate-800 flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex flex-col items-start">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              <span className="text-indigo-600">Evidentia.</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">Hệ thống trợ lý pháp lý đa tác tử thông minh</p>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/laws"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Thư viện văn bản</span>
          </Link>
          <Link
            to="/chats"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20"
          >
            <span>Bắt đầu hỏi đáp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Single Welcome / Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-6xl mx-auto px-6 py-6 w-full text-center  mb-[35px]">

        {/* Big Impactful Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-5xl leading-[1.15]">
          <span className="bg-linear-to-r from-slate-950 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Tra cứu pháp luật
          </span>{' '}
          <br />
          <span className="bg-linear-to-r from-indigo-600 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
            Đúng Luật, Đúng Thời Điểm
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="mt-5 text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed font-normal">
          Hệ thống đa tác tử giúp tra cứu và phân tích pháp luật Việt Nam theo từng thời điểm.
          Từ truy xuất văn bản, xác định hiệu lực và đối chiếu các phiên bản đến phân tích
          thay đổi và tổng hợp thông tin.
        </p>

        {/* Center Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/laws"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-medium"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Thư viện văn bản</span>
          </Link>
          <Link
            to="/chats"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20"
          >
            <span>Bắt đầu hỏi đáp</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      </main>

      {/* Bottom Minimal Footer Strip (within the single-section page layout) */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80">
        <div>
          <span>© 2026 Evidentia. - Hệ thống trợ lý pháp lý đa tác tử thông minh</span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Tài liệu API</span>
          <span>•</span>
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Bảo mật & Quyền riêng tư</span>
          <span>•</span>
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Về chúng tôi</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
