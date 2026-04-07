import { API_CONFIG } from '../config';

export type WebSocketConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

type EventHandler = (payload: unknown) => void;
type StatusHandler = (status: WebSocketConnectionStatus) => void;

interface SocketEventEnvelope {
  topic?: string;
  payload?: unknown;
}

class BackendWebSocketManager {
  private socket: WebSocket | null = null;
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private statusHandlers = new Set<StatusHandler>();
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private status: WebSocketConnectionStatus = 'idle';
  private shouldReconnect = true;

  private getSocketUrl(): string {
    return API_CONFIG.wsUrl;
  }

  private setStatus(status: WebSocketConnectionStatus): void {
    this.status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) {
      return;
    }

    this.clearReconnectTimer();
    const delay = Math.min(30_000, 1_000 * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;
    this.setStatus('connecting');

    try {
      this.socket = new WebSocket(this.getSocketUrl());
    } catch (error) {
      this.setStatus('error');
      console.error('[BackendWebSocket] Failed to initialize socket:', error);
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as SocketEventEnvelope;
        const topic = parsed.topic ?? 'raw';
        this.dispatch(topic, parsed.payload);
      } catch (error) {
        this.dispatch('raw', event.data);
        console.warn('[BackendWebSocket] Received non-JSON message.', error);
      }
    };

    this.socket.onerror = () => {
      this.setStatus('error');
    };

    this.socket.onclose = () => {
      this.setStatus('disconnected');
      this.scheduleReconnect();
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('disconnected');
  }

  subscribe(topic: string, handler: EventHandler): () => void {
    const existingHandlers = this.eventHandlers.get(topic) ?? new Set<EventHandler>();
    existingHandlers.add(handler);
    this.eventHandlers.set(topic, existingHandlers);

    return () => {
      const handlers = this.eventHandlers.get(topic);
      if (!handlers) {
        return;
      }
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(topic);
      }
    };
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    handler(this.status);

    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  getStatus(): WebSocketConnectionStatus {
    return this.status;
  }

  dispatch(topic: string, payload: unknown): void {
    const handlers = this.eventHandlers.get(topic);
    if (!handlers || handlers.size === 0) {
      return;
    }
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[BackendWebSocket] Handler failed for topic "${topic}".`, error);
      }
    });
  }
}

export const backendWebSocket = new BackendWebSocketManager();
