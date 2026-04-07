import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

import {
  API_BASE_URL,
  API_RETRY_ATTEMPTS,
  API_RETRY_BASE_DELAY_MS,
  API_TIMEOUT_MS,
  API_TRANSPORT,
  COMMAND_ENDPOINTS,
  COMMUNICATION_ENDPOINTS,
  DECISION_ENDPOINTS,
  READINESS_ENDPOINTS,
  RISK_ENDPOINTS,
  SURVEILLANCE_ENDPOINTS,
  COP_ENDPOINTS,
} from './config';
import type {
  APIResponseBase,
  APIService,
  ClassificationLevel,
  DataSource,
  Decision,
  DecisionData,
  ISRAssetData,
  MessageData,
  OperationalContextData,
  ReadinessData,
  RiskMetricsData,
  SendMessagePayload,
  ThreatTrackData,
  TimelineEventData,
  TransportType,
} from './types';

type HttpMethod = 'GET' | 'POST';

interface HttpRequest<TBody> {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: TBody;
  timeoutMs: number;
}

interface HttpResponse<TResponse> {
  status: number;
  data: TResponse;
}

interface HttpTransport {
  request<TResponse, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>>;
}

export interface APIClientConfig {
  baseURL?: string;
  transport?: TransportType;
  retryAttempts?: number;
  retryBaseDelayMs?: number;
  timeoutMs?: number;
  token?: string;
  tokenProvider?: () => string | undefined | Promise<string | undefined>;
  enableLogging?: boolean;
  responseSource?: DataSource;
  defaultClassification?: ClassificationLevel;
}

export class APIClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly retriable: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    retriable: boolean,
    details?: unknown,
  ) {
    super(message);
    this.name = 'APIClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.retriable = retriable;
    this.details = details;
  }
}

const runtimeEnv = (
  (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {}
) as Record<string, unknown>;

const isDev = runtimeEnv.DEV === true;

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

class FetchTransport implements HttpTransport {
  async request<TResponse, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), request.timeoutMs);

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
        signal: controller.signal,
      });

      const rawText = await response.text();
      const parsedBody = rawText.length > 0 ? safeJsonParse(rawText) : {};

      return {
        status: response.status,
        data: parsedBody as TResponse,
      };
    } catch (error) {
      throw normalizeTransportError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

class AxiosTransport implements HttpTransport {
  private readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create();
  }

  async request<TResponse, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>> {
    try {
      const config: AxiosRequestConfig<TBody> = {
        method: request.method,
        url: request.url,
        headers: request.headers,
        data: request.body,
        timeout: request.timeoutMs,
      };

      const response = await this.instance.request<TResponse>(config);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw normalizeTransportError(error);
    }
  }
}

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return { raw: value };
  }
};

const normalizeTransportError = (error: unknown): APIClientError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Record<string, unknown>>;
    const statusCode = axiosError.response?.status ?? 0;
    const details = axiosError.response?.data ?? axiosError.message;
    const retriable = statusCode === 0 || statusCode >= 500 || statusCode === 429;

    return new APIClientError(
      axiosError.message || 'Network request failed',
      statusCode,
      statusCode === 0 ? 'NETWORK_ERROR' : 'HTTP_ERROR',
      retriable,
      details,
    );
  }

  if (error instanceof APIClientError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Unknown network error';
  return new APIClientError(message, 0, 'NETWORK_ERROR', true, error);
};

export class APIClient implements APIService {
  private readonly baseURL: string;
  private readonly retryAttempts: number;
  private readonly retryBaseDelayMs: number;
  private readonly timeoutMs: number;
  private readonly transportType: TransportType;
  private readonly transport: HttpTransport;
  private readonly enableLogging: boolean;
  private readonly responseSource: DataSource;
  private readonly defaultClassification: ClassificationLevel;
  private token: string | undefined;
  private readonly tokenProvider?: () => string | undefined | Promise<string | undefined>;

