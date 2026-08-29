import type {
  Message,
  Citation,
  PipelineStep,
  QueryAnalysis,
  TokenUsage,
  ChatStreamEvent,
} from '../types';

const CURRENT_USER_EMAIL = 'huy.nguyen@evidentia.vn';

// Generate a 16-character hex hash from user email + timestamp + random entropy on frontend
export const generateChatId = (email: string = CURRENT_USER_EMAIL): string => {
  const raw = `${email}::${Date.now()}::${Math.random().toString(36).substring(2, 9)}`;
  let h1 = 0xdeadbeef,
    h2 = 0x41c6ce57;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  const s1 = ((h1 ^ (h1 >>> 16)) >>> 0).toString(16).padStart(8, '0');
  const s2 = ((h2 ^ (h2 >>> 16)) >>> 0).toString(16).padStart(8, '0');
  return `${s1}${s2}`;
};

export const formatChatHeaderDate = (isoStringOrDate?: string | null): string => {
  const d = isoStringOrDate ? new Date(isoStringOrDate) : new Date();
  if (isNaN(d.getTime())) return '';

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = daysOfWeek[d.getDay()];

  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return `${dayOfWeek}, ${date}, ${time}`;
};

export function reduceStreamingEvent(
  messages: Message[],
  assistantMsgId: string,
  event: ChatStreamEvent,
  currentTurnStartTime: number
): Message[] {
  const eventType = event.type;

  return messages.map((msg) => {
    if (msg.id !== assistantMsgId) return msg;

    // 1. Pipeline step updates
    if (
      eventType === 'step' ||
      eventType === 'step_update' ||
      eventType === 'step_start' ||
      eventType === 'step_complete'
    ) {
      const stepData = event.data as PipelineStep | undefined;
      const stepKey = event.step || stepData?.step;
      const stepMessage = event.message || stepData?.message;
      const stepTitle = event.title || stepData?.title || stepMessage || stepKey;
      const stepStatus =
        eventType === 'step_start'
          ? 'running'
          : eventType === 'step_complete'
          ? 'completed'
          : stepData?.status || (event.status as 'running' | 'completed' | 'failed') || 'completed';
      const stepDetails = (event.details || stepData?.details || {}) as Record<string, unknown>;

      const existingSteps = msg.steps ? [...msg.steps] : [];
      const targetIdx = existingSteps.findIndex(
        (s) => (stepKey && s.step === stepKey) || (stepTitle && s.title === stepTitle)
      );

      const updatedStep: PipelineStep = {
        step: stepKey || `step_${existingSteps.length + 1}`,
        title: stepTitle,
        message: stepMessage || '',
        status: stepStatus,
        details: stepDetails,
        ...(stepData || {}),
      };

      if (targetIdx >= 0) {
        existingSteps[targetIdx] = {
          ...existingSteps[targetIdx],
          ...updatedStep,
          details: {
            ...existingSteps[targetIdx].details,
            ...stepDetails,
          },
        };
      } else {
        existingSteps.push(updatedStep);
      }

      const newCitations =
        event.citations || (event.data as { citations?: Citation[] } | undefined)?.citations;

      return {
        ...msg,
        steps: existingSteps,
        citations: newCitations || msg.citations,
      };
    }

    // 2. Query analysis event
    if (eventType === 'analysis') {
      return {
        ...msg,
        analysis: (event.analysis || event.data) as QueryAnalysis,
      };
    }

    // 3. Streaming answer token / chunk
    if (eventType === 'token' || eventType === 'chunk') {
      const chunkData = event.data as { text?: string } | string | undefined;
      const chunkText =
        event.content !== undefined
          ? event.content
          : typeof chunkData === 'string'
          ? chunkData
          : chunkData?.text || '';
      return {
        ...msg,
        text: (msg.text || '') + chunkText,
      };
    }

    // 4. Citations list
    if (eventType === 'citations') {
      return {
        ...msg,
        citations: (event.citations || event.data) as Citation[],
      };
    }

    // 5. Final full response / answer / done completion
    if (eventType === 'answer' || eventType === 'final_answer' || eventType === 'done') {
      const answerData = event.data as
        | {
            text?: string;
            token_usage?: TokenUsage;
            citations?: Citation[];
            analysis?: QueryAnalysis;
            steps?: PipelineStep[];
          }
        | string
        | undefined;
      const finalText =
        event.answer !== undefined
          ? event.answer
          : typeof answerData === 'string'
          ? answerData
          : answerData?.text || msg.text;
      const tokenUsage =
        event.token_usage ||
        (typeof answerData === 'object' && answerData ? answerData.token_usage : undefined) ||
        msg.token_usage;
      const citations =
        event.citations ||
        (typeof answerData === 'object' && answerData ? answerData.citations : undefined) ||
        msg.citations;
      const analysis =
        event.analysis ||
        (typeof answerData === 'object' && answerData ? answerData.analysis : undefined) ||
        msg.analysis;
      const steps =
        event.steps ||
        (typeof answerData === 'object' && answerData ? answerData.steps : undefined) ||
        msg.steps;
      const turnDuration = +((Date.now() - currentTurnStartTime) / 1000).toFixed(1);

      return {
        ...msg,
        text: finalText,
        analysis: analysis,
        steps: steps,
        token_usage: tokenUsage,
        citations: citations,
        isStreaming: false,
        duration: turnDuration,
      };
    }

    // 6. Token usage telemetry update
    if (eventType === 'token_usage') {
      return {
        ...msg,
        token_usage: (event.token_usage || event.data) as TokenUsage,
      };
    }

    // 7. Error event
    if (eventType === 'error') {
      const errData = event.data as { message?: string } | undefined;
      const errorDetail = event.detail || errData?.message || 'Đã có lỗi xảy ra.';
      return {
        ...msg,
        text: (msg.text ? msg.text + '\n\n' : '') + `❌ Lỗi: ${errorDetail}`,
        isStreaming: false,
      };
    }

    return msg;
  });
}
