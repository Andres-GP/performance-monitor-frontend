/**
 * @jest-environment node
 */
describe("lib/server/backend", () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
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

  it("rejects malformed and insecure remote backend URLs", async () => {
    process.env.BACKEND_API_URL = "https"
    const { BACKEND_API_URL } = await import("@/lib/server/backend")
    expect(BACKEND_API_URL).toBeNull()
  })

  it("does not silently select production when backend env is unset", async () => {
    delete process.env.BACKEND_API_URL
    delete process.env.RENDER_GIT_BRANCH
    delete process.env.GITHUB_REF_NAME
    delete process.env.RENDER_SERVICE_ID_PROD
    delete process.env.RENDER_SERVICE_ID_STAGING
    const { BACKEND_API_URL } = await import("@/lib/server/backend")
    expect(BACKEND_API_URL).toBeNull()
  })

  it("selects the staging Render service for staging branches", async () => {
    delete process.env.BACKEND_API_URL
    process.env.RENDER_GIT_BRANCH = "develop"
    process.env.RENDER_SERVICE_ID_STAGING = "staging-service"
    const { BACKEND_API_URL } = await import("@/lib/server/backend")
    expect(BACKEND_API_URL).toBe("https://staging-service.onrender.com")
  })

  it("selects the production Render service only for main", async () => {
    delete process.env.BACKEND_API_URL
    process.env.RENDER_GIT_BRANCH = "main"
    process.env.RENDER_SERVICE_ID_PROD = "production-service"
    const { BACKEND_API_URL } = await import("@/lib/server/backend")
    expect(BACKEND_API_URL).toBe("https://production-service.onrender.com")
  })

  it("requires backend configuration when building a proxy URL", async () => {
    delete process.env.BACKEND_API_URL
    delete process.env.RENDER_GIT_BRANCH
    delete process.env.GITHUB_REF_NAME
    delete process.env.RENDER_SERVICE_ID_PROD
    delete process.env.RENDER_SERVICE_ID_STAGING
    const { backendUrl } = await import("@/lib/server/backend")
    expect(() => backendUrl("/health")).toThrow(/Backend API is not configured/)
  })

})
