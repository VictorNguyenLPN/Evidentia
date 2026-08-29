import type { AdminUser } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('evidentia_admin_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('evidentia_admin_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('evidentia_admin_token');
  localStorage.removeItem('evidentia_admin_user');
};

export const getStoredAdminUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem('evidentia_admin_user');
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
};

export const setStoredAdminUser = (user: AdminUser): void => {
  localStorage.setItem('evidentia_admin_user', JSON.stringify(user));
};

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    removeAuthToken();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  if (response.status === 403) {
    throw new Error('Bạn không có quyền quản trị viên để thực hiện thao tác này.');
  }

  let data: { detail?: string; message?: string } | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `Yêu cầu thất bại (Mã lỗi: ${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}
