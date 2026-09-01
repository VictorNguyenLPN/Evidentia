import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full text-slate-800 flex flex-col justify-between overflow-x-clip relative selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="w-full text-sm font-medium py-4 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-10 text-slate-600">
            <Link to="/" className="text-indigo-600 text-xl font-bold">Evidentia</Link>
            <Link to="/about" className="hover:text-indigo-600 transition-colors">Về chúng tôi</Link>
            <Link to="/architecture" className="hover:text-indigo-600 transition-colors">Kiến trúc</Link>
            <Link to="/docs" className="hover:text-indigo-600 transition-colors">Tài liệu</Link>
            <Link to="/laws" className="hover:text-indigo-600 transition-colors">Thư viện luật</Link>
          </nav>
          <nav>
            <Link
              to="/chats"
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 cursor-pointer"
            >
              Trải nghiệm ngay
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto px-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[350px] bg-linear-to-b from-indigo-200/50 via-blue-100/30 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        <span className="text-7xl sm:text-8xl font-extrabold tracking-tight bg-linear-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
          404
        </span>

        <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Không tìm thấy trang yêu cầu
        </h1>

        <p className="mt-3 text-slate-600 text-sm sm:text-base md:text-lg max-w-md leading-relaxed font-normal">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang đường dẫn khác.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang trước</span>
          </button>
          <Link
            to="/laws"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Thư viện văn bản</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="text-slate-700">Evidentia © 2026 - Hệ thống trợ lý pháp lý đa tác tử thông minh</span>
          </div>
          <div className="flex items-center gap-5 font-medium text-slate-600">
            <Link to="/about" className="hover:text-indigo-600 transition-colors">Về chúng tôi</Link>
            <Link to="/architecture" className="hover:text-indigo-600 transition-colors">Kiến trúc</Link>
            <Link to="/docs" className="hover:text-slate-900 transition-colors cursor-pointer">Tài liệu</Link>
            <Link to="/laws" className="hover:text-slate-900 transition-colors cursor-pointer">Thư viện luật</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;
