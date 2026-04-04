import { useCallback, useEffect, useRef, useState } from 'react'

import type { APIClient, APIClientError } from '../client'

export interface OperationalContext {
  operationId: string
  status: string
  updatedAt: string
}

interface HookState {
  data: OperationalContext | null
  isLoading: boolean
  error: string | null
}

interface HookOptions {
  refreshIntervalMs?: number
}

export function useOperationalContext(
  client: Pick<APIClient, 'get'>,
  options: HookOptions = {},
) {
  const [state, setState] = useState<HookState>({
    data: null,
    isLoading: true,
    error: null,
  })
  const isMounted = useRef(true)
  const refreshIntervalMs = options.refreshIntervalMs ?? 0

  const fetchContext = useCallback(async () => {
    setState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
    }))

    try {
      const response = await client.get<OperationalContext>('/operational-context')
      if (!isMounted.current) {
        return
      }

      setState({
        data: response.data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      if (!isMounted.current) {
        return
      }

      const message = (error as APIClientError)?.message ?? 'Failed to fetch operational context'
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: message,
      }))
    }
  }, [client])

  useEffect(() => {
    void fetchContext()
    if (refreshIntervalMs <= 0) {
      return () => {
        isMounted.current = false
      }
    }

    const interval = setInterval(() => {
      void fetchContext()
    }, refreshIntervalMs)

    return () => {
      isMounted.current = false
      clearInterval(interval)
    }
  }, [fetchContext, refreshIntervalMs])

  return {
    ...state,
    refresh: fetchContext,
  }
}
