import type { RecommendedAction } from '@/types/context';

export interface StreamIntentOptions {
  contextId: string;
  intentId: string;
  intentType: string;
  action: RecommendedAction;
  contextPayload?: Record<string, any>;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
  onToken: (token: string) => void;
  onFinal?: (metrics?: any) => void;
  onError?: (err: string) => void;
}

export class StreamingService {
  private static activeAbortController: AbortController | null = null;

  /**
   * Streams intent tokens from backend Real-time SSE Gateway.
   */
  public static async streamIntent(options: StreamIntentOptions): Promise<void> {
    // 1. Cancel previous active stream to avoid zombie responses
    this.cancelActiveStream();

    this.activeAbortController = new AbortController();

    try {
      const response = await fetch('/api/v1/stream/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_id: options.contextId,
          intent_id: options.intentId,
          intent_type: options.intentType,
          prompt_text: options.action.description,
          provider_hint: 'google_gemini',
          context_payload: options.contextPayload || {},
          conversation_history: options.conversationHistory || [],
        }),
        signal: this.activeAbortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep unfinished chunk in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              if (data.event === 'token' && data.token_text) {
                options.onToken(data.token_text);
              } else if (data.event === 'final') {
                options.onFinal?.(data.metrics);
              } else if (data.event === 'error') {
                options.onError?.(data.message);
              }
            } catch (err) {
              console.warn('[StreamingService] Failed to parse SSE JSON chunk:', err);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[StreamingService] Active stream aborted cleanly.');
      } else {
        options.onError?.(err.message || 'Streaming network error.');
      }
    } finally {
      this.activeAbortController = null;
    }
  }

  /**
   * Cancels active stream request immediately.
   */
  public static cancelActiveStream(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }
}
