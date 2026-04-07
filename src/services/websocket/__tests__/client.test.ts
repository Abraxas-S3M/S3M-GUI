// @ts-nocheck
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WebSocketClient } from '../client'

type Listener = (event: Event | MessageEvent) => void

class MockWebSocket {
  readyState = 1
  sent: string[] = []
  closed = false
  private listeners = new Map<string, Set<Listener>>()

  addEventListener(type: string, listener: Listener): void {
    const existing = this.listeners.get(type) ?? new Set<Listener>()
    existing.add(listener)
    this.listeners.set(type, existing)
  }

  removeEventListener(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener)
  }

  send(payload: string): void {
    this.sent.push(payload)
  }

  close(): void {
    this.closed = true
    this.readyState = 3
    this.emit('close', new Event('close'))
  }

  emit(type: string, event: Event | MessageEvent): void {
    const listeners = this.listeners.get(type)
    if (!listeners) {
      return
    }

    for (const listener of listeners) {
      listener(event)
    }
  }
}

describe('WebSocketClient integration with mock backend', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('handles connection and disconnection', () => {
    const sockets: MockWebSocket[] = []
    const factory = vi.fn(() => {
      const socket = new MockWebSocket()
      sockets.push(socket)
      return socket as unknown as WebSocket
    })

    const client = new WebSocketClient('wss://mock.local/events', {
      webSocketFactory: factory,
      isOnline: () => true,
    })

    expect(client.connect()).toBe(true)
    expect(factory).toHaveBeenCalledOnce()

    client.disconnect()
    expect(sockets[0].closed).toBe(true)
  })

  it('parses and dispatches message payloads', () => {
    const socket = new MockWebSocket()
    const client = new WebSocketClient<{ id: string }>('wss://mock.local/events', {
      webSocketFactory: () => socket as unknown as WebSocket,
      isOnline: () => true,
    })

    client.connect()
    const onMessage = vi.fn()
    client.onMessage(onMessage)

    socket.emit('message', new MessageEvent('message', { data: JSON.stringify({ id: 'evt-1' }) }))
    socket.emit('message', new MessageEvent('message', { data: '{not-json' }))

    expect(onMessage).toHaveBeenCalledTimes(1)
    expect(onMessage).toHaveBeenCalledWith({ id: 'evt-1' })
  })

  it('attempts reconnection after unplanned disconnect', async () => {
    vi.useFakeTimers()
    const sockets: MockWebSocket[] = []
    const factory = vi.fn(() => {
      const socket = new MockWebSocket()
      sockets.push(socket)
      return socket as unknown as WebSocket
    })

    const client = new WebSocketClient('wss://mock.local/events', {
      webSocketFactory: factory,
      reconnectIntervalMs: 50,
      maxReconnectAttempts: 2,
      isOnline: () => true,
    })

    client.connect()
    sockets[0].emit('close', new Event('close'))

    await vi.advanceTimersByTimeAsync(50)

    expect(factory).toHaveBeenCalledTimes(2)
    expect(client.getReconnectAttempts()).toBe(1)
  })

  it('enters offline mode and avoids connecting when offline', () => {
    const factory = vi.fn(() => new MockWebSocket() as unknown as WebSocket)

    const client = new WebSocketClient('wss://mock.local/events', {
      webSocketFactory: factory,
      isOnline: () => false,
    })

    expect(client.connect()).toBe(false)
    expect(factory).not.toHaveBeenCalled()
    expect(client.isOfflineMode()).toBe(true)
  })
})
