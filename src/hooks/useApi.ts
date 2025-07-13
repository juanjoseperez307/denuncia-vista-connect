import { useState, useEffect, useCallback } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useAsyncAction<T = any>(): {
  execute: (action: () => Promise<T>) => Promise<T | null>;
  loading: boolean;
  error: string | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (action: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await action();
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  return { execute, loading, error };
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (offset: number, limit: number) => Promise<{ data: T[]; total: number }>,
  limit: number = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(data.length, limit);
      setData(prev => [...prev, ...result.data]);
      setTotal(result.total);
      setHasMore(data.length + result.data.length < result.total);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall, data.length, hasMore, limit, loading]);

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    setTotal(0);
    setError(null);
  }, []);

  useEffect(() => {
    loadMore();
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    reset,
  };
}