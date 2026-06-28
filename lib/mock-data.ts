import type {
  Alert,
  CapitalSummary,
  MarketRegime,
  PerformanceMetric,
  PortfolioMetrics,
  PortfolioWeight,
  Strategy,
  Trade,
} from "@/types"

// Offline / fallback fixtures. Used by the client fetcher when the backend is
// unreachable (e.g. cold-started Render instance or missing token) so the UI
// stays fully demonstrable. Real data always takes precedence.

export const mockStrategies: Strategy[] = [
  {
    id: "str-001",
    name: "Momentum Breakout",
    instrument: "ES",
    platform: "NT8",
    status: "Running",
    health_status: "healthy",
    win_rate: 0.62,
    profit_factor: 1.84,
    drawdown: 0.083,
    trades_count: 412,
    sharpe: 1.9,
    capital: 48000,
    updated_at: "2026-06-26T18:30:00Z",
  },
  {
    id: "str-002",
    name: "Mean Reversion EU",
    instrument: "EURUSD",
    platform: "MT5",
    status: "Running",
    health_status: "edge_decay",
    win_rate: 0.55,
    profit_factor: 1.21,
    drawdown: 0.142,
    trades_count: 1180,
    sharpe: 0.94,
    capital: 32000,
    updated_at: "2026-06-26T17:05:00Z",
  },
  {
    id: "str-003",
    name: "Gap Fade NQ",
    instrument: "NQ",
    platform: "NT8",
    status: "Stopped",
    health_status: "unhealthy",
    win_rate: 0.48,
    profit_factor: 0.92,
    drawdown: 0.236,
    trades_count: 256,
    sharpe: -0.2,
    capital: 15000,
    updated_at: "2026-06-25T21:12:00Z",
  },
  {
    id: "str-004",
    name: "Trend Rider Gold",
    instrument: "XAUUSD",
    platform: "MT5",
    status: "Running",
    health_status: "healthy",
    win_rate: 0.58,
    profit_factor: 2.05,
    drawdown: 0.061,
    trades_count: 540,
    sharpe: 2.3,
    capital: 60000,
    updated_at: "2026-06-26T19:00:00Z",
  },
]

function buildEquityCurve(days: number, start: number): PerformanceMetric[] {
  const out: PerformanceMetric[] = []
  let equity = start
  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    equity += (Math.sin(i / 3) + (Math.random() - 0.4)) * (start * 0.01)
    out.push({
      timestamp: new Date(now - i * 86400000).toISOString(),
      equity: Math.round(equity),
      win_rate: 0.5 + Math.random() * 0.15,
      profit_factor: 1 + Math.random(),
      drawdown: Math.random() * 0.15,
      sharpe: 0.5 + Math.random() * 2,
    })
  }
  return out
}

export const mockEquityCurve: PerformanceMetric[] = buildEquityCurve(30, 150000)

export function mockMetricsFor(strategyId: string): PerformanceMetric[] {
  const start = mockStrategies.find((s) => s.id === strategyId)?.capital ?? 40000
  return buildEquityCurve(30, start)
}

export function mockTradesFor(strategyId: string): Trade[] {
  const out: Trade[] = []
  const now = Date.now()
  for (let i = 0; i < 40; i++) {
    const pnl = Math.round((Math.random() - 0.42) * 800)
    out.push({
      id: `${strategyId}-t${i}`,
      strategy_id: strategyId,
      symbol: mockStrategies.find((s) => s.id === strategyId)?.instrument ?? "ES",
      side: Math.random() > 0.5 ? "long" : "short",
      entry_price: 4500 + Math.random() * 100,
      exit_price: 4500 + Math.random() * 100,
      quantity: 1 + Math.floor(Math.random() * 3),
      pnl,
      entry_time: new Date(now - i * 3600000 * 5).toISOString(),
      exit_time: new Date(now - i * 3600000 * 5 + 3600000).toISOString(),
    })
  }
  return out
}

export const mockAlerts: Alert[] = [
  {
    id: "al-001",
    strategy_id: "str-002",
    strategy_name: "Mean Reversion EU",
    problem: "Edge decay detected",
    details: "OOS profit factor dropped below 1.2 over the last 100 trades.",
    severity: "high",
    read: false,
    timestamp: "2026-06-26T18:45:00Z",
  },
  {
    id: "al-002",
    strategy_id: "str-003",
    strategy_name: "Gap Fade NQ",
    problem: "Max drawdown breach",
    details: "Drawdown exceeded 22% threshold.",
    severity: "high",
    read: false,
    timestamp: "2026-06-26T14:20:00Z",
  },
  {
    id: "al-003",
    strategy_id: "str-001",
    strategy_name: "Momentum Breakout",
    problem: "Win rate dip",
    details: "Win rate fell to 54% over last 20 trades.",
    severity: "medium",
    read: true,
    timestamp: "2026-06-26T09:10:00Z",
  },
  {
    id: "al-004",
    strategy_id: "str-004",
    strategy_name: "Trend Rider Gold",
    problem: "Latency warning",
    details: "Average fill latency above 250ms.",
    severity: "low",
    read: true,
    timestamp: "2026-06-25T22:30:00Z",
  },
  {
    id: "al-005",
    strategy_id: "str-002",
    strategy_name: "Mean Reversion EU",
    problem: "Slippage spike",
    details: "Slippage doubled vs 30-day average.",
    severity: "medium",
    read: false,
    timestamp: "2026-06-25T16:05:00Z",
  },
]

export const mockCapitalSummary: CapitalSummary = {
  total: 155000,
  accounts: [
    { account_type: "real", capital: 92000 },
    { account_type: "funded", capital: 48000 },
    { account_type: "demo", capital: 15000 },
  ],
}

export const mockMarketRegime: MarketRegime = {
  trend: "Bullish",
  fear: "Neutral",
  volatility: "Elevated",
  adx: 27.4,
  vix_percentile: 0.41,
  atr_percentile: 0.58,
  breadth: 0.63,
  strength: 0.71,
  advance_decline_ratio: 1.42,
  nh_nl_ratio: 2.15,
  correlation_spy_qqq: 0.92,
  correlation_spy_tlt: -0.38,
  timestamp: "2026-06-26T20:00:00Z",
}

export const mockPortfolioWeights: PortfolioWeight[] = [
  { strategy_id: "str-001", strategy_name: "Momentum Breakout", target_weight: 0.3, actual_weight: 0.31 },
  { strategy_id: "str-002", strategy_name: "Mean Reversion EU", target_weight: 0.2, actual_weight: 0.21 },
  { strategy_id: "str-003", strategy_name: "Gap Fade NQ", target_weight: 0.1, actual_weight: 0.1 },
  { strategy_id: "str-004", strategy_name: "Trend Rider Gold", target_weight: 0.4, actual_weight: 0.38 },
]

export const mockPortfolioMetrics: PortfolioMetrics = {
  sharpe: 1.74,
  combined_drawdown: 0.118,
  transaction_costs: 4230,
  correlation_matrix: {
    strategies: ["Momentum", "Mean Rev", "Gap Fade", "Trend Gold"],
    matrix: [
      [1, 0.21, 0.34, 0.12],
      [0.21, 1, -0.08, 0.27],
      [0.34, -0.08, 1, 0.05],
      [0.12, 0.27, 0.05, 1],
    ],
  },
  drawdown_series: buildEquityCurve(30, 100).map((m) => ({
    timestamp: m.timestamp,
    drawdown: -Math.abs((m.equity - 100) / 100) * 0.2,
  })),
}
