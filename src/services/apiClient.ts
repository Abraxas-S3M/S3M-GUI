import { backendConfig, type BackendConfig } from './config';
import type { ApiResponse, BackendErrorPayload, Decision, MissionSnapshot } from './types';

export interface ApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  defaultHeaders?: HeadersInit;
}

export class BackendApiError extends Error {
  status: number;
  payload?: BackendErrorPayload;

  constructor(message: string, status: number, payload?: BackendErrorPayload) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
    this.payload = payload;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly defaultHeaders: HeadersInit;

  constructor(config: BackendConfig = backendConfig, options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? config.apiBaseUrl;
    this.timeoutMs = options.timeoutMs ?? config.requestTimeoutMs;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  async getMissionSnapshot(): Promise<MissionSnapshot> {
    const response = await this.request<ApiResponse<MissionSnapshot>>('/mission/snapshot');
    return response.data;
  }

  async listDecisions(): Promise<Decision[]> {
    const response = await this.request<ApiResponse<Decision[]>>('/decisions');
    return response.data;
  }

  async submitDecision(id: string, status: 'approved' | 'rejected'): Promise<Decision> {
    const response = await this.request<ApiResponse<Decision>>(`/decisions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    return response.data;
  }

  async request<TData>(path: string, init: RequestInit = {}): Promise<TData> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...init.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await this.safeJson<BackendErrorPayload>(response)) ?? undefined;
        throw new BackendApiError(
          payload?.message ?? `Backend request failed with status ${response.status}`,
          response.status,
          payload,
        );
      }

      return (await this.safeJson<TData>(response)) as TData;
    } finally {
      clearTimeout(timer);
    }
  }

  private async safeJson<TData>(response: Response): Promise<TData | null> {
    try {
      return (await response.json()) as TData;
    } catch {
      return null;
    }
  }
}

export const apiClient = new ApiClient();
