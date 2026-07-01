// app/api/proxy/[...path]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { backendUrl, getBearerToken } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

async function forward(req: NextRequest, path: string[]) {
  const targetPath = path.join("/");
  const search = req.nextUrl.search;
  const token = await getBearerToken();

  // Si no hay token, devolver 401 (la lógica de autenticación ya está en el middleware, pero por si acaso)
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers = new Headers();
  headers.set("accept", "application/json");
  headers.set("authorization", `Bearer ${token}`);

  // Propagar otros headers importantes (content-type, etc.)
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  // Abort slow requests so the client can fall back fast (Render cold starts
  // can otherwise hang for ~30s).
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
    signal: controller.signal,
    // body se añade solo si no es GET/HEAD
  };

  // Manejar el body para métodos que no son GET/HEAD
  if (!["GET", "HEAD"].includes(req.method)) {
    const body = await req.text();
    if (body) init.body = body;
  }

  try {
    const url = backendUrl(`/${targetPath}`, search);
    const res = await fetch(url, init);
    const text = await res.text();
    const contentTypeRes =
      res.headers.get("content-type") ?? "application/json";

    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentTypeRes },
    });
  } catch (error) {
    console.error("[Proxy] Error forwarding request:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Backend unreachable", detail: message },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return forward(req, path);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return forward(req, path);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return forward(req, path);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return forward(req, path);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  return forward(req, path);
}
