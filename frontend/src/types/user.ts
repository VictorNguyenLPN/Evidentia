export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar?: string;
    role?: 'user' | 'admin';
    plan?: 'free' | 'pro' | 'enterprise';
    questions_used?: number;
    questions_limit?: number;
    questions_remaining?: number;
    limit_reached?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
}

export interface UpdateProfileRequest {
    full_name?: string;
    avatar?: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}
