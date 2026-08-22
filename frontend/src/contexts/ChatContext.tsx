import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ChatSession {
    id: string;
    title: string;
    time: string;
    tag: string;
    isPinned: boolean;
    created_at?: string;
    updated_at?: string;
}

interface ChatContextType {
    chats: ChatSession[];
    setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
    fetchChats: () => Promise<void>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isSearchOpen: boolean;
    setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const fetchChats = useCallback(async () => {
        try {
            const res = await fetch('/api/chats');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setChats(data);
                }
            }
        } catch (err) {
            console.warn('Could not fetch chats:', err);
        }
    }, []);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    return (
        <ChatContext.Provider
            value={{
                chats,
                setChats,
                fetchChats,
                isSidebarOpen,
                setIsSidebarOpen,
                isSearchOpen,
                setIsSearchOpen,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
