import React, { useState, useEffect, useCallback, useTransition } from 'react';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';
import { authService } from '../services';
import { AuthContext } from './authContextInstance';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [guestQuestionsCount, setGuestQuestionsCount] = useState<number>(0);
  const [, startTransition] = useTransition();

  const questionsUsed = user?.questions_used ?? 0;
  const questionsLimit = user?.questions_limit ?? (user?.plan === 'free' ? 5 : -1);
  const freeQuestionsRemaining =
    user?.questions_remaining !== undefined
      ? user.questions_remaining
      : (questionsLimit === -1 ? -1 : Math.max(0, questionsLimit - questionsUsed));

  const isLimitReached =
    user?.limit_reached !== undefined
      ? user.limit_reached
      : Boolean(user && questionsLimit !== -1 && questionsUsed >= questionsLimit);

  const guestQuestionsRemaining = freeQuestionsRemaining >= 0 ? freeQuestionsRemaining : (questionsLimit > 0 ? questionsLimit : 5);
  const isGuestLimitReached = !user || isLimitReached;

  const incrementGuestQuestions = useCallback(() => {
    let updated = 1;
    setGuestQuestionsCount((prev) => {
      updated = prev + 1;
      return updated;
    });
    return updated;
  }, []);

  const resetGuestQuestions = useCallback(() => {
    authService.resetGuestQuestionsCount();
    setGuestQuestionsCount(0);
  }, []);

  const refreshGuestStatus = useCallback(async () => {
    try {
      const status = await authService.getGuestStatus();
      if (!status.authenticated) {
        setGuestQuestionsCount(status.questions_used);
      }
    } catch {
      // ignore
    }
  }, []);

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = authService.getToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      refreshGuestStatus();
      return;
    }

    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      setToken(currentToken);
    } catch (err) {
      console.warn('Session expired or user fetch failed:', err);
      authService.logout();
      setUser(null);
      setToken(null);
      refreshGuestStatus();
    } finally {
      setIsLoading(false);
    }
  }, [refreshGuestStatus]);

  // Initial auth verification on mount
  useEffect(() => {
    startTransition(() => {
      refreshUser();
    });
  }, [refreshUser]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      try {
        const res = await authService.login(credentials);
        setUser(res.user);
        setToken(res.token);
        resetGuestQuestions();
        setIsAuthModalOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [resetGuestQuestions]
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      setIsLoading(true);
      try {
        const res = await authService.register(payload);
        setUser(res.user);
        setToken(res.token);
        resetGuestQuestions();
        setIsAuthModalOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [resetGuestQuestions]
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfileRequest) => {
    const updated = await authService.updateProfile(payload);
    setUser(updated);
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordRequest) => {
    await authService.changePassword(payload);
  }, []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        guestQuestionsCount,
        guestQuestionsRemaining,
        isGuestLimitReached,
        freeQuestionsRemaining,
        isLimitReached,
        incrementGuestQuestions,
        resetGuestQuestions,
        refreshGuestStatus,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
