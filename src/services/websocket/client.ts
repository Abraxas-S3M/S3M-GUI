import { API_CONFIG } from '../api/config';
import { isBackendSocketEventType } from './handlers';
import type { BackendSocketEvent, BackendSocketEventType, BackendSocketListener } from './types';

export class BackendWebSocketClient {
  private socket: WebSocket | null = null;
  private listeners = new Set<BackendSocketListener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private manuallyDisconnected = false;
  private onStateChange?: (state: string) => void;

  lastMessageAt: string | null = null;

  get connectionState(): 'connected' | 'connecting' | 'disconnected' | 'reconnecting' {
    if (!this.socket) {
      return this.reconnectAttempt > 0 ? 'reconnecting' : 'disconnected';
    }
    if (this.socket.readyState === WebSocket.CONNECTING) {
      return 'connecting';
    }
    if (this.socket.readyState === WebSocket.OPEN) {
      return 'connected';
    }
    return 'disconnected';
  }

  connect(url = API_CONFIG.wsUrl): void {
    if (typeof WebSocket === 'undefined') {
      return;
    }

    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    this.manuallyDisconnected = false;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      const wasReconnecting = this.reconnectAttempt > 0;
      this.reconnectAttempt = 0;
      this.onStateChange?.(this.connectionState);

      if (wasReconnecting) {
        this.listeners.forEach((listener) =>
          listener({
            type: 'backend.snapshot' as BackendSocketEventType,
            payload: { _reconnected: true },
            timestamp: new Date().toISOString(),
          } as any),
        );
      }
    };

    this.socket.onmessage = (event) => {
      this.lastMessageAt = new Date().toISOString();
      this.handleIncomingMessage(event.data);
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.onStateChange?.(this.connectionState);
      this.scheduleReconnect(url);
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  disconnect(): void {
    this.manuallyDisconnected = true;
    this.clearReconnectTimer();
    this.socket?.close();
    this.socket = null;
  }

  subscribe(listener: BackendSocketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setOnStateChange(callback: (state: string) => void): void {
    this.onStateChange = callback;
  }

  send<TPayload>(type: BackendSocketEventType, payload: TPayload): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString()
      })
    );
  }

  private handleIncomingMessage(rawMessage: unknown): void {
    if (typeof rawMessage !== 'string') {
      return;
    }

    try {
      const parsed = JSON.parse(rawMessage) as Partial<BackendSocketEvent> & { type?: string };
      if (!parsed.type || !isBackendSocketEventType(parsed.type)) {
        return;
      }

      const event = parsed as BackendSocketEvent;
      this.listeners.forEach((listener) => listener(event));
    } catch {
      // Ignore malformed payloads to keep socket resilient.
    }
  }

  private scheduleReconnect(url: string): void {
    if (this.manuallyDisconnected) {
      return;
    }

    this.clearReconnectTimer();
    const delay = Math.min(1_000 * 2 ** this.reconnectAttempt, 15_000);
    this.reconnectAttempt += 1;
    this.onStateChange?.(this.connectionState);

    this.reconnectTimer = setTimeout(() => {
      this.connect(url);
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}

export const backendWebSocketClient = new BackendWebSocketClient();
