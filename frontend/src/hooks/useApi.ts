import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { errorMessage } from '@/services/api';

type ApiState<T> = {
  data: T | undefined;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  /** Recarrega mostrando o indicador de "puxar para atualizar". */
  refresh: () => Promise<void>;
  /** Recarrega mostrando o carregamento de tela inteira. */
  reload: () => Promise<void>;
};

/**
 * Carrega dados da API com estados de carregamento e erro padronizados.
 * Com refetchOnFocus, atualiza toda vez que a tela volta a ficar visível
 * (ex.: depois de publicar um anúncio, o painel já mostra o novo item).
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], refetchOnFocus = false): ApiState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const firstFocus = useRef(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  const execute = useCallback(
    async (mode: 'load' | 'refresh' | 'silent') => {
      if (mode === 'load') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      try {
        const result = await run();
        if (mounted.current) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted.current) setError(errorMessage(err));
      } finally {
        if (mounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [run],
  );

  useEffect(() => {
    mounted.current = true;
    void execute('load');
    return () => {
      mounted.current = false;
    };
  }, [execute]);

  useFocusEffect(
    useCallback(() => {
      if (!refetchOnFocus) return;
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void execute('silent');
    }, [execute, refetchOnFocus]),
  );

  return {
    data,
    loading,
    refreshing,
    error,
    refresh: () => execute('refresh'),
    reload: () => execute('load'),
  };
}