  constructor(config: APIClientConfig = {}) {
    this.baseURL = config.baseURL ?? API_BASE_URL;
    this.retryAttempts = config.retryAttempts ?? API_RETRY_ATTEMPTS;
    this.retryBaseDelayMs = config.retryBaseDelayMs ?? API_RETRY_BASE_DELAY_MS;
    this.timeoutMs = config.timeoutMs ?? API_TIMEOUT_MS;
    this.transportType = config.transport ?? API_TRANSPORT;
    this.transport =
      this.transportType === 'axios' ? new AxiosTransport() : new FetchTransport();
    this.token = config.token;
    this.tokenProvider = config.tokenProvider;
    this.enableLogging = config.enableLogging ?? isDev;
    this.responseSource = config.responseSource ?? 's3m-core';
    this.defaultClassification = config.defaultClassification ?? 'SECRET';
  }

  setToken(token: string | undefined): void {
    this.token = token;
  }

  async getOperationalContext(): Promise<OperationalContextData> {
    return this.request<OperationalContextData>(
      COMMAND_ENDPOINTS.operationalContext,
      'GET',
    );
  }

  async getDecisions(): Promise<DecisionData> {
    return this.request<DecisionData>(DECISION_ENDPOINTS.list, 'GET');
  }

  async approveDecision(id: string, comment: string): Promise<DecisionData> {
    return this.request<DecisionData>(DECISION_ENDPOINTS.approve(id), 'POST', {
      comment,
    });
  }

  async rejectDecision(id: string, comment: string): Promise<DecisionData> {
    return this.request<DecisionData>(DECISION_ENDPOINTS.reject(id), 'POST', {
      comment,
    });
  }

  async getRiskMetrics(): Promise<RiskMetricsData> {
    return this.request<RiskMetricsData>(RISK_ENDPOINTS.metrics, 'GET');
  }

  async getThreatTracks(): Promise<ThreatTrackData> {
    return this.request<ThreatTrackData>(COP_ENDPOINTS.threatTracks, 'GET');
  }

  async getReadinessSummary(): Promise<ReadinessData> {
    return this.request<ReadinessData>(READINESS_ENDPOINTS.summary, 'GET');
  }

  async getSurveillanceAssets(): Promise<ISRAssetData> {
    return this.request<ISRAssetData>(SURVEILLANCE_ENDPOINTS.assets, 'GET');
  }

  async getMessages(): Promise<MessageData> {
    return this.request<MessageData>(COMMUNICATION_ENDPOINTS.inbox, 'GET');
  }

  async getComms(): Promise<MessageData> {
    return this.request<MessageData>(COMMUNICATION_ENDPOINTS.inbox, 'GET');
  }

  async getRisk(): Promise<RiskMetricsData> {
    return this.request<RiskMetricsData>(RISK_ENDPOINTS.metrics, 'GET');
  }

  async getTracks(): Promise<ThreatTrackData> {
    return this.request<ThreatTrackData>(COP_ENDPOINTS.threatTracks, 'GET');
  }

  async getSurveillance(): Promise<ISRAssetData> {
    return this.request<ISRAssetData>(SURVEILLANCE_ENDPOINTS.assets, 'GET');
  }

  async getReadiness(): Promise<ReadinessData> {
    return this.request<ReadinessData>(READINESS_ENDPOINTS.summary, 'GET');
  }

  async updateDecisionStatus(
    id: string,
    status: 'approved' | 'rejected',
  ): Promise<Decision> {
    if (status === 'approved') {
      const result = await this.request<DecisionData>(
        DECISION_ENDPOINTS.approve(id),
        'POST',
        { comment: '' },
      );
      const found = result.decisions?.find((d) => d.id === id);
      return (
        found ??
        ({
          id,
          title: '',
          risk: 0,
          confidence: 0,
          description: '',
          status,
          severity: 'LOW',
        } as Decision)
      );
    }
    const result = await this.request<DecisionData>(
      DECISION_ENDPOINTS.reject(id),
      'POST',
      { comment: '' },
    );
    const found = result.decisions?.find((d) => d.id === id);
    return (
      found ??
      ({
        id,
        title: '',
        risk: 0,
        confidence: 0,
        description: '',
        status,
        severity: 'LOW',
      } as Decision)
    );
  }

