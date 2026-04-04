import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { APIClient, APIClientError } from '../client'

describe('APIClient integration with mock backend', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends expected request format and parses response format', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST')
      expect(init?.headers).toBeInstanceOf(Headers)
      expect((init?.headers as Headers).get('content-type')).toBe('application/json')
      expect(init?.body).toBe(JSON.stringify({ mission: 'alpha' }))

      return new Response(
        JSON.stringify({ ok: true, id: 'ctx-1' }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'x-request-id': 'req-123',
          },
        },
      )
    })

    const client = new APIClient({
      baseUrl: 'https://mock-backend.local',
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    const response = await client.post<{ ok: boolean; id: string }>(
      '/operational-context',
      { mission: 'alpha' },
    )

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://mock-backend.local/operational-context',
      expect.any(Object),
    )
    expect(response).toEqual({
      data: { ok: true, id: 'ctx-1' },
      status: 200,
      headers: expect.objectContaining({ 'x-request-id': 'req-123' }),
    })
  })

  it('throws HTTP errors with backend details', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ message: 'invalid request' }),
      {
        status: 400,
        headers: { 'content-type': 'application/json' },
      },
    ))

    const client = new APIClient({
      baseUrl: 'https://mock-backend.local',
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    await expect(client.get('/bad-request')).rejects.toMatchObject({
      name: 'APIClientError',
      code: 'HTTP',
      status: 400,
      details: { message: 'invalid request' },
    } satisfies Partial<APIClientError>)
  })

  it('throws NETWORK errors on failed transport', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('connection reset by peer')
    })

    const client = new APIClient({
      baseUrl: 'https://mock-backend.local',
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    await expect(client.get('/network')).rejects.toMatchObject({
      name: 'APIClientError',
      code: 'NETWORK',
      message: 'connection reset by peer',
    } satisfies Partial<APIClientError>)
  })

  it('throws TIMEOUT errors when request exceeds timeout', async () => {
    vi.useFakeTimers()

    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
      })
    }))

    const client = new APIClient({
      baseUrl: 'https://mock-backend.local',
      timeoutMs: 100,
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    const request = client.get('/slow')
    await vi.advanceTimersByTimeAsync(100)

    await expect(request).rejects.toMatchObject({
      name: 'APIClientError',
      code: 'TIMEOUT',
    } satisfies Partial<APIClientError>)
  })
})
