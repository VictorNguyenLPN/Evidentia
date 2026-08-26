import { createContext } from 'react';
import type { ChatSession } from '../types';

export interface ChatContextType {
    chats: ChatSession[];
    setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
    fetchChats: () => Promise<void>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isSearchOpen: boolean;
    setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isDevMode: boolean;
    setIsDevMode: (enabled: boolean) => void;
    isDarkMode: boolean;
    setIsDarkMode: (enabled: boolean) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);
