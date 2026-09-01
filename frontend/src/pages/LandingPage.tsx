import React from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEMO_IMAGES = {
  primary: 'images/landing-chat-demo.png',
  secondary: 'images/reasoning-process.png',
};

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full text-slate-800 flex flex-col overflow-x-clip relative selection:bg-indigo-600 selection:text-white">
      <div className="h-screen flex flex-col justify-between items-center">
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

        <section className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto px-6 text-center pb-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[350px] bg-linear-to-b from-indigo-200/50 via-blue-100/30 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-semibold">
            Hệ thống trợ lý pháp lý đa tác tử
          </p>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] text-slate-950">
            Tra cứu và hỏi đáp pháp luật
          </h1>
          <p className="mt-5 text-slate-600 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-normal">
            Hệ thống AI tự động tìm kiếm, phân tích và đối chiếu các quy định pháp luật Việt Nam theo từng mốc hiệu lực thời gian.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/chats"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
            >
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/laws"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Thư viện văn bản</span>
            </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Suy luận Đa tác tử</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Kiểm định Hiệu lực</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Trích dẫn Điều Khoản</span>
            </div>
          </div>
        </section>
      </div>


      <section id="demo-section" className="min-h-screen flex flex-col justify-center items-center z-10 py-24 px-6 mx-auto w-full bg-slate-100">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Theo dõi quy trình suy luận
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Giao diện được thiết kế tối ưu cho người dùng cần câu trả lời pháp lý chuẩn xác,
            kèm theo toàn bộ bằng chứng và chuỗi lập luận minh bạch.
          </p>
        </div>

        {/* 2 Overlapping Demo Screens Showcase */}
        <div className="relative w-full max-w-5xl mx-auto pt-6 pb-12">
          {/* Decorative Back Glow */}
          <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 via-blue-500/15 to-purple-500/10 rounded-3xl blur-2xl -z-10" />

          {/* Main Primary Mockup (Chat & Agent Reasoning) */}
          <div className="relative z-10 w-full md:w-[88%] lg:w-[82%] rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xl shadow-slate-300/40 transition-all duration-300 hover:shadow-indigo-950/10">
            {/* Window titlebar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/90" />
                <div className="w-3 h-3 rounded-full bg-amber-400/90" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/90" />
                <span className="ml-2 text-xs font-semibold text-slate-700 hidden sm:inline flex items-center gap-1.5">
                  Giao diện tra cứu & hỏi đáp pháp lý
                </span>
              </div>
            </div>

            {/* Content Area: Image */}
            <div className="relative w-full flex items-center justify-center bg-white">
              <img
                src={DEMO_IMAGES.primary}
                alt="Evidentia Chat Interface & Multi-Agent Reasoning"
                className="w-full h-auto object-cover block"
              />
            </div>
          </div>

          {/* Secondary Overlapping Mockup (Multi-Agent Reasoning Process) */}
          <div className="relative md:absolute md:-bottom-8 md:right-0 z-20 mt-6 md:mt-0 w-full md:w-[56%] lg:w-[50%] rounded-2xl overflow-hidden bg-white border-2 border-indigo-400/60 shadow-2xl shadow-indigo-950/15 backdrop-blur-md md:hover:-translate-y-1.5 transition-transform duration-300">
            {/* Secondary Window titlebar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-indigo-50/90 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800">Quy trình suy luận</span>
              </div>
            </div>

            {/* Secondary Content Area: Image */}
            <div className="relative w-full flex items-center justify-center bg-white">
              <img
                src={DEMO_IMAGES.secondary}
                alt="Evidentia Multi-Agent Reasoning Process"
                className="w-full h-auto object-cover block"
              />
            </div>
          </div>
        </div>

        {/* Quick Demo Sub-caption */}
        <div className="mt-16 text-center">
          <p className="text-xs text-slate-500">
            * Hệ thống tự động phân tích theo cấu trúc văn bản pháp luật hiện hành và các quy định sửa đổi, bổ sung tương ứng.
          </p>
        </div>
      </section>

      <section id="features-section" className="min-h-screen flex flex-col justify-center z-10 py-24 px-6 mx-auto max-w-7xl w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Giải quyết bài toán pháp lý phức tạp
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Evidentia kết hợp mô hình ngôn ngữ lớn được huấn luyện chuyện biệt cùng hệ thống đa tác tử,
            giúp loại bỏ ảo giác và mang lại kết quả đáng tin cậy
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Multi-Agent Reasoning */}
          <div className="group relative p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                Suy luận Đa tác tử
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
                Xác định chính xác văn bản nào đang có hiệu lực tại thời điểm phát sinh sự việc, ngăn chặn rủi ro áp dụng nhầm luật đã hết hiệu lực hoặc chưa có hiệu lực.
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
                Trích dẫn Căn cứ Pháp lý
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
                Văn bản cập nhật liên tục
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

      <section className="relative z-10 py-20 px-6 w-full bg-slate-100 flex items-center justify-center">
        <div className="w-full max-w-6xl rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-6 sm:px-12 text-center border border-slate-800 shadow-2xl shadow-indigo-950/20 relative overflow-hidden">
          {/* Decorative subtle circle glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Sẵn sàng trải nghiệm trợ lý pháp lý thế hệ mới?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Bắt đầu hỏi đáp pháp lý ngay hôm nay với hệ thống suy luận đa tác tử thông minh của Evidentia.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/chats"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
              >
                <span>Bắt đầu hỏi đáp miễn phí</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/laws"
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Xem thư viện văn bản</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

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

export default LandingPage;
