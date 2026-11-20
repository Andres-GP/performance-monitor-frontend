import "server-only";

// Server-side ONLY. This module is the single place that resolves the backend
// URL. The browser never talks to FastAPI directly: it always goes through the
// Next.js proxy route handlers (app/api/proxy/[...path]).

function getBackendUrl(): string | null {
  const explicit = process.env.BACKEND_API_URL?.trim();
  if (explicit) return normalizeBackendUrl(explicit);

  const branch =
    process.env.RENDER_GIT_BRANCH || process.env.GITHUB_REF_NAME || "";
  let serviceId: string | undefined;

  if (branch === "main") {
    serviceId = process.env.RENDER_SERVICE_ID_PROD;
  } else if (branch === "staging" || branch === "develop") {
    serviceId = process.env.RENDER_SERVICE_ID_STAGING;
  }

  if (serviceId && /^[a-z0-9][a-z0-9-]*$/i.test(serviceId)) {
    return `https://${serviceId}.onrender.com`;
  }

  // Never silently send local or misconfigured deployments to production.
  return null;
}

function normalizeBackendUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (
      (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
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
