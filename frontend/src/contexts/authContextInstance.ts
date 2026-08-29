import { createContext } from 'react';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  guestQuestionsCount: number;
  guestQuestionsRemaining: number;
  isGuestLimitReached: boolean;
  freeQuestionsRemaining: number;
  isLimitReached: boolean;
  incrementGuestQuestions: () => number;
  resetGuestQuestions: () => void;
  refreshGuestStatus: () => Promise<void>;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
