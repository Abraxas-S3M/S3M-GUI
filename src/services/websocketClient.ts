import { backendConfig } from './config';

type MessageHandler<TPayload> = (payload: TPayload) => void;
type SocketFactory = (url: string) => WebSocket;

export interface RealtimeMessage<TPayload = unknown> {
  type: string;
  payload: TPayload;
}

export interface WebSocketClientOptions {
  reconnectDelayMs?: number;
  socketFactory?: SocketFactory;
}

export class RealtimeWebSocketClient {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private readonly reconnectDelayMs: number;
  private readonly socketFactory: SocketFactory;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;
  private readonly listeners = new Map<string, Set<MessageHandler<unknown>>>();

  constructor(url = backendConfig.wsBaseUrl, options: WebSocketClientOptions = {}) {
    this.url = url;
    this.reconnectDelayMs = options.reconnectDelayMs ?? 2_500;
    this.socketFactory = options.socketFactory ?? ((socketUrl) => new WebSocket(socketUrl));
  }

  connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    this.socket = this.socketFactory(this.url);
    this.socket.onmessage = (event) => this.handleRawMessage(event.data);
    this.socket.onclose = () => this.handleClose();
  }

  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket?.close();
    this.socket = null;
  }

  subscribe<TPayload>(type: string, handler: MessageHandler<TPayload>): () => void {
    const handlers = this.listeners.get(type) ?? new Set<MessageHandler<unknown>>();
    handlers.add(handler as MessageHandler<unknown>);
    this.listeners.set(type, handlers);

    return () => {
      const currentHandlers = this.listeners.get(type);
      if (!currentHandlers) {
        return;
      }

      currentHandlers.delete(handler as MessageHandler<unknown>);
      if (currentHandlers.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  send<TPayload>(message: RealtimeMessage<TPayload>): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected.');
    }

    this.socket.send(JSON.stringify(message));
  }

  private handleRawMessage(raw: string): void {
    let parsed: RealtimeMessage<unknown>;
    try {
      parsed = JSON.parse(raw) as RealtimeMessage<unknown>;
    } catch {
      return;
    }

    const handlers = this.listeners.get(parsed.type);
    if (!handlers) {
      return;
    }

    handlers.forEach((handler) => handler(parsed.payload));
  }

  private handleClose(): void {
    this.socket = null;

    if (!this.shouldReconnect) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectDelayMs);
  }
}

export const realtimeClient = new RealtimeWebSocketClient();
