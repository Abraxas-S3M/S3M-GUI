import { renderHook, waitFor, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useOperationalContext } from '../useOperationalContext'

describe('useOperationalContext integration with mock backend', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches data on mount and returns parsed operational context', async () => {
    const mockPayload = {
      operationId: 'op-1',
      status: 'active',
      updatedAt: new Date().toISOString(),
    }
    const get = vi.fn().mockResolvedValue({
      data: mockPayload,
      status: 200,
      headers: {},
    })

    const client = { get }
    const { result } = renderHook(() => useOperationalContext(client))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual(mockPayload)
    expect(get).toHaveBeenCalledWith('/operational-context')
  })

  it('stops refresh polling after unmount', async () => {
    vi.useFakeTimers()

    const get = vi.fn().mockResolvedValue({
      data: { operationId: 'op-2', status: 'standby', updatedAt: '2026-01-01T00:00:00.000Z' },
      status: 200,
      headers: {},
    })
    const client = { get }

    const { unmount } = renderHook(() =>
      useOperationalContext(client, { refreshIntervalMs: 100 }),
    )

    await act(async () => {
      await Promise.resolve()
    })
    expect(get).toHaveBeenCalledTimes(1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(220)
    })
    expect(get).toHaveBeenCalledTimes(3)

    unmount()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    expect(get).toHaveBeenCalledTimes(3)
  })

  it('supports manual and interval refresh logic', async () => {
    vi.useFakeTimers()

    const get = vi.fn().mockResolvedValue({
      data: { operationId: 'op-3', status: 'paused', updatedAt: '2026-01-01T00:00:00.000Z' },
      status: 200,
      headers: {},
    })
    const client = { get }

    const { result, unmount } = renderHook(() =>
      useOperationalContext(client, { refreshIntervalMs: 100 }),
    )

    await act(async () => {
      await Promise.resolve()
    })
    expect(get).toHaveBeenCalledTimes(1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(get).toHaveBeenCalledTimes(3)

    await act(async () => {
      await result.current.refresh()
    })
    expect(get).toHaveBeenCalledTimes(4)
    unmount()
  })

  it('surfaces backend errors without crashing', async () => {
    const get = vi.fn().mockRejectedValue(new Error('mock backend unavailable'))
    const client = { get }

    const { result } = renderHook(() => useOperationalContext(client))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toContain('mock backend unavailable')
  })
})
