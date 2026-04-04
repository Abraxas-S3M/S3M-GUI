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

    const { result } = renderHook(() => useOperationalContext({ get }))

    expect(result.current.isLoading).toBe(true)
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

    const { unmount } = renderHook(() =>
      useOperationalContext({ get }, { refreshIntervalMs: 100 }),
    )

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1))
    await vi.advanceTimersByTimeAsync(220)
    await waitFor(() => expect(get).toHaveBeenCalledTimes(3))

    unmount()
    await vi.advanceTimersByTimeAsync(400)

    expect(get).toHaveBeenCalledTimes(3)
  })

  it('supports manual and interval refresh logic', async () => {
    vi.useFakeTimers()

    const get = vi.fn().mockResolvedValue({
      data: { operationId: 'op-3', status: 'paused', updatedAt: '2026-01-01T00:00:00.000Z' },
      status: 200,
      headers: {},
    })

    const { result } = renderHook(() =>
      useOperationalContext({ get }, { refreshIntervalMs: 100 }),
    )

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1))
    await vi.advanceTimersByTimeAsync(200)
    await waitFor(() => expect(get).toHaveBeenCalledTimes(3))

    await act(async () => {
      await result.current.refresh()
    })
    expect(get).toHaveBeenCalledTimes(4)
  })

  it('surfaces backend errors without crashing', async () => {
    const get = vi.fn().mockRejectedValue(new Error('mock backend unavailable'))

    const { result } = renderHook(() => useOperationalContext({ get }))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toContain('mock backend unavailable')
  })
})
