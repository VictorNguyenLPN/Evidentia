import React, { } from 'react';
import {
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative h-screen w-full bg-[#05070d] text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Decorative Lighting */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Ambient Gradient Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-600/20 via-blue-500/15 to-violet-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[350px] bg-gradient-to-tr from-cyan-600/10 to-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-[400px] h-[300px] bg-gradient-to-tl from-amber-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold tracking-tight text-white">Evidentia</span>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">Hệ thống đa tác tử pháp lý thông minh</p>
        </div>

        {/*Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/chats"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Trải nghiệm ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Single Welcome / Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-6xl mx-auto px-6 py-6 w-full text-center">

        {/* Big Impactful Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-5xl leading-[1.1]">
          <span className="text-gradient-primary">Tra cứu pháp luật</span>{' '}
          <br />
          <span className="text-gradient-accent">Đúng Luật, Đúng Thời Điểm</span>
        </h1>

        {/* Subtitle Description */}
        <p className="mt-5 text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Hệ thống đa tác tử giúp tra cứu và phân tích pháp luật Việt Nam theo từng thời điểm.
          Từ truy xuất văn bản, xác định hiệu lực và đối chiếu các phiên bản đến phân tích
          thay đổi và tổng hợp thông tin.
        </p>

      </main>

      {/* Bottom Minimal Footer Strip (within the single-section page layout) */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60">
        <div>
          <span>© 2026 Evidentia - Hệ thống đa tác tử pháp lý thông minh</span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium">
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Tài liệu API</span>
          <span>•</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Bảo mật & Quyền riêng tư</span>
          <span>•</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Về chúng tôi</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
