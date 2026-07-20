import { env } from '@/config/env';
import type { ApiErrorPayload } from '@/types/copilot';

export class ApiError extends Error {
  code: number;
  type: string;

  constructor(message: string, code: number, type: string) {
    super(message);
    this.code = code;
    this.type = type;
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.apiBaseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorPayload = data as ApiErrorPayload;
      const message = errorPayload.error?.message || response.statusText || 'An unexpected API error occurred';
      const code = errorPayload.error?.code || response.status;
      const type = errorPayload.error?.type || 'HTTPError';
      throw new ApiError(message, code, type);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network failure or server unreachable',
      500,
      'NetworkError'
    );
  }
}
