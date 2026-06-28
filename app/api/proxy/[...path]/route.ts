import { type NextRequest, NextResponse } from "next/server"
import { backendUrl, getBearerToken } from "@/lib/server/backend"

// Catch-all server-side proxy. Every browser request to /api/proxy/* is
// forwarded here to the FastAPI backend with the Authorization header injected
// on the server. The backend URL and token are never exposed to the client.

export const dynamic = "force-dynamic"

async function forward(req: NextRequest, path: string[]) {
  const targetPath = path.join("/")
  const search = req.nextUrl.search
  const token = await getBearerToken()

  const headers = new Headers()
  headers.set("accept", "application/json")
  if (token) headers.set("authorization", `Bearer ${token}`)

  // Abort slow requests so the client can fall back fast (Render cold starts
  // can otherwise hang for ~30s).
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
    signal: controller.signal,
  }

  if (!["GET", "HEAD"].includes(req.method)) {
    const contentType = req.headers.get("content-type")
    if (contentType) headers.set("content-type", contentType)
    const body = await req.text()
    if (body) init.body = body
  }

  try {
    const res = await fetch(backendUrl(`/${targetPath}`, search), init)
    const text = await res.text()
    const contentType = res.headers.get("content-type") ?? "application/json"

    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentType },
    })
  } catch (error) {
    console.log("[v0] proxy error:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: "Backend unreachable", detail: String(error) },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  const { path } = await params
  return forward(req, path)
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { path } = await params
  return forward(req, path)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { path } = await params
  return forward(req, path)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { path } = await params
  return forward(req, path)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { path } = await params
  return forward(req, path)
}
