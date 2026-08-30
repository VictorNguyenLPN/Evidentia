import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Bot,
  Brain,
  GitCompare,
  Clock,
  ShieldCheck,
  Search,
  Layers,
  CheckCircle2,
  Cpu,
  ChevronRight,
  Zap,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEMO_IMAGES = {
  primary: 'images/landing-chat-demo.png',
  secondary: 'images/landing-laws-demo.png',
};

const SecondaryMockupFallback: React.FC = () => (
  <div className="w-full h-full bg-slate-950/95 text-slate-200 p-4 flex flex-col justify-between select-none shadow-2xl">
    {/* Mini header */}
    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
      <div className="flex items-center gap-1.5">
        <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[11px] font-semibold text-slate-200">Đối chiếu phiên bản văn bản</span>
      </div>
      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
        Đã đối soát
      </span>
    </div>

    {/* Side-by-side comparison mockup */}
    <div className="space-y-2.5 my-2 text-left">
      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px]">
        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
          <span className="text-rose-400 font-medium">Luật Đất đai 2013 (Cũ)</span>
          <span>Hết hiệu lực</span>
        </div>
        <p className="text-slate-400 text-[10px] line-through decoration-rose-500/70 leading-relaxed">
          Thời hạn cấp GCN không quá 30 ngày kể từ ngày nhận đủ hồ sơ hợp lệ...
        </p>
      </div>

      <div className="bg-indigo-950/40 rounded-lg p-2.5 border border-indigo-500/40 text-[11px]">
        <div className="flex items-center justify-between text-slate-300 text-[10px] mb-1">
          <span className="text-emerald-400 font-medium">Luật Đất đai 2024 (Mới)</span>
          <span className="text-indigo-300 font-semibold">Hiệu lực từ 01/08/2024</span>
        </div>
        <p className="text-slate-200 text-[10px] leading-relaxed">
          Rút ngắn thời gian giải quyết, phân cấp thẩm quyền cấp GCN cho UBND cấp huyện và văn phòng đăng ký...
        </p>
      </div>
    </div>

    {/* Timeline badge */}
    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-indigo-400" /> Cập nhật hiệu lực tự động
      </span>
      <span className="text-indigo-400 font-medium cursor-pointer hover:underline">Xem diff chi tiết →</span>
    </div>
  </div>
);

