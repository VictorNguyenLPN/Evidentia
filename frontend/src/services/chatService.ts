import type {
    ChatSession,
    ChatDocumentResponse,
    ChatRequestPayload,
    ChatStreamEvent
} from '../types';
import { authService } from './authService';
import { API_BASE_URL } from './apiConfig';

export const chatService = {
    async getChats(): Promise<ChatSession[]> {
        const res = await fetch(`${API_BASE_URL}/api/chats`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch chats: ${res.statusText}`);
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    },

    async getChatById(chatId: string): Promise<ChatDocumentResponse | null> {
        const res = await fetch(`${API_BASE_URL}/api/chats/${encodeURIComponent(chatId)}`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });
        if (res.status === 404) {
            return null;
        }
        if (res.status === 403) {
            return {
                id: chatId,
                is_private: true,
                messages: []
            };
        }
        if (!res.ok) {
            throw new Error(`Failed to fetch chat details: ${res.statusText}`);
        }
        return res.json();
    },

    async toggleShareChat(chatId: string, isShared: boolean): Promise<{ success: boolean; id: string; is_shared: boolean; shared_at?: string }> {
        const res = await fetch(`${API_BASE_URL}/api/chats/${encodeURIComponent(chatId)}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ is_shared: isShared })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Không thể cập nhật trạng thái chia sẻ cuộc trò chuyện.');
        }
        return res.json();
    },

    async togglePinChat(chatId: string): Promise<{ is_pinned: boolean }> {
        const res = await fetch(`${API_BASE_URL}/api/chats/${encodeURIComponent(chatId)}/pin`, {
            method: 'POST',
            headers: {
                ...authService.getAuthHeaders()
            }
        });
        if (!res.ok) {
            throw new Error(`Failed to toggle pin: ${res.statusText}`);
        }
        return res.json();
    },

    async renameChat(chatId: string, title: string): Promise<{ success: boolean; id: string; title: string }> {
        const res = await fetch(`${API_BASE_URL}/api/chats/${encodeURIComponent(chatId)}/rename`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ title }),
        });
        if (!res.ok) {
            throw new Error(`Failed to rename chat: ${res.statusText}`);
        }
        return res.json();
    },

    async deleteChat(chatId: string): Promise<boolean> {
        const res = await fetch(`${API_BASE_URL}/api/chats/${encodeURIComponent(chatId)}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });
        return res.ok;
    },

    async clearAllChats(): Promise<boolean> {
        const res = await fetch(`${API_BASE_URL}/api/chats`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });
        if (!res.ok) {
            throw new Error('Failed to clear all chats');
        }
        return true;
    },

    async streamChat(
        payload: ChatRequestPayload,
        onEvent: (event: ChatStreamEvent) => void,
        signal?: AbortSignal
    ): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({
                query: payload.query,
                target_date: payload.target_date || undefined,
                top_k: payload.top_k || 10,
                chat_id: payload.chat_id,
            }),
            signal,
        });

        if (!res.ok || !res.body) {
            const errorData = await res.json().catch(() => ({ detail: 'Lỗi kết nối máy chủ' }));
            throw new Error(errorData.detail || 'Lỗi kết nối máy chủ');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const block of lines) {
                const trimmed = block.trim();
                if (!trimmed.startsWith('data:')) continue;
                const jsonStr = trimmed.replace(/^data:\s*/, '');
                if (!jsonStr) continue;

                try {
                    const event: ChatStreamEvent = JSON.parse(jsonStr);
                    if (event.type === 'error') {
                        throw new Error(event.detail || 'Lỗi xử lý luồng stream');
                    }
                    onEvent(event);
                } catch (parseErr) {
                    if (parseErr instanceof Error && parseErr.message.includes('Lỗi xử lý luồng stream')) {
                        throw parseErr;
                    }
                    console.warn('Error parsing SSE event chunk:', parseErr);
                }
            }
        }
    },
};
