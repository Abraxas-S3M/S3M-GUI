import type {
  CommsData,
  CommsMessage,
  Decision,
  OperationalContextData,
  ReadinessData,
  RiskData,
  SurveillanceData,
  ThreatTrack
} from './types';

type RequestOptions = RequestInit & {
  timeoutMs?: number;
};

function withTimeout(signal: AbortSignal | null, timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(new Error('Request timed out')), timeoutMs);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

  controller.signal.addEventListener(
    'abort',
    () => {
      window.clearTimeout(timeout);
    },
    { once: true }
  );

  return controller.signal;
}

export class APIClient {
  private static get baseUrl(): string {
    return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
  }

  private static async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 12_000, headers, signal, ...rest } = options;
    const requestHeaders = new Headers(headers ?? {});
    requestHeaders.set('Accept', 'application/json');
    if (!requestHeaders.has('Content-Type') && rest.body) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...rest,
        headers: requestHeaders,
        signal: withTimeout(signal ?? null, timeoutMs)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown network failure';
      throw new Error(`Network error while calling ${path}: ${message}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const errorDetails = body ? ` | ${body}` : '';
      throw new Error(`HTTP ${response.status} ${response.statusText} for ${path}${errorDetails}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  static getOperationalContext(): Promise<OperationalContextData> {
    return this.request<OperationalContextData>('/operational-context');
  }

  static getDecisions(): Promise<Decision[]> {
    return this.request<Decision[]>('/decisions');
  }

  static approveDecision(id: string, comment?: string): Promise<Decision> {
    return this.request<Decision>(`/decisions/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  static rejectDecision(id: string, comment?: string): Promise<Decision> {
    return this.request<Decision>(`/decisions/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  static getRisk(): Promise<RiskData> {
    return this.request<RiskData>('/risk');
  }

  static getTracks(): Promise<ThreatTrack[]> {
    return this.request<ThreatTrack[]>('/tracks');
  }

  static getReadiness(): Promise<ReadinessData> {
    return this.request<ReadinessData>('/readiness');
  }

  static getSurveillance(): Promise<SurveillanceData> {
    return this.request<SurveillanceData>('/surveillance');
  }

  static getMessages(): Promise<CommsData> {
    return this.request<CommsData>('/comms/messages');
  }

  static sendMessage(message: Omit<CommsMessage, 'id' | 'timestamp' | 'read'>): Promise<CommsMessage> {
    return this.request<CommsMessage>('/comms/messages', {
      method: 'POST',
      body: JSON.stringify(message)
    });
  }

  static markMessageRead(id: string): Promise<CommsMessage> {
    return this.request<CommsMessage>(`/comms/messages/${encodeURIComponent(id)}/read`, {
      method: 'POST'
    });
  }
}