export const LandingPage: React.FC = () => {
  const [primaryImgError, setPrimaryImgError] = useState(false);
  const [secondaryImgError, setSecondaryImgError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col font-sans overflow-x-clip relative selection:bg-indigo-600 selection:text-white">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-linear-to-b from-indigo-200/40 via-blue-100/20 to-transparent blur-3xl" />
        <div className="absolute top-[800px] -right-40 w-[600px] h-[600px] bg-indigo-100/30 blur-3xl rounded-full" />
        <div className="absolute top-[1400px] -left-40 w-[600px] h-[600px] bg-blue-100/30 blur-3xl rounded-full" />
      </div>

      {/* Top Sticky Navigation Bar - Chỉ thêm border và shadow khi scroll */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-4'
            : 'bg-transparent border-b border-transparent shadow-none py-5'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex flex-col items-start group">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                <span className="text-indigo-600">Evidentia</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Hệ thống trợ lý pháp lý đa tác tử thông minh</p>
          </Link>

          {/* Navigation Links & Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600">
              <a href="#demo-section" className="hover:text-indigo-600 transition-colors">Giao diện</a>
              <a href="#features-section" className="hover:text-indigo-600 transition-colors">Tính năng nổi bật</a>
              <Link to="/laws" className="hover:text-indigo-600 transition-colors">Thư viện văn bản</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/chats"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Bắt đầu hỏi đáp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative z-10 min-h-[calc(100vh-73px)] flex flex-col justify-center items-center max-w-5xl mx-auto px-6 pb-16 text-center">

        {/* Big Impactful Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.18] text-slate-950">
          Tra cứu pháp luật{' '}
          <br className="hidden sm:block" />
          <span className="bg-linear-to-r from-indigo-600 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
            Đúng Luật, Đúng Thời Điểm
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="mt-6 text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-normal">
          Hệ thống đa tác tử giúp tra cứu và phân tích pháp luật Việt Nam chính xác theo từng thời điểm và đối chiếu phiên bản và tổng hợp căn cứ pháp lý minh bạch.
        </p>

        {/* Center Hero Actions */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/chats"
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span>Trải nghiệm hỏi đáp ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: DEMO MÀN HÌNH GIAO DIỆN (OVERLAPPING MOCKUPS) */}
      {/* ========================================================= */}
      <section id="demo-section" className="relative z-10 py-16 px-6 mx-auto w-full bg-slate-100">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Theo dõi từng bước suy luận & đối chiếu văn bản
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Giao diện được thiết kế tối ưu cho các chuyên gia và người dùng cần câu trả lời pháp lý chuẩn xác,
            kèm theo toàn bộ bằng chứng và chuỗi lập luận minh bạch.
          </p>
        </div>

        {/* 2 Overlapping Demo Screens Showcase */}
        <div className="relative w-full max-w-5xl mx-auto pt-6 pb-12">
          {/* Decorative Back Glow */}
          <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 via-blue-500/15 to-purple-500/10 rounded-3xl blur-2xl -z-10" />

          {/* Main Primary Mockup (Chat & Agent Reasoning) */}
          <div className="relative z-10 w-full md:w-[88%] lg:w-[82%] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-900/30 transition-all duration-300 hover:shadow-indigo-950/40">
            {/* Window titlebar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs font-medium text-slate-400 hidden sm:inline">
                  Evidentia Legal Assistant • Không gian làm việc
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI Agents Online</span>
              </div>
            </div>

            {/* Content Area: Image with fallback */}
            <div className="relative w-full flex items-center justify-center bg-slate-900">
              {!primaryImgError ? (
                <img
                  src={DEMO_IMAGES.primary}
                  alt="Evidentia Chat Interface & Multi-Agent Reasoning"
                  className="w-full h-auto object-cover block"
                  onError={() => setPrimaryImgError(true)}
                />
              ) : (
                <PrimaryMockupFallback />
              )}
            </div>
          </div>

          {/* Secondary Overlapping Mockup (Law Comparison / Temporal Engine) */}
          <div className="relative md:absolute md:-bottom-6 md:right-0 z-20 mt-6 md:mt-0 w-full md:w-[54%] lg:w-[48%] rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/50 backdrop-blur-md md:hover:-translate-y-1.5 transition-transform duration-300">
            {/* Secondary Window titlebar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Đối chiếu hiệu lực & phiên bản</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Live Diff
              </span>
            </div>

            {/* Secondary Content Area: Image with fallback */}
            <div className="relative w-full min-h-[220px] sm:min-h-[260px] flex items-center justify-center bg-slate-950">
              {!secondaryImgError ? (
                <img
                  src={DEMO_IMAGES.secondary}
                  alt="Evidentia Law Comparison & Temporal Engine"
                  className="w-full h-auto object-cover block"
                  onError={() => setSecondaryImgError(true)}
                />
              ) : (
                <SecondaryMockupFallback />
              )}
            </div>
          </div>

          {/* Floating Feature Highlight Pills */}
          {/* <div className="hidden lg:flex absolute -left-6 top-1/3 z-30 flex-col gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 text-slate-800 text-xs font-medium shadow-lg shadow-slate-200/80 border border-slate-200/80 backdrop-blur-md animate-bounce-slow">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">✓</div>
              <span>100% Trích dẫn văn bản gốc</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 text-slate-800 text-xs font-medium shadow-lg shadow-slate-200/80 border border-slate-200/80 backdrop-blur-md">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Multi-Agent Reasoning Pipeline</span>
            </div>
          </div> */}
        </div>

        {/* Quick Demo Sub-caption */}
        <div className="mt-16 text-center">
          <p className="text-xs text-slate-500">
            * Hệ thống tự động phân tích theo cấu trúc văn bản pháp luật hiện hành và các quy định sửa đổi, bổ sung tương ứng.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: TÍNH NĂNG NỔI BẬT (FEATURES SHOWCASE) */}
      {/* ========================================================= */}
      <section id="features-section" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-200/80">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Giải quyết các bài toán pháp lý phức tạp với AI
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Evidentia kết hợp mô hình ngôn ngữ lớn tiên tiến cùng hệ thống đa tác tử chuyên biệt,
            giúp loại bỏ ảo giác và mang lại kết quả tra cứu pháp luật có giá trị thực tiễn.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Multi-Agent Reasoning */}
          <div className="group relative p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                Suy luận Đa tác tử Phối hợp
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Chuỗi tác tử độc lập phân công nhiệm vụ: Lập kế hoạch truy xuất, Tìm kiếm điều khoản, Kiểm định hiệu lực thời gian và Tổng hợp giải trình chặt chẽ.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-indigo-600">
              <span>Hiển thị đầy đủ Chain-of-Thought</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Tra cứu & Hỏi đáp Pháp lý */}
          <div className="group relative p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                Tra cứu & Hỏi đáp Ngữ nghĩa
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Tiếp nhận câu hỏi tình huống bằng ngôn ngữ tự nhiên đời thường, tự động phân tích hành vi và đối chiếu với các quy phạm pháp luật tương ứng.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600">
              <span>Phân tích tình huống thực tế</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Phân tích Hiệu lực theo Thời điểm */}
          <div className="group relative p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>

              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                Hiệu lực theo Mốc Thời gian
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Xác định chính xác văn bản nào đang có hiệu lực tại thời điểm phát sinh sự việc, ngăn chặn rủi ro áp dụng nhầm luật đã hết hiệu lực hoặc chưa áp dụng.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-amber-600">
              <span>Không sợ nhầm lẫn mốc hiệu lực</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Đối chiếu & So sánh Phiên bản */}
          <div className="group relative p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
       
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                Đối chiếu & So sánh Phiên bản
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Trực quan hóa sự khác biệt giữa luật gốc và các luật sửa đổi, bổ sung. Đánh dấu rõ nội dung mới được thêm vào, bị bãi bỏ hoặc sửa đổi từng câu chữ.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-purple-600">
              <span>So sánh trực quan song song</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Minh bạch Căn cứ & Trích dẫn */}
          <div className="group relative p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
     
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                Trích dẫn Căn cứ Pháp lý 100%
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Mọi kết luận đều đi kèm liên kết trực tiếp tới Chương, Mục, Điều, Khoản cụ thể của văn bản quy phạm pháp luật ban hành chính thức.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-600">
              <span>Kiểm chứng tức thì nguồn trích dẫn</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Kho Văn bản Chuẩn hóa */}
          <div className="group relative p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>

              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                Thư viện Văn bản Cấu trúc hóa
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Cơ sở dữ liệu văn bản được tổ chức theo cây phân cấp điều hướng thông minh, hỗ trợ tìm kiếm nhanh, đọc toàn văn và lọc theo trạng thái hiệu lực.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-rose-600">
              <span>Dễ dàng đọc và tra cứu</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CALL TO ACTION BANNER */}
      {/* ========================================================= */}
      <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto w-full mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 text-center border border-slate-800 shadow-2xl shadow-indigo-950/20">
          {/* Decorative subtle circle glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Sẵn sàng trải nghiệm trợ lý pháp lý AI thế hệ mới?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Bắt đầu hỏi đáp pháp lý ngay hôm nay với hệ thống suy luận đa tác tử thông minh của Evidentia.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/chats"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <span>Bắt đầu hỏi đáp miễn phí</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/laws"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700 transition-all"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Xem thư viện văn bản</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-200/80 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="text-slate-700">Evidentia © 2026 Hệ thống trợ lý pháp lý đa tác tử thông minh</span>
        </div>
        <div className="flex items-center gap-5 font-medium text-slate-600">
          <Link to="/laws" className="hover:text-indigo-600 transition-colors">Thư viện luật</Link>
          <Link to="/chats" className="hover:text-indigo-600 transition-colors">Hỏi đáp</Link>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Bảo mật</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Về dự án</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

