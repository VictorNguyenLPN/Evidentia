import { request, setAuthToken, setStoredAdminUser, removeAuthToken } from './api';
import type {
  AdminUser,
  AdminOverviewResponse,
  SystemHealthResponse,
  UserQuotaRecord,
  GuestLimitRecord,
  VectorStatusResponse,
  TestRetrievalResponse,
  AdminChatSummary,
  UserRole,
  UserPlan,
} from '../types';

export const adminService = {
  // --- AUTH ---
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await request<{ token?: string; access_token?: string; user: AdminUser }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    if (res.user.role !== 'admin') {
      throw new Error('Tài khoản này không có quyền quản trị viên (Admin).');
    }

    const token = res.token || res.access_token || '';
    setAuthToken(token);
    setStoredAdminUser(res.user);
    return { token, user: res.user };
  },

  logout(): void {
    removeAuthToken();
  },

  async getMe(): Promise<AdminUser> {
    const res = await request<{ user?: AdminUser } | AdminUser>('/api/auth/me');
    const user = (res as { user?: AdminUser }).user || (res as AdminUser);
    if (!user || user.role !== 'admin') {
      throw new Error('Tài khoản này không có quyền quản trị viên (Admin).');
    }
    setStoredAdminUser(user);
    return user;
  },

  // --- OVERVIEW & SYSTEM HEALTH ---
  async getOverview(): Promise<AdminOverviewResponse> {
    return request<AdminOverviewResponse>('/api/admin/overview');
  },

  async getSystemHealth(): Promise<SystemHealthResponse> {
    return request<SystemHealthResponse>('/api/admin/system/health');
  },

  // --- USERS MANAGEMENT ---
  async getUsers(params?: { query?: string; role?: string; plan?: string }): Promise<{ users: AdminUser[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.role && params.role !== 'all') searchParams.set('role', params.role);
    if (params?.plan && params.plan !== 'all') searchParams.set('plan', params.plan);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ users: AdminUser[]; total: number }>(`/api/admin/users${queryStr}`);
  },

  async createUser(payload: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    plan: UserPlan;
  }): Promise<{ message: string; user: AdminUser }> {
    return request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUser(
    userId: string,
    payload: { full_name?: string; email?: string; role?: UserRole; plan?: UserPlan }
  ): Promise<{ message: string; user: AdminUser }> {
    return request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    return request(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    return request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getUserChats(userId: string): Promise<{ user_id: string; chats: AdminChatSummary[]; total: number }> {
    return request(`/api/admin/users/${userId}/chats`);
  },

  // --- USER QUESTION QUOTA & LIMIT MANAGEMENT (ALL PLANS) ---
  async getUserLimits(
    query?: string,
    plan?: string
  ): Promise<{
    user_quotas: UserQuotaRecord[];
    total: number;
    plan_limits: Record<string, number>;
    default_free_limit: number;
  }> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (plan && plan !== 'all') params.append('plan', plan);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/admin/user-limits${qs}`);
  },

  async resetUserLimit(userIdOrEmail: string): Promise<{ message: string }> {
    return request('/api/admin/user-limits/reset', {
      method: 'POST',
      body: JSON.stringify({ user_id: userIdOrEmail }),
    });
  },

  async resetAllUserLimits(plan?: string): Promise<{ message: string }> {
    return request('/api/admin/user-limits/reset-all', {
      method: 'POST',
      body: JSON.stringify({ plan: plan || 'all' }),
    });
  },

  // Backward compatibility aliases
  async getGuestLimits(): Promise<{ guest_limits: GuestLimitRecord[]; total: number; max_limit_default: number }> {
    return request('/api/admin/guest-limits');
  },

  async resetGuestLimit(ip: string): Promise<{ message: string }> {
    return request('/api/admin/user-limits/reset', {
      method: 'POST',
      body: JSON.stringify({ user_id: ip }),
    });
  },

  async resetAllGuestLimits(): Promise<{ message: string }> {
    return request('/api/admin/user-limits/reset-all', {
      method: 'POST',
      body: JSON.stringify({ plan: 'all' }),
    });
  },

  async deleteGuestLimit(ip: string): Promise<{ message: string }> {
    return request(`/api/admin/user-limits/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    });
  },

  // --- VECTOR DB & INGESTION ---
  async getVectorStatus(): Promise<VectorStatusResponse> {
    return request<VectorStatusResponse>('/api/admin/vector/status');
  },

  async triggerVectorIngest(): Promise<{ status: string; cloud_count: number; message: string }> {
    return request('/api/admin/vector/ingest', {
      method: 'POST',
    });
  },

  async testRetrieval(payload: {
    query: string;
    top_k?: number;
    target_date?: string;
  }): Promise<TestRetrievalResponse> {
    return request<TestRetrievalResponse>('/api/admin/vector/test-retrieval', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async triggerLawsSync(): Promise<{ status: string; total_laws: number; total_articles: number; message: string }> {
    return request('/api/admin/laws/sync', {
      method: 'POST',
    });
  },

  async getLawsPreview(): Promise<{ total_laws: number; total_articles: number; laws: unknown[] }> {
    return request('/api/admin/laws/preview');
  },

  // --- CHATS MONITORING ---
  async getChats(params?: { query?: string; skip?: number; limit?: number }): Promise<{ chats: AdminChatSummary[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ chats: AdminChatSummary[]; total: number }>(`/api/admin/chats${queryStr}`);
  },

  async deleteChat(chatId: string): Promise<{ message: string }> {
    return request(`/api/admin/chats/${chatId}`, {
      method: 'DELETE',
    });
  },
};
