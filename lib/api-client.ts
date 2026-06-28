// Client-side API helpers. The browser ONLY ever calls our own Next.js proxy
// at /api/proxy/*. It never knows the backend URL or the bearer token.

const PROXY_BASE = "/api/proxy"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${PROXY_BASE}${path}`, {
    headers: { accept: "application/json" },
  })
  if (!res.ok) {
    throw new ApiError(`GET ${path} failed`, res.status)
  }
  return (await res.json()) as T
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${PROXY_BASE}${path}`, {
    method,
    headers: {
      accept: "application/json",
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    throw new ApiError(`${method} ${path} failed`, res.status)
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

// Wrap a GET with an offline fallback so the UI stays demonstrable when the
// backend is unreachable. Returns { data, isFallback }.
export async function getWithFallback<T>(
  path: string,
  fallback: T,
): Promise<{ data: T; isFallback: boolean }> {
  try {
    const data = await apiGet<T>(path)
    return { data, isFallback: false }
  } catch {
    return { data: fallback, isFallback: true }
  }
}
