/**
 * @jest-environment node
 */
const cookieGet = jest.fn()

jest.mock("next/headers", () => ({
  cookies: async () => ({ get: cookieGet }),
}))

describe("lib/server/backend", () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    cookieGet.mockReset()
    process.env = { ...ORIGINAL_ENV }
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it("backendUrl joins base + path and trims duplicate slashes", async () => {
    process.env.BACKEND_API_URL = "https://api.example.com/"
    const { backendUrl } = await import("@/lib/server/backend")
    expect(backendUrl("/strategies")).toBe("https://api.example.com/strategies")
    expect(backendUrl("alerts", "?limit=5")).toBe("https://api.example.com/alerts?limit=5")
  })

  it("falls back to the default backend URL when env is unset", async () => {
    delete process.env.BACKEND_API_URL
    const { BACKEND_API_URL } = await import("@/lib/server/backend")
    expect(BACKEND_API_URL).toContain("performance-monitor-backend")
  })

  it("prefers the token cookie over the env token", async () => {
    process.env.BACKEND_API_TOKEN = "env-token"
    cookieGet.mockReturnValue({ value: "cookie-token" })
    const { getBearerToken } = await import("@/lib/server/backend")
    expect(await getBearerToken()).toBe("cookie-token")
  })

  it("uses the env token when no cookie is present", async () => {
    process.env.BACKEND_API_TOKEN = "env-token"
    cookieGet.mockReturnValue(undefined)
    const { getBearerToken } = await import("@/lib/server/backend")
    expect(await getBearerToken()).toBe("env-token")
  })

  it("returns null when neither cookie nor env token exist", async () => {
    delete process.env.BACKEND_API_TOKEN
    cookieGet.mockReturnValue(undefined)
    const { getBearerToken } = await import("@/lib/server/backend")
    expect(await getBearerToken()).toBeNull()
  })
})
