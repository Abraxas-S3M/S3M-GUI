import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, BackendApiError } from '../apiClient';

const createJsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

describe('ApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends JSON requests and parses response payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        data: { operationName: 'demo', threatLevel: 10, activeAlerts: 1, generatedAt: '2026-01-01T00:00:00.000Z' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new ApiClient(
      {
        apiBaseUrl: 'http://backend/api',
        wsBaseUrl: 'ws://backend/ws',
        requestTimeoutMs: 500,
        enableMockBackend: false,
      },
      { defaultHeaders: { Authorization: 'Bearer token' } },
    );

    const snapshot = await client.getMissionSnapshot();

    expect(snapshot.operationName).toBe('demo');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('throws BackendApiError on non-2xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createJsonResponse(
          {
            code: 'NOT_FOUND',
            message: 'Decision not found',
          },
          { status: 404 },
        ),
      ),
    );

    const client = new ApiClient({
      apiBaseUrl: 'http://backend/api',
      wsBaseUrl: 'ws://backend/ws',
      requestTimeoutMs: 500,
      enableMockBackend: false,
    });

    await expect(client.submitDecision('R9', 'approved')).rejects.toBeInstanceOf(BackendApiError);
  });
});
