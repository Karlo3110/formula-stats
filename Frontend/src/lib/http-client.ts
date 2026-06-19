import { clientConfig } from '@/lib/config/client-config';
import { getAccessToken, setAccessToken } from '@/lib/auth-session';
import { ApiError, type ApiErrorBody } from '@/types/api.types';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Skip the automatic access-token refresh-and-retry on 401. */
  skipAuthRefresh?: boolean;
}

const REFRESH_PATH = '/auth/refresh';

interface RefreshResponse {
  accessToken: string;
}

// Single-flight refresh so concurrent 401s trigger only one refresh call.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= (async (): Promise<boolean> => {
    try {
      const response = await fetch(`${clientConfig.apiUrl}/api/v1${REFRESH_PATH}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        setAccessToken(null);
        return false;
      }
      const data = (await response.json()) as RefreshResponse;
      setAccessToken(data.accessToken);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function request<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${clientConfig.apiUrl}/api/v1${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: buildHeaders(),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (
    response.status === 401 &&
    !options.skipAuthRefresh &&
    path !== REFRESH_PATH
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<TResponse>(path, { ...options, skipAuthRefresh: true });
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }
  return (await response.json()) as TResponse;
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new ApiError(
      body.status ?? response.status,
      body.code ?? 'ERROR',
      body.detail ?? response.statusText,
      body.errors,
    );
  } catch {
    return new ApiError(response.status, 'ERROR', response.statusText);
  }
}

export const httpClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' }),
} as const;
