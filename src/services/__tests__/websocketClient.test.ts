import { afterEach, describe, expect, it, vi } from 'vitest';
import { RealtimeWebSocketClient } from '../websocketClient';

class MockSocket {
  static OPEN = 1;
  static CLOSED = 3;

  readyState = MockSocket.OPEN;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockSocket.CLOSED;
    this.onclose?.();
  });
}

describe('RealtimeWebSocketClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('delivers messages to subscribed handlers', () => {
    vi.stubGlobal('WebSocket', MockSocket as unknown as typeof WebSocket);
    const socket = new MockSocket();
    const client = new RealtimeWebSocketClient('ws://backend/ws', {
      socketFactory: () => socket as unknown as WebSocket,
      reconnectDelayMs: 20,
    });
    const handler = vi.fn();
    client.connect();
    client.subscribe<{ id: string }>('decision.updated', handler);

    socket.onmessage?.({
      data: JSON.stringify({ type: 'decision.updated', payload: { id: 'R001' } }),
    });

    expect(handler).toHaveBeenCalledWith({ id: 'R001' });
  });

  it('serializes messages before sending', () => {
    vi.stubGlobal('WebSocket', MockSocket as unknown as typeof WebSocket);
    const socket = new MockSocket();
    const client = new RealtimeWebSocketClient('ws://backend/ws', {
      socketFactory: () => socket as unknown as WebSocket,
    });
    client.connect();

    client.send({
      type: 'decision.updated',
      payload: { id: 'R001', status: 'approved' },
    });

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'decision.updated',
        payload: { id: 'R001', status: 'approved' },
      }),
    );
  });
});
