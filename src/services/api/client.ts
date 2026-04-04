import { API_CONFIG, API_ENDPOINTS, buildApiUrl } from './config';
import { getBackendAdapter } from '../mock/backends';
import type {
  ApiResponse,
  BackendSnapshot,
  CommsData,
  Decision,
  DecisionStatus,
  OperationalContextData,
  ReadinessData,
  RiskData,
  SurveillanceData,
  TracksData
} from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class BackendApiClient {
  private readonly mockAdapter = getBackendAdapter();

  private unwrapResponse<T>(payload: ApiResponse<T> | T): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as ApiResponse<T>).data;
    }

    return payload as T;
  }

  private async request<T>(method: HttpMethod, endpoint: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Backend request failed (${response.status})`);
      }

      const payload = (await response.json()) as ApiResponse<T> | T;
      return this.unwrapResponse(payload);
    } finally {
      clearTimeout(timeout);
    }
  }

  async getSnapshot(): Promise<BackendSnapshot> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.getSnapshot();
    }

    return this.request<BackendSnapshot>('GET', API_ENDPOINTS.snapshot);
  }

  async getDecisions(): Promise<Decision[]> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.getDecisions();
    }

    return this.request<Decision[]>('GET', API_ENDPOINTS.decisions);
  }

  async updateDecisionStatus(id: string, status: DecisionStatus): Promise<Decision> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.updateDecisionStatus(id, status);
    }

    return this.request<Decision>('PATCH', `${API_ENDPOINTS.decisions}/${id}`, { status });
  }

  async getRisk(): Promise<RiskData> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.getRisk();
    }

    return this.request<RiskData>('GET', API_ENDPOINTS.risk);
  }

  async getReadiness(): Promise<ReadinessData> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.getReadiness();
    }

    return this.request<ReadinessData>('GET', API_ENDPOINTS.readiness);
  }

  async getSurveillance(): Promise<SurveillanceData> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.getSurveillance();
    }

    return this.request<SurveillanceData>('GET', API_ENDPOINTS.surveillance);
  }

  async getComms(): Promise<CommsData> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.getComms();
    }

    return this.request<CommsData>('GET', API_ENDPOINTS.comms);
  }

  async getTracks(): Promise<TracksData> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.getTracks();
    }

    return this.request<TracksData>('GET', API_ENDPOINTS.tracks);
  }

  async getOperationalContext(): Promise<OperationalContextData> {
    if (API_CONFIG.useMockBackend) {
      return this.mockAdapter.getOperationalContext();
    }

    return this.request<OperationalContextData>('GET', API_ENDPOINTS.operationalContext);
  }
}

export const backendApiClient = new BackendApiClient();
