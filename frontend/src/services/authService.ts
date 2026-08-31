import type {
    User,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    ChangePasswordRequest
} from '../types';
import { API_BASE_URL } from './apiConfig';

const TOKEN_KEY = 'evidentia_auth_token';
const USER_KEY = 'evidentia_auth_user';
export const DEFAULT_FREE_PLAN_LIMIT = 5;

// Clean up any legacy localStorage keys
try {
    localStorage.removeItem('evidentia_guest_query_count');
} catch {
    // ignore
}

export const authService = {
    getToken(): string | null {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    },

    setToken(token: string): void {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch {
            // ignore
        }
    },

    removeToken(): void {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch {
            // ignore
        }
    },

    getStoredUser(): User | null {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    setStoredUser(user: User): void {
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch {
            // ignore
        }
    },

    removeStoredUser(): void {
        try {
            localStorage.removeItem(USER_KEY);
        } catch {
            // ignore
        }
    },

    resetGuestQuestionsCount(): void {
        try {
            localStorage.removeItem('evidentia_guest_query_count');
        } catch {
            // ignore
        }
    },

    async getGuestStatus(): Promise<{ authenticated: boolean; user?: User; questions_used: number; remaining: number; limit_reached: boolean }> {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/guest-status`, {
                headers: {
                    ...this.getAuthHeaders()
                }
            });
            if (res.ok) {
                const data = await res.json();
                return data;
            }
        } catch (e) {
            console.warn('Could not fetch auth status from backend:', e);
        }
        return {
            authenticated: false,
            questions_used: 0,
            remaining: 0,
            limit_reached: true
        };
    },

    getAuthHeaders(): Record<string, string> {
        const token = this.getToken();
        if (token) {
            return {
                'Authorization': `Bearer ${token}`
            };
        }
        return {};
    },

    async login(payload: LoginRequest): Promise<AuthResponse> {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
        }

        if (data.token) {
            this.setToken(data.token);
        }
        if (data.user) {
            this.setStoredUser(data.user);
        }
        return data;
    },

    async register(payload: RegisterRequest): Promise<AuthResponse> {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Đăng ký không thành công. Vui lòng thử lại.');
        }

        if (data.token) {
            this.setToken(data.token);
        }
        if (data.user) {
            this.setStoredUser(data.user);
        }
        return data;
    },

    async getMe(): Promise<User> {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
                ...this.getAuthHeaders()
            }
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Không thể lấy thông tin người dùng.');
        }

        const user: User = data.user || data;
        if (user) {
            this.setStoredUser(user);
        }
        return user;
    },

    async updateProfile(payload: UpdateProfileRequest): Promise<User> {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Không thể cập nhật hồ sơ.');
        }

        const user: User = data.user || data;
        if (user) {
            this.setStoredUser(user);
        }
        return user;
    },

    async changePassword(payload: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Đổi mật khẩu thất bại.');
        }

        return data;
    },

    logout(): void {
        this.removeToken();
        this.removeStoredUser();
    }
};
