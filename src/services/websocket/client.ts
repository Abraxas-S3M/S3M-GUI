export interface WebSocketClientOptions {
  reconnectIntervalMs?: number
  maxReconnectAttempts?: number
  webSocketFactory?: (url: string) => WebSocket
  isOnline?: () => boolean
}

export type MessageHandler<T = unknown> = (message: T) => void

const OPEN_STATE = 1

export class WebSocketClient<T = unknown> {
  private readonly url: string
  private readonly reconnectIntervalMs: number
  private readonly maxReconnectAttempts: number
  private readonly webSocketFactory: (url: string) => WebSocket
  private readonly isOnline: () => boolean
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private manuallyDisconnected = false
  private offlineMode = false
  private messageHandlers = new Set<MessageHandler<T>>()

  constructor(url: string, options: WebSocketClientOptions = {}) {
    this.url = url
    this.reconnectIntervalMs = options.reconnectIntervalMs ?? 1_000
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 3
    this.webSocketFactory = options.webSocketFactory ?? ((socketUrl) => new WebSocket(socketUrl))
    this.isOnline = options.isOnline ?? (() => navigator.onLine)
  }

  connect(): boolean {
    if (!this.isOnline()) {
      this.offlineMode = true
      return false
    }

    this.offlineMode = false
    this.manuallyDisconnected = false
    this.socket = this.webSocketFactory(this.url)
    this.attachSocketListeners(this.socket)
    return true
  }

  disconnect(): void {
    this.manuallyDisconnected = true
    this.clearReconnectTimer()
    if (this.socket) {
      this.socket.close()
    }
    this.socket = null
  }

  send(payload: T): void {
    if (!this.socket || this.socket.readyState !== OPEN_STATE) {
      throw new Error('WebSocket is not connected')
    }
    this.socket.send(JSON.stringify(payload))
  }

  onMessage(handler: MessageHandler<T>): () => void {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  isOfflineMode(): boolean {
    return this.offlineMode
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  private attachSocketListeners(socket: WebSocket): void {
    socket.addEventListener('open', () => {
      this.reconnectAttempts = 0
    })

    socket.addEventListener('message', (event) => {
      const payload = safeJsonParse<T>((event as MessageEvent).data)
      if (payload === null) {
        return
      }
      for (const handler of this.messageHandlers) {
        handler(payload)
      }
    })

    socket.addEventListener('close', () => {
      this.socket = null
      if (!this.manuallyDisconnected) {
        this.scheduleReconnect()
      }
    })
  }

  private scheduleReconnect(): void {
    if (!this.isOnline()) {
      this.offlineMode = true
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this.reconnectAttempts += 1
    this.clearReconnectTimer()
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.reconnectIntervalMs)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

function safeJsonParse<T>(data: unknown): T | null {
  if (typeof data !== 'string') {
    return null
  }

  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}
