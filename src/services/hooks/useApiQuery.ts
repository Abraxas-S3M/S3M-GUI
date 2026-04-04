import { useEffect, useState } from 'react';

interface QueryState<TData> {
  data: TData | null;
  isLoading: boolean;
  error: Error | null;
}

export interface ApiQueryOptions {
  enabled?: boolean;
}

export const useApiQuery = <TData>(
  fetcher: () => Promise<TData>,
  deps: ReadonlyArray<unknown> = [],
  options: ApiQueryOptions = {},
): QueryState<TData> => {
  const { enabled = true } = options;
  const [state, setState] = useState<QueryState<TData>>({
    data: null,
    isLoading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    let active = true;
    setState((current) => ({ ...current, isLoading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!active) {
          return;
        }
        setState({ data, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Query failed.'),
        });
      });

    return () => {
      active = false;
    };
  }, [enabled, ...deps]);

  return state;
};
