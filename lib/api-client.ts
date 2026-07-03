// lib/api/api-client.ts
const PROXY_BASE = "/api/proxy";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function apiGet<T>(
  path: string,
  options?: { signal?: AbortSignal; token?: string },
): Promise<T> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (options?.token) {
    headers["authorization"] = `Bearer ${options.token}`;
  }
  const res = await fetch(`${PROXY_BASE}${path}`, {
    headers,
    signal: options?.signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(`GET ${path} failed: ${res.status} ${text}`, res.status);
  }
  return (await res.json()) as T;
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  options?: { signal?: AbortSignal; token?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    accept: "application/json",
    ...(body ? { "content-type": "application/json" } : {}),
  };
  if (options?.token) {
    headers["authorization"] = `Bearer ${options.token}`;
  }
  const res = await fetch(`${PROXY_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(
      `${method} ${path} failed: ${res.status} ${text}`,
      res.status,
    );
  }
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// Wrap a GET with an offline fallback so the UI stays demonstrable when the
// backend is unreachable. Returns { data, isFallback }.
export async function getWithFallback<T>(
  path: string,
  options?: { signal?: AbortSignal; token?: string },
): Promise<{ data: T | null; isFallback: boolean }> {
  try {
    const data = await apiGet<T>(path, options);
    return { data, isFallback: false };
  } catch {
    return { data: null, isFallback: true };
  }
}

// Helper para peticiones con timeout (opcional)
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new ApiError(`Request timeout after ${ms}ms`, 408)),
      ms,
    ),
  );
  return Promise.race([promise, timeout]);
}
