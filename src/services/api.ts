let inMemoryToken: string | null = null;

function getToken(): string | null {
  return inMemoryToken;
}

export function setToken(token: string): void {
  inMemoryToken = token;
}

export function clearToken(): void {
  inMemoryToken = null;
}

interface RequestOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

let isRefreshing = false;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const token = getToken();
  const headers: Record<string, string> = {
    ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`/api${path}`, { ...fetchOptions, headers, credentials: 'include' });

  if (response.status === 401 && !isRefreshing) {
    // Try to refresh the token
    isRefreshing = true;
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshResponse.ok) {
        const { token: newToken } = await refreshResponse.json();
        setToken(newToken);
        isRefreshing = false;
        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(`/api${path}`, { ...fetchOptions, headers, credentials: 'include' });
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ message: 'Request failed' }));
          throw new Error(error.message || `HTTP ${retryResponse.status}`);
        }
        if (retryResponse.status === 204) return undefined as T;
        return retryResponse.json();
      }
    } catch {
      // refresh failed
    }
    isRefreshing = false;
    clearToken();
    if (!skipAuthRedirect) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (response.status === 401) {
    if (!skipAuthRedirect) {
      clearToken();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(path: string, options?: { skipAuthRedirect?: boolean }) =>
    request<T>(path, options),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
