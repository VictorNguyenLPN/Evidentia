import type {
    ChatSession,
    ChatDocumentResponse,
    ChatRequestPayload,
    ChatStreamEvent
} from '../types';

export const chatService = {
    async getChats(): Promise<ChatSession[]> {
        const res = await fetch('/api/chats');
        if (!res.ok) {
            throw new Error(`Failed to fetch chats: ${res.statusText}`);
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    },

    async getChatById(chatId: string): Promise<ChatDocumentResponse | null> {
        const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}`);
        if (res.status === 404) {
            return null;
        }
        if (!res.ok) {
            throw new Error(`Failed to fetch chat details: ${res.statusText}`);
        }
        return res.json();
    },

    async togglePinChat(chatId: string): Promise<{ is_pinned: boolean }> {
        const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/pin`, {
            method: 'POST',
        });
        if (!res.ok) {
            throw new Error(`Failed to toggle pin: ${res.statusText}`);
        }
        return res.json();
    },

    async renameChat(chatId: string, title: string): Promise<{ success: boolean; id: string; title: string }> {
        const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/rename`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        if (!res.ok) {
            throw new Error(`Failed to rename chat: ${res.statusText}`);
        }
        return res.json();
    },

    async deleteChat(chatId: string): Promise<boolean> {
        const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}`, {
            method: 'DELETE',
        });
        return res.ok;
    },

    async clearAllChats(): Promise<boolean> {
        const res = await fetch('/api/chats', {
            method: 'DELETE',
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
        const res = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
