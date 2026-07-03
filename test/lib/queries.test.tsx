import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"

import {
  qk,
  useAlerts,
  useDeleteStrategy,
  useMarketRegime,
  useStrategies,
  useStrategy,
  useTrades,
} from "@/lib/queries"

// Mock Clerk's useAuth hook
jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue("mock-token"),
    isLoaded: true,
    isSignedIn: true,
  }),
}))

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockGetWithFallback = jest.fn()
const mockApiSend = jest.fn()
jest.mock("@/lib/api-client", () => ({
  getWithFallback: (...args: unknown[]) => mockGetWithFallback(...args),
  apiSend: (...args: unknown[]) => mockApiSend(...args),
}))

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe("query keys", () => {
  it("builds stable, scoped keys", () => {
    expect(qk.strategies).toEqual(["strategies"])
    expect(qk.strategy("a")).toEqual(["strategies", "a"])
    expect(qk.trades("a")).toEqual(["strategies", "a", "trades"])
    expect(qk.alerts(50)).toEqual(["alerts", 50])
  })
})

describe("query hooks", () => {
  beforeEach(() => {
    mockGetWithFallback.mockReset()
    mockApiSend.mockReset()
  })

  it("useStrategies returns fetched data", async () => {
    const payload = { data: [{ id: "str-1" }], isFallback: false }
    mockGetWithFallback.mockResolvedValueOnce(payload as never)

    const { result } = renderHook(() => useStrategies(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(payload)
    expect(mockGetWithFallback).toHaveBeenCalledWith("/strategies", expect.anything(), expect.objectContaining({ token: "mock-token" }))
  })

  it("useStrategy derives a single strategy from the list", async () => {
    mockGetWithFallback.mockResolvedValueOnce({
      data: [{ id: "str-1", name: "One" }],
      isFallback: true,
    } as never)

    const { result } = renderHook(() => useStrategy("str-1"), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.strategy).toBeDefined())
    expect(result.current.strategy).toMatchObject({ id: "str-1" })
    expect(result.current.isFallback).toBe(true)
  })

  it("useTrades fetches trades for the given id", async () => {
    mockGetWithFallback.mockResolvedValueOnce({ data: [], isFallback: false } as never)
    const { result } = renderHook(() => useTrades("str-9"), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetWithFallback).toHaveBeenCalledWith("/strategies/str-9/trades", expect.anything(), expect.objectContaining({ token: "mock-token" }))
  })

  it("useAlerts honors the limit argument in the request path", async () => {
    mockGetWithFallback.mockResolvedValueOnce({ data: [], isFallback: false } as never)
    const { result } = renderHook(() => useAlerts(25), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetWithFallback).toHaveBeenCalledWith("/alerts?limit=25", expect.anything(), expect.objectContaining({ token: "mock-token" }))
  })

  it("useMarketRegime fetches the regime endpoint", async () => {
    mockGetWithFallback.mockResolvedValueOnce({ data: { adx: 1 }, isFallback: false } as never)
    const { result } = renderHook(() => useMarketRegime(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetWithFallback).toHaveBeenCalledWith("/market/regime", expect.anything(), expect.objectContaining({ token: "mock-token" }))
  })

  it("useDeleteStrategy calls the DELETE endpoint", async () => {
    mockApiSend.mockResolvedValueOnce({} as never)
    const { result } = renderHook(() => useDeleteStrategy(), { wrapper: createWrapper() })
    result.current.mutate("str-3")
    await waitFor(() => expect(mockApiSend).toHaveBeenCalledWith("/strategies/str-3", "DELETE", undefined, expect.objectContaining({ token: "mock-token" })))
  })
})
