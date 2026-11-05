/**
 * HTTP client for the AgriTrust API (the FastAPI backend in DTA-ADP-DASHBOARD/backend).
 *
 * Base URL: set EXPO_PUBLIC_API_URL (e.g. http://192.168.1.20:8000/api). Without it, the app
 * uses the dev machine running Metro on port 8000, which works in Expo Go on the same Wi-Fi as
 * long as the backend listens on all interfaces (`uvicorn ... --host 0.0.0.0`).
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { storage } from '@/services/storage';

function defaultApiUrl() {
  if (Platform.OS === 'web') return 'http://localhost:8000/api';
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${devHost ?? 'localhost'}:8000/api`;
}

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl()).replace(/\/$/, '');

const TOKEN_KEY = 'agritrust.token';
let token: string | null = null;
let onUnauthorized: () => void = () => {};

export const session = {
  async load() {
    token = await storage.get(TOKEN_KEY);
    return token;
  },
  async save(next: string) {
    token = next;
    await storage.set(TOKEN_KEY, next);
  },
  async clear() {
    token = null;
    await storage.remove(TOKEN_KEY);
  },
  /** Called when the API rejects the token (expired or access revoked). */
  setUnauthorizedHandler(handler: () => void) {
    onUnauthorized = handler;
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function detailMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'detail' in body) {
    const { detail } = body as { detail: unknown };
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg as string;
  }
  return fallback;
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData))
    headers.set('Content-Type', 'application/json');

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Can't reach AgriTrust. Check your internet connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, detailMessage(body, `Something went wrong (${res.status}).`));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** Full URL for an API path (used for images served behind auth). */
export const apiUrl = (path: string) => `${API_URL}${path}`;

/**
 * expo-image source for a protected API image. Images are only served to the signed-in
 * farmer, so the request carries the bearer token. Local file URIs pass through unchanged.
 */
export function imageSource(uri: string) {
  if (!uri.startsWith(API_URL) || !token) return { uri };
  return { uri, headers: { Authorization: `Bearer ${token}` } };
}

/** The API's own explanation when there is one, otherwise a friendly fallback. */
export function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError && error.message ? error.message : fallback;
}
