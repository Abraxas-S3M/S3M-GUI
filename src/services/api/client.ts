export type APIErrorCode = 'HTTP' | 'NETWORK' | 'TIMEOUT'

export interface APIClientOptions {
  baseUrl: string
  defaultHeaders?: HeadersInit
  timeoutMs?: number
  fetchImpl?: typeof fetch
}

export interface APIRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export interface APIResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
}

export class APIClientError extends Error {
  readonly code: APIErrorCode
  readonly status?: number
  readonly details?: unknown

  constructor(message: string, code: APIErrorCode, status?: number, details?: unknown) {
    super(message)
    this.name = 'APIClientError'
    this.code = code
    this.status = status
    this.details = details
  }
}

const DEFAULT_TIMEOUT_MS = 5_000

export class APIClient {
  private readonly baseUrl: string
  private readonly defaultHeaders: HeadersInit
  private readonly timeoutMs: number
  private readonly fetchImpl: typeof fetch

  constructor(options: APIClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.defaultHeaders = options.defaultHeaders ?? {}
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  async get<T>(path: string, options?: Omit<APIRequestOptions, 'method'>): Promise<APIResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  async post<T>(path: string, body?: unknown, options?: Omit<APIRequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  async request<T>(path: string, options: APIRequestOptions = {}): Promise<APIResponse<T>> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort('Request timed out'), this.timeoutMs)
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`
    const headers = new Headers(this.defaultHeaders)

    if (options.headers) {
      for (const [key, value] of new Headers(options.headers).entries()) {
        headers.set(key, value)
      }
    }

    const hasBody = typeof options.body !== 'undefined'
    const body = hasBody ? JSON.stringify(options.body) : undefined
    if (hasBody && !headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }

    try {
      const response = await this.fetchImpl(url, {
        ...options,
        headers,
        body,
        signal: controller.signal,
      })

      const parsed = await parseResponse(response)
      if (!response.ok) {
        throw new APIClientError(
          `Request failed with status ${response.status}`,
          'HTTP',
          response.status,
          parsed,
        )
      }

      return {
        data: parsed as T,
        status: response.status,
        headers: headersToObject(response.headers),
      }
    } catch (error) {
      if (error instanceof APIClientError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIClientError(
          `Request timed out after ${this.timeoutMs}ms`,
          'TIMEOUT',
        )
      }

      throw new APIClientError(
        error instanceof Error ? error.message : 'Network request failed',
        'NETWORK',
      )
    } finally {
      clearTimeout(timeout)
    }
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function headersToObject(headers: Headers): Record<string, string> {
  const output: Record<string, string> = {}
  headers.forEach((value, key) => {
    output[key] = value
  })
  return output
}
