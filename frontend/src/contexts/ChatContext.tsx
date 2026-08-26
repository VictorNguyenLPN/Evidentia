import React, { useState, useEffect, useCallback } from 'react';
import type { ChatSession } from '../types';
import { chatService } from '../services';
import { ChatContext } from './chatContextInstance';

// Temporarily disable all CSS transitions during theme switch to prevent patchy staggered animations
const disableTransitionsDuringThemeSwitch = () => {
    const css = document.createElement('style');
    css.appendChild(
        document.createTextNode(
            `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
    );
    document.head.appendChild(css);

    return () => {
        // Force browser layout repaint
        (() => window.getComputedStyle(document.body))();
        // Restore interactive transitions on next frame
        setTimeout(() => {
            if (css.parentNode) {
                document.head.removeChild(css);
            }
        }, 16);
    };
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDevMode, setIsDevModeState] = useState<boolean>(() => {
        try {
            return localStorage.getItem('evidentia_dev_mode') === 'true';
        } catch {
            return false;
        }
    });

    const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('evidentia_dark_mode');
            if (saved !== null) {
                return saved === 'true';
            }
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch {
            return false;
        }
    });

    const setIsDevMode = useCallback((enabled: boolean) => {
        setIsDevModeState(enabled);
        try {
            localStorage.setItem('evidentia_dev_mode', String(enabled));
        } catch {
            // ignore localStorage quota errors
        }
    }, []);

    const setIsDarkMode = useCallback((enabled: boolean) => {
        const restoreTransitions = disableTransitionsDuringThemeSwitch();
        setIsDarkModeState(enabled);
        try {
            localStorage.setItem('evidentia_dark_mode', String(enabled));
        } catch {
            // ignore
        }
        if (enabled) {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
        }
        restoreTransitions();
    }, []);

    // Sync HTML dark class and colorScheme on mount and changes
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    }, [isDarkMode]);

    const fetchChats = useCallback(async () => {
        try {
            const data = await chatService.getChats();
            setChats(data);
        } catch (err) {
            console.warn('Could not fetch chats:', err);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        chatService.getChats()
            .then((data) => {
                if (isMounted) {
                    setChats(data);
                }
            })
            .catch((err) => {
                console.warn('Could not fetch chats on init:', err);
            });

        return () => {
            isMounted = false;
        };
    }, []);

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
                isDevMode,
                setIsDevMode,
                isDarkMode,
                setIsDarkMode,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export default ChatProvider;
