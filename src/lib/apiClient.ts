/**
 * Thin API client for the Coordinator Portal backend.
 * Sends the httpOnly JWT session cookie with every request and unwraps the
 * standard { success, data, error } envelope. No business logic lives here.
 */
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5001/api';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; // some backends (TEC) also send `message`
}

async function request<T>(path: string, method: Method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let json: ApiEnvelope<T> = { success: false };
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON response
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.message || `Request failed (${res.status})`);
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
  del: <T>(path: string) => request<T>(path, 'DELETE'),
};
