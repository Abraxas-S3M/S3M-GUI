import { API_CONFIG } from '../api/config';
import { useConnectionStore } from '../connectionStore';
import { isBackendSocketEventType } from './handlers';
import type { BackendSocketEvent, BackendSocketEventType, BackendSocketListener } from './types';

export class BackendWebSocketClient<TPayload = unknown> {
  private readonly defaultUrl: string;
  private readonly webSocketFactory: (url: string) => WebSocket;
  private readonly reconnectIntervalMs: number;
  private readonly maxReconnectAttempts: number;
  private readonly isOnlineCheck: () => boolean;
  private rawMessageListeners = new Set<(payload: unknown) => void>();
  private socket: WebSocket | null = null;
  private listeners = new Set<BackendSocketListener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private manuallyDisconnected = false;
  private onStateChange?: (state: string) => void;
  private offlineMode = false;
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

  constructor(
    url = API_CONFIG.wsUrl,
    options: {
      webSocketFactory?: (url: string) => WebSocket;
      reconnectIntervalMs?: number;
      maxReconnectAttempts?: number;
      isOnline?: () => boolean;
    } = {}
  ) {
    this.defaultUrl = url;
    this.webSocketFactory = options.webSocketFactory ?? ((socketUrl) => new WebSocket(socketUrl));
    this.reconnectIntervalMs = options.reconnectIntervalMs ?? 2_500;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? Number.POSITIVE_INFINITY;
    this.isOnlineCheck = options.isOnline ?? (() => true);
  }
 
  connect(url = this.defaultUrl): boolean {
    if (!this.isOnlineCheck()) {
      this.offlineMode = true;
      return false;
    }
    this.offlineMode = false;

    if (typeof WebSocket === 'undefined') {
      return false;
    }

    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return true;
    }

    this.manuallyDisconnected = false;
    useConnectionStore.getState().setWsStatus('connecting');
    this.socket = this.webSocketFactory(url);

    this.socket.onopen = () => {
      const reconnected = this.reconnectAttempt > 0;
      this.reconnectAttempt = 0;
      this.onStateChange?.(this.connectionState);
      useConnectionStore.getState().setWsStatus('connected');
      if (reconnected) {
        const reconnectSnapshotEvent: BackendSocketEvent = {
          type: 'backend.snapshot',
          payload: { _reconnected: true },
          timestamp: new Date().toISOString()
        };
        this.listeners.forEach((listener) => listener(reconnectSnapshotEvent));
      }
    };

    this.socket.onmessage = (event) => {
      this.lastMessageAt = new Date().toISOString();
      useConnectionStore.getState().recordWsMessage();
      this.handleIncomingMessage(event.data);
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.onStateChange?.(this.connectionState);
      useConnectionStore.getState().setWsStatus('disconnected');
      this.scheduleReconnect(url);
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
    return true;
  }

  disconnect(): void {
    this.manuallyDisconnected = true;
    this.clearReconnectTimer();
    this.socket?.close();
    this.socket = null;
    useConnectionStore.getState().setWsStatus('disconnected');
  }

  subscribe(listener: BackendSocketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setOnStateChange(callback: (state: string) => void): void {
    this.onStateChange = callback;
  }

  onMessage(listener: (payload: unknown) => void): () => void {
    this.rawMessageListeners.add(listener);
    return () => this.rawMessageListeners.delete(listener);
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
        this.rawMessageListeners.forEach((listener) => listener(parsed));
        return;
      }

      const event = parsed as BackendSocketEvent;
      this.listeners.forEach((listener) => listener(event));
      this.rawMessageListeners.forEach((listener) => listener(event.payload));
    } catch {
      // Ignore malformed payloads to keep socket resilient.
    }
  }

  private scheduleReconnect(url: string): void {
    if (this.manuallyDisconnected) {
      return;
    }
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      return;
    }

    this.clearReconnectTimer();
    const delay = Math.min(
      Math.max(this.reconnectIntervalMs, 1_000) * 2 ** this.reconnectAttempt,
      15_000
    );
    this.reconnectAttempt += 1;
    this.onStateChange?.(this.connectionState);
    useConnectionStore.getState().setWsStatus('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.connect(url);
    }, delay);
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempt;
  }

  isOfflineMode(): boolean {
    return this.offlineMode;
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

type LegacyMessageHandler<TPayload> = (payload: TPayload) => void;
type LegacySocketFactory = (url: string) => WebSocket;

interface LegacyWebSocketClientOptions {
  webSocketFactory?: LegacySocketFactory;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
  isOnline?: () => boolean;
}

export class WebSocketClient<TPayload = unknown> {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private readonly webSocketFactory: LegacySocketFactory;
  private readonly reconnectIntervalMs: number;
  private readonly maxReconnectAttempts: number;
  private readonly isOnline: () => boolean;
  private readonly listeners = new Set<LegacyMessageHandler<TPayload>>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;
  private offlineMode = false;

  constructor(url: string, options: LegacyWebSocketClientOptions = {}) {
    this.url = url;
    this.webSocketFactory = options.webSocketFactory ?? ((nextUrl) => new WebSocket(nextUrl));
    this.reconnectIntervalMs = options.reconnectIntervalMs ?? 2_500;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? Infinity;
    this.isOnline = options.isOnline ?? (() => true);
  }

  connect(): boolean {
    if (!this.isOnline()) {
      this.offlineMode = true;
      return false;
    }

    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return true;
    }

    this.offlineMode = false;
    this.shouldReconnect = true;
    this.socket = this.webSocketFactory(this.url);
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('close', this.handleClose);
    return true;
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.removeEventListener('message', this.handleMessage);
      this.socket.removeEventListener('close', this.handleClose);
      this.socket.close();
      this.socket = null;
    }
  }

  onMessage(handler: LegacyMessageHandler<TPayload>): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  isOfflineMode(): boolean {
    return this.offlineMode;
  }

  private handleMessage = (event: Event): void => {
    if (!(event instanceof MessageEvent) || typeof event.data !== 'string') {
      return;
    }

    try {
      const payload = JSON.parse(event.data) as TPayload;
      this.listeners.forEach((listener) => listener(payload));
    } catch {
      // Ignore malformed payloads.
    }
  };

  private handleClose = (): void => {
    this.socket = null;
    if (!this.shouldReconnect) {
      return;
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectIntervalMs);
  };
}
