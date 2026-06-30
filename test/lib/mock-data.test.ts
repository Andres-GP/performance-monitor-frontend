import {
  mockAlerts,
  mockCapitalSummary,
  mockEquityCurve,
  mockMarketRegime,
  mockMetricsFor,
  mockPortfolioMetrics,
  mockPortfolioWeights,
  mockStrategies,
  mockTradesFor,
} from "@/lib/mock-data"

describe("mock fixtures", () => {
  it("exposes strategies with required fields", () => {
    expect(mockStrategies.length).toBeGreaterThan(0)
    for (const s of mockStrategies) {
      expect(s.id).toBeTruthy()
      expect(typeof s.win_rate).toBe("number")
      expect(["Running", "Stopped"]).toContain(s.status)
    }
  })

  it("builds a 31-point equity curve", () => {
    expect(mockEquityCurve).toHaveLength(31)
    expect(mockEquityCurve[0]).toHaveProperty("equity")
    expect(mockEquityCurve[0]).toHaveProperty("timestamp")
  })

  it("capital summary total is positive", () => {
    expect(mockCapitalSummary.total).toBeGreaterThan(0)
    expect(mockCapitalSummary.accounts.length).toBeGreaterThan(0)
  })

  it("market regime has numeric indicators", () => {
    expect(typeof mockMarketRegime.adx).toBe("number")
    expect(typeof mockMarketRegime.vix_percentile).toBe("number")
  })

  it("portfolio weights and metrics are present", () => {
    expect(mockPortfolioWeights.length).toBe(mockStrategies.length)
    expect(mockPortfolioMetrics.correlation_matrix?.matrix.length).toBe(4)
    expect(mockPortfolioMetrics.drawdown_series?.length).toBe(31)
  })

  it("alerts contain a severity", () => {
    expect(mockAlerts.length).toBeGreaterThan(0)
    for (const a of mockAlerts) {
      expect(["high", "medium", "low"]).toContain(a.severity)
    }
  })
})

describe("mockMetricsFor", () => {
  it("uses the strategy's capital as the starting equity base", () => {
    const metrics = mockMetricsFor("str-001")
    expect(metrics).toHaveLength(31)
  })

  it("falls back to a default base for unknown strategies", () => {
    const metrics = mockMetricsFor("does-not-exist")
    expect(metrics).toHaveLength(31)
  })
})

describe("mockTradesFor", () => {
  it("returns 40 trades scoped to the strategy", () => {
    const trades = mockTradesFor("str-002")
    expect(trades).toHaveLength(40)
    expect(trades.every((t) => t.strategy_id === "str-002")).toBe(true)
    expect(trades.every((t) => t.side === "long" || t.side === "short")).toBe(true)
  })

  it("defaults the symbol for unknown strategies", () => {
    const trades = mockTradesFor("unknown")
    expect(trades[0].symbol).toBe("ES")
  })
})