  async sendMessage(message: SendMessagePayload): Promise<MessageData> {
    return this.request<MessageData>(COMMUNICATION_ENDPOINTS.send, 'POST', message);
  }

  async getTimelineEvents(): Promise<TimelineEventData> {
    return this.request<TimelineEventData>(COMMAND_ENDPOINTS.timeline, 'GET');
  }

  private async request<TResponse extends APIResponseBase, TBody = unknown>(
    endpoint: string,
    method: HttpMethod,
    body?: TBody,
  ): Promise<TResponse> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders();

    for (let attempt = 0; attempt <= this.retryAttempts; attempt += 1) {
      const startedAt = Date.now();

      try {
        this.log('request', {
          method,
          url,
          attempt,
          hasBody: Boolean(body),
        });

        const response = await this.transport.request<unknown, TBody>({
          method,
          url,
          headers,
          body,
          timeoutMs: this.timeoutMs,
        });

        if (response.status >= 400) {
          throw this.toHttpError(response.status, response.data);
        }

        const latencyMs = Date.now() - startedAt;
        const normalized = this.normalizeResponse<TResponse>(
          response.data,
          response.status,
          latencyMs,
          attempt,
        );

        this.log('response', {
          method,
          url,
          statusCode: normalized.statusCode,
          attempt,
          latencyMs,
        });

        return normalized;
      } catch (error) {
        const normalizedError = normalizeTransportError(error);
        const shouldRetry = normalizedError.retriable && attempt < this.retryAttempts;

        this.log('error', {
          method,
          url,
          attempt,
          message: normalizedError.message,
          statusCode: normalizedError.statusCode,
          willRetry: shouldRetry,
        });

        if (!shouldRetry) {
          throw normalizedError;
        }

        const delayMs = this.retryBaseDelayMs * 2 ** attempt;
        await sleep(delayMs);
      }
    }

    throw new APIClientError(
      'Request failed after retries',
      0,
      'RETRY_EXHAUSTED',
      false,
    );
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = await this.resolveToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async resolveToken(): Promise<string | undefined> {
    if (this.tokenProvider) {
      return this.tokenProvider();
    }

    return this.token;
  }

  private toHttpError(statusCode: number, data: unknown): APIClientError {
    let message = `Request failed with status ${statusCode}`;
    if (isRecord(data) && typeof data.message === 'string') {
      message = data.message;
    }

    return new APIClientError(
      message,
      statusCode,
      'HTTP_ERROR',
      statusCode >= 500 || statusCode === 429,
      data,
    );
  }

  private normalizeResponse<TResponse extends APIResponseBase>(
    payload: unknown,
    statusCode: number,
    latencyMs: number,
    retries: number,
  ): TResponse {
    const requestId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const base: APIResponseBase = {
      requestStatus: 'success',
      statusCode,
      timestamp: new Date().toISOString(),
      classification: this.defaultClassification,
      metadata: {
        source: this.responseSource,
        requestId,
        transport: this.transportType,
        latencyMs,
        retries,
      },
    };

    if (!isRecord(payload)) {
      return {
        ...base,
      } as TResponse;
    }

    const payloadMetadata = isRecord(payload.metadata) ? payload.metadata : {};
    const merged: Record<string, unknown> = {
      ...base,
      ...payload,
      metadata: {
        ...base.metadata,
        ...payloadMetadata,
      },
    };

    if (typeof merged.requestStatus !== 'string') {
      merged.requestStatus = 'success';
    }
    if (typeof merged.statusCode !== 'number') {
      merged.statusCode = statusCode;
    }
    if (typeof merged.timestamp !== 'string') {
      merged.timestamp = base.timestamp;
    }
    if (typeof merged.classification !== 'string') {
      merged.classification = this.defaultClassification;
    }

    return merged as TResponse;
  }

  private log(
    event: 'request' | 'response' | 'error',
    payload: Record<string, unknown>,
  ): void {
    if (!this.enableLogging) {
      return;
    }

    // eslint-disable-next-line no-console
    console.debug(`[APIClient:${event}]`, payload);
  }
}

export const backendApiClient = new APIClient();
