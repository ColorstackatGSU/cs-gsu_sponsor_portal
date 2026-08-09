import { supabase } from './supabase';

/**
 * The one place we call the Spring API. Attaches the current Supabase access
 * token to every request as a Bearer, and throws a structured error on non-2xx
 * so callers can render it without parsing status codes by hand.
 *
 * Not using axios because the app only needs GET/POST/etc with a bearer, and a
 * tiny fetch wrapper avoids another dependency to keep patched.
 */

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL must be set. Copy .env.example to .env.local and fill it in.');
}

export class ApiError extends Error {
  // Explicit fields rather than parameter-property shorthand: tsconfig's
  // erasableSyntaxOnly refuses the shorthand because it emits runtime code that
  // cannot be stripped by a pure type-erasure step.
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Grab the token fresh each call rather than caching. Supabase auto-refreshes
  // the session on a timer, and reading from the client is O(1). Caching a token
  // means we hold a stale one across a refresh.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    // Read the body once, tolerate non-JSON error pages (Tomcat can 401 with HTML).
    let body: unknown = null;
    try {
      const text = await res.text();
      if (text) body = JSON.parse(text);
    } catch {
      // Keep body as null; we still have the status code.
    }
    throw new ApiError(res.status, body, `${res.status} ${res.statusText}`);
  }

  // 204 has no body; typing it as T is the caller's problem.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body == null ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body == null ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
