import React from 'react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div className="flex flex-col relative h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans justify-between select-none">
            {/* Top Navigation Bar */}
            <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/" className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            <span className="text-indigo-600">Evidentia</span>
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium tracking-wide">Hệ thống trợ lý pháp lý đa tác tử thông minh</p>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/laws"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium"
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

            {/* Main 404 Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto px-6 py-6 w-full text-center mb-[35px]">
                <span className="text-7xl sm:text-8xl font-extrabold tracking-tight bg-linear-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                    404
                </span>

                <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Không tìm thấy trang yêu cầu
                </h1>

                <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-lg leading-relaxed">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang đường dẫn khác.
                </p>

                <div className="mt-8 flex items-center justify-center gap-3">
                    <span
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(-1);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Trang trước</span>
                    </span>
                </div>
            </main >

            {/* Bottom Minimal Footer Strip */}
            < footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80" >
                <div>
                    <span>© 2026 Evidentia - Hệ thống trợ lý pháp lý đa tác tử thông minh</span>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium">
                    <span className="hover:text-slate-800 transition-colors cursor-pointer">Tài liệu API</span>
                    <span>•</span>
                    <span className="hover:text-slate-800 transition-colors cursor-pointer">Bảo mật & Quyền riêng tư</span>
                    <span>•</span>
                    <span className="hover:text-slate-800 transition-colors cursor-pointer">Về chúng tôi</span>
                </div>
            </footer >
        </div >
    );
};

export default NotFoundPage;
