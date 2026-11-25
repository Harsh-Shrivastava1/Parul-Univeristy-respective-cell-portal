import { notifyDataChanged } from '@/hooks/useLiveLoad';

/**
 * Thin API client for the Coordinator Portal backend.
 * Sends the httpOnly JWT session cookie with every request and unwraps the
 * standard { success, data, error } envelope. No business logic lives here.
 */
// DEV-ONLY default: Vite bakes this at build time, so a production build with
// VITE_API_URL unset would otherwise ship a bundle calling the visitor's own
// machine. Undefined in production makes requests fail loudly instead.
const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.DEV ? 'http://localhost:5001/api' : undefined);

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; // some backends (TEC) also send `message`
}

/** Fail with a clear message rather than requesting "undefined/api/...". */
function baseUrl(): string {
  if (!API_BASE) throw new Error('Coordinator backend URL is not configured — set VITE_API_URL.');
  return API_BASE;
}

/**
 * Fired when the session cannot be renewed (refresh cookie expired, account
 * deleted or deactivated). The auth store clears the session and
 * ProtectedRoute sends the coordinator to /login, as the Internship Cell and
 * Admin portals do.
 */
export const SESSION_EXPIRED = 'pu:session-expired';

// Single-flight renewal: concurrent 401s share one /auth/refresh call.
let refreshInFlight: Promise<boolean> | null = null;
function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${baseUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * Auth endpoints answer 401 for a wrong password and the like, which says
 * nothing about the session; /auth/me and /auth/logout do depend on it (a
 * logout that 401s would leave the refresh cookie behind).
 */
function renewsOn401(path: string): boolean {
  return !path.startsWith('/auth/') || path === '/auth/me' || path === '/auth/logout';
}

/**
 * The access cookie lasts 15 minutes. This client used to have no renewal at
 * all: after 15 minutes every request failed while the saved session kept the
 * coordinator "logged in" with empty pages, forever. Now a 401 renews the
 * session once and retries; if it cannot be renewed the session is over.
 */
async function request<T>(path: string, method: Method = 'GET', body?: unknown, retry = true): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && retry && renewsOn401(path)) {
    if (await refreshSession()) return request<T>(path, method, body, false);
    window.dispatchEvent(new Event(SESSION_EXPIRED));
  }

  let json: ApiEnvelope<T> = { success: false };
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON response
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.message || `Request failed (${res.status})`);
  }
  // Any successful write may change what other pages show: let them refresh.
  if (method !== 'GET') notifyDataChanged();
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
  del: <T>(path: string) => request<T>(path, 'DELETE'),
};
