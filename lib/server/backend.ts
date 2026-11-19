import "server-only";

// Server-side ONLY. This module is the single place that resolves the backend
// URL. The browser never talks to FastAPI directly: it always goes through the
// Next.js proxy route handlers (app/api/proxy/[...path]).

function getBackendUrl(): string | null {
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

  // Never silently send local or misconfigured deployments to production.
  return null;
}

export const BACKEND_API_URL = getBackendUrl();

export function backendUrl(path: string, search = ""): string {
  if (!BACKEND_API_URL) {
    throw new Error(
      "Backend API is not configured. Set BACKEND_API_URL or the matching Render service ID.",
    );
  }
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_API_URL}${clean}${search}`;
}
