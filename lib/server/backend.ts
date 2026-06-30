import "server-only";
import { cookies } from "next/headers";

// Server-side ONLY. This module is the single place that knows the real backend
// URL and how to obtain the bearer token. The browser never talks to the
// FastAPI backend directly: it always goes through the Next.js proxy route
// handlers (app/api/proxy/[...path]) which use these helpers.

function getBackendUrl(): string {
  const explicit = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const branch =
    process.env.RENDER_GIT_BRANCH || process.env.GITHUB_REF_NAME || "";
  let serviceId: string | undefined;

  if (branch === "main") {
    serviceId = process.env.RENDER_SERVICE_ID_PROD;
  } else if (branch === "staging" || branch === "develop") {
    serviceId = process.env.RENDER_SERVICE_ID_STAGING;
  }

  if (serviceId) {
    return `https://${serviceId}.onrender.com`;
  }

  return "https://performance-monitor-backend-prod.onrender.com";
}

export const BACKEND_API_URL = getBackendUrl();

// Name of the httpOnly cookie that stores the bearer token once Clerk auth
// succeeds. For now (auth pending) we also fall back to an env token so the
// app can talk to the backend during development.
export const TOKEN_COOKIE = "pm_token";

export async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(TOKEN_COOKIE)?.value;
  if (fromCookie) return fromCookie;
  return process.env.BACKEND_API_TOKEN ?? null;
}

export function backendUrl(path: string, search = ""): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_API_URL}${clean}${search}`;
}
