import React from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Workflow,
  MessageSquareText,
  CalendarClock,
  GitCompare,
  FileCheck,
  Library,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TechStackMarquee } from '../components';

const DEMO_IMAGE = 'images/landing-chat-demo.png';

export const LandingPage: React.FC = () => {
  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth text-slate-800 selection:bg-indigo-600 selection:text-white">
      {/* Section 1: Hero */}
      <section
        id="hero-section"
        className="min-h-screen lg:h-screen w-full shrink-0 snap-start lg:snap-always flex flex-col justify-between items-center bg-white relative overflow-hidden px-4 sm:px-6"
      >
        <header className="w-full text-sm font-medium py-4 shrink-0 z-20">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6 lg:gap-8">
              <Link to="/" className="text-indigo-600 text-xl font-bold tracking-tight">
                Evidentia
              </Link>
              <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-slate-600">
                <Link to="/about" className="hover:text-indigo-600 transition-colors">
                  Về chúng tôi
                </Link>
                <Link to="/architecture" className="hover:text-indigo-600 transition-colors">
                  Kiến trúc
                </Link>
                <Link to="/docs" className="hover:text-indigo-600 transition-colors">
                  Tài liệu
                </Link>
                <Link to="/laws" className="hover:text-indigo-600 transition-colors">
                  Thư viện luật
                </Link>
              </nav>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                to="/laws"
                className="md:hidden text-xs font-medium text-slate-600 hover:text-indigo-600 px-2 py-1"
              >
                Thư viện
              </Link>
              <Link
                to="/chats"
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-xs text-xs sm:text-sm font-semibold"
              >
                <span>Trải nghiệm ngay</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </nav>
          </div>
        </header>

        <div className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto text-center py-8 lg:py-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] lg:w-[800px] h-[240px] sm:h-[350px] bg-linear-to-b from-indigo-200/50 via-blue-100/30 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
          <p className="text-slate-600 text-xs sm:text-sm md:text-base font-semibold tracking-wide uppercase">
            Hệ thống trợ lý pháp lý đa tác tử
          </p>
          <h1 className="mt-3 sm:mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] text-slate-950">
            Tra cứu và hỏi đáp pháp luật
          </h1>
          <p className="mt-3 sm:mt-5 text-slate-600 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed font-normal px-2">
            Hệ thống AI tự động tìm kiếm, phân tích và đối chiếu các quy định pháp luật Việt Nam theo từng mốc hiệu lực thời gian.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              to="/chats"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
            >
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/laws"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200 transition-colors shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Thư viện văn bản</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Demo Showcase */}
      <section
        id="demo-section"
        className="min-h-screen lg:h-screen w-full shrink-0 snap-start lg:snap-always flex flex-col justify-center items-center relative z-10 px-4 sm:px-6 mx-auto bg-slate-100 py-12 lg:py-0 overflow-hidden"
      >
        <div className="text-center max-w-4xl mx-auto mb-4 sm:mb-5 shrink-0">
          <h2
            id="demo-section-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white"
          >
            Suy luận và Trả lời có kiểm chứng
          </h2>
          <p className="mt-1.5 sm:mt-2 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed px-2">
            Giao diện tối ưu cho người dùng, câu trả lời chính xác, kèm theo toàn bộ trích dẫn và chuỗi lập luận.
          </p>
        </div>

        <div className="relative w-full max-w-4xl lg:max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 via-blue-500/15 to-purple-500/10 rounded-3xl blur-2xl -z-10" />

          <div className="relative z-10 w-full rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xl shadow-slate-300/40">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-b border-slate-200/80 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400/90" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400/90" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400/90" />
                <span className="ml-1.5 sm:ml-2 text-[11px] sm:text-xs font-semibold text-slate-700">
                  Giao diện hỏi đáp
                </span>
              </div>
            </div>

            <div className="relative w-full flex items-center justify-center bg-white overflow-hidden">
              <img
                src={DEMO_IMAGE}
                alt="Evidentia Chat Interface & Multi-Agent Reasoning"
                className="w-full max-h-[46vh] sm:max-h-[52vh] lg:max-h-[58vh] object-contain block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features Bento Grid */}
      <section
        id="features-section"
        className="min-h-screen lg:h-screen w-full shrink-0 snap-start lg:snap-always flex flex-col justify-center items-center z-10 px-4 sm:px-6 mx-auto max-w-7xl py-12 lg:py-0 bg-white overflow-hidden"
      >
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-10 shrink-0">
          <h2
            id="feature-section-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white"
          >
            Tính năng cốt lõi
          </h2>
          <p className="mt-1.5 sm:mt-2 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed px-2">
            Hệ thống kết hợp mô hình ngôn ngữ cùng chuỗi tác tử độc lập, tập trung vào tính chính xác,
            minh bạch căn cứ và đúng mốc thời gian áp dụng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full">
          {/* Card 1: Multi-Agent Reasoning */}
          <div className="group relative p-5 sm:p-6 lg:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center mb-3.5 sm:mb-4 border border-indigo-100/80 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <Workflow className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                Phối hợp đa tác tử
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Tự động chia tách bài toán thành các bước độc lập: lập kế hoạch tra cứu, tìm kiếm điều khoản, kiểm tra hiệu lực thời gian và tổng hợp lời giải.
              </p>
            </div>
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Chuỗi lập luận minh bạch</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Tra cứu & Hỏi đáp Pháp lý */}
          <div className="group relative p-5 sm:p-6 lg:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center mb-3.5 sm:mb-4 border border-indigo-100/80 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <MessageSquareText className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                Hỏi đáp tình huống thực tế
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Tiếp nhận câu hỏi bằng ngôn ngữ đời thường, tự động phân tích hành vi và bối cảnh để đối chiếu với các quy phạm pháp luật liên quan.
              </p>
            </div>
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Nhận diện ngữ nghĩa tình huống</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Phân tích Hiệu lực theo Thời điểm */}
          <div className="group relative p-5 sm:p-6 lg:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center mb-3.5 sm:mb-4 border border-indigo-100/80 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <CalendarClock className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                Kiểm tra hiệu lực thời gian
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Xác định chính xác văn bản còn hiệu lực tại thời điểm phát sinh sự việc, loại bỏ rủi ro áp dụng luật cũ đã hết hiệu lực hoặc luật chưa ban hành.
              </p>
            </div>
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Áp dụng đúng mốc hiệu lực</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Đối chiếu & So sánh Phiên bản */}
          <div className="group relative p-5 sm:p-6 lg:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center mb-3.5 sm:mb-4 border border-indigo-100/80 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <GitCompare className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                Đối chiếu sửa đổi, bổ sung
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                So sánh văn bản gốc và các bản sửa đổi qua từng thời kỳ, làm rõ những điều khoản đã thay thế, bãi bỏ hoặc cập nhật mới.
              </p>
            </div>
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Trực quan hóa nội dung thay đổi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Minh bạch Căn cứ & Trích dẫn */}
          <div className="group relative p-5 sm:p-6 lg:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center mb-3.5 sm:mb-4 border border-indigo-100/80 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <FileCheck className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                Trích dẫn căn cứ rõ ràng
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Mỗi kết luận đều gắn liền với điều khoản cụ thể (Chương, Mục, Điều, Khoản, Điểm) giúp người dùng dễ dàng kiểm chứng trên văn bản gốc.
              </p>
            </div>
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Kiểm chứng trực tiếp nguồn văn bản</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Kho Văn bản Chuẩn hóa */}
          <div className="group relative p-5 sm:p-6 lg:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center mb-3.5 sm:mb-4 border border-indigo-100/80 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <Library className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                Thư viện văn bản chuẩn hóa
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Dữ liệu pháp luật được tổ chức theo cây phân cấp thông minh, hỗ trợ tra cứu nhanh, đọc toàn văn và theo dõi liên kết giữa các văn bản.
              </p>
            </div>
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Cấu trúc mục lục trực quan</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Tech Stack Marquee */}
      <TechStackMarquee />

      {/* Section 5: CTA & Footer */}
      <section
        id="cta-section"
        className="min-h-screen// lg:h-screen// w-full shrink-0 snap-start lg:snap-always flex flex-col justify-between items-center relative z-10 w-full bg-white px-4 sm:px-6 pt-8 sm:pt-10 overflow-hidden"
      >
        <div className="w-full max-w-6xl mx-auto my-auto py-8 sm:py-12 ">
          <div className="w-full rounded-2xl sm:rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 sm:py-14 lg:py-16 px-6 sm:px-10 lg:px-12 text-center border border-slate-800 shadow-2xl shadow-indigo-950/20 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Sẵn sàng trải nghiệm trợ lý pháp lý thế hệ mới?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed px-2">
                Bắt đầu hỏi đáp pháp lý ngay hôm nay với hệ thống suy luận đa tác tử thông minh của Evidentia.
              </p>
              <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  to="/chats"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                >
                  <span>Bắt đầu hỏi đáp miễn phí</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/laws"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200 transition-colors shadow-2xs"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Xem thư viện văn bản</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full max-w-7xl mx-auto border-t border-slate-100 py-5 sm:py-6 shrink-0 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 sm:gap-4 text-center sm:text-left">
            <div>
              <span className="text-slate-700 font-medium">Evidentia © 2026</span>
              <span className="hidden sm:inline text-slate-300 mx-2">•</span>
              <span className="block sm:inline mt-0.5 sm:mt-0">Hệ thống trợ lý pháp lý đa tác tử thông minh</span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 font-medium text-slate-600">
              <Link to="/about" className="hover:text-indigo-600 transition-colors">
                Về chúng tôi
              </Link>
              <Link to="/architecture" className="hover:text-indigo-600 transition-colors">
                Kiến trúc
              </Link>
              <Link to="/docs" className="hover:text-slate-900 transition-colors">
                Tài liệu
              </Link>
              <Link to="/laws" className="hover:text-slate-900 transition-colors">
                Thư viện luật
              </Link>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default LandingPage;
