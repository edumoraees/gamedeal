import { API_URL, REQUEST_TIMEOUT_MS } from './config';
import { tokenStorage } from './tokenStorage';
import type { ApiErrorBody } from '@/types/api';

/** Erro padronizado para as telas: sempre tem uma mensagem pronta para mostrar ao usuário. */
export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  /** Mensagem completa (inclui erros de validação campo a campo, quando houver). */
  get fullMessage(): string {
    return this.details.length ? `${this.message}\n• ${this.details.join('\n• ')}` : this.message;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** FormData para upload de arquivos (não serializa como JSON). */
  formData?: FormData;
};

/** Chamado quando a API responde 401 em rota protegida (token expirado): o AuthContext faz logout. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_URL}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return params ? `${url}?${params}` : url;
}

/**
 * Cliente HTTP único do app. Todas as chamadas passam pelo API Gateway.
 * - Anexa o JWT nas rotas protegidas (/ws/...).
 * - Aplica timeout.
 * - Converte qualquer falha em ApiError com mensagem amigável em português.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, formData } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (path.startsWith('/ws/')) {
    const token = await tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    throw new ApiError(
      0,
      aborted
        ? 'O servidor demorou para responder. Tente novamente.'
        : 'Não foi possível conectar ao servidor. Verifique sua internet e se o backend está rodando.',
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined;
    }
  }

  if (!response.ok) {
    const errorBody = data as Partial<ApiErrorBody> | undefined;
    if (response.status === 401 && path.startsWith('/ws/')) onUnauthorized?.();
    throw new ApiError(response.status, errorBody?.message ?? defaultMessage(response.status), errorBody?.details ?? []);
  }

  return data as T;
}

function defaultMessage(status: number): string {
  if (status === 401) return 'Sua sessão expirou. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 503) return 'Serviço temporariamente indisponível. Tente novamente em instantes.';
  if (status >= 500) return 'Erro no servidor. Tente novamente mais tarde.';
  return 'Não foi possível concluir a operação.';
}

/** Extrai uma mensagem legível de qualquer erro (para Alert/toast). */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.fullMessage;
  if (err instanceof Error) return err.message;
  return 'Algo deu errado. Tente novamente.';
}
