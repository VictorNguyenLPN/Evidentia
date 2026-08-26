import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useChat } from '../contexts';

export const MainLayout: React.FC = () => {
    const location = useLocation();
    const { chatId } = useParams<{ chatId?: string }>();
    const {
        chats,
        setChats,
        isSidebarOpen,
        setIsSidebarOpen,
        isSearchOpen,
        setIsSearchOpen,
    } = useChat();

    const activeNav = location.pathname.startsWith('/laws')
        ? 'laws'
        : location.pathname.startsWith('/achieves') || location.pathname.startsWith('/archive')
        ? 'archive'
        : 'chat';

    return (
        <div className="flex relative h-screen w-full text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-950 overflow-hidden font-sans">
            {/* Persistent Sidebar */}
            <Sidebar
                activeNav={activeNav}
                activeChatId={chatId || null}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
                chats={chats}
                setChats={setChats}
            />

            {/* Main content pane */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white dark:bg-slate-950">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
