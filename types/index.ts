export type HealthStatus = "healthy" | "unhealthy" | "edge_decay";
export type Severity = "high" | "medium" | "low";
export type AccountType = "demo" | "real" | "funded";
export type Platform = "NT8" | "MT5" | "Unknown";
export type StrategyStatus = "Running" | "Stopped" | "Unknown";

export interface PerformanceMetric {
  win_rate?: number;
  profit_factor?: number;
  drawdown?: number;
  sharpe?: number;
  total_trades?: number;
  avg_win?: number;
  avg_loss?: number;
}

export interface BacktestData {
  period_start?: string;
  period_end?: string;
  expected_pnl?: number;
  expected_sharpe?: number;
  expected_drawdown?: number;
  parameters?: Record<string, any>;
}

export interface EdgeMetrics {
  [key: string]: any;
}

export interface Strategy {
  strategy_id: string; // ← antes 'id'
  name: string;
  instrument: string;
  instrument_type?: string | null;
  timeframe?: string | null;
  data_type?: string | null;
  platform: Platform;
  sizing?: number | null;
  start_date: string; // ISO 8601
  state: StrategyStatus;
  health_status: HealthStatus;
  last_heartbeat?: string | null;
  created_at: string;
  updated_at: string;
  alerts_30d: number;
  trades_count: number;
  metrics: PerformanceMetric | null;
  backtest: BacktestData | null;
  edge_health: EdgeMetrics | null;
}

export interface Trade {
  id: string;
  strategy_id: string;
  symbol?: string;
  side: "long" | "short";
  entry_price?: number;
  exit_price?: number;
  quantity?: number;
  pnl: number;
  entry_time: string;
  exit_time?: string;
}

export interface Alert {
  id: string;
  strategy_id: string;
  strategy_name?: string;
  problem: string;
  details?: string;
  severity: Severity;
  read?: boolean;
  timestamp: string;
}

export interface CapitalAccount {
  account_type: AccountType;
  capital: number;
}

export interface CapitalSummary {
  total: number;
  accounts: CapitalAccount[];
}

export interface PerformanceMetric {
  timestamp: string;
  equity: number;
  win_rate?: number;
  profit_factor?: number;
  drawdown?: number;
  sharpe?: number;
}

export interface EdgeHealth {
  oos_degradation?: number;
  efficiency_ratio?: number;
  skewness?: number;
  kurtosis?: number;
  sample_size?: number;
  notes?: string;
}

export interface MarketRegime {
  trend?: string;
  fear?: string;
  volatility?: string;
  adx: number;
  vix_percentile: number;
  atr_percentile: number;
  breadth: number;
  strength: number;
  advance_decline_ratio: number;
  nh_nl_ratio: number;
  correlation_spy_qqq: number;
  correlation_spy_tlt: number;
  timestamp?: string;
}

export interface PortfolioWeight {
  strategy_id: string;
  strategy_name?: string;
  target_weight: number;
  actual_weight?: number;
}

export interface PortfolioMetrics {
  sharpe: number;
  combined_drawdown: number;
  transaction_costs: number;
  correlation_matrix?: {
    strategies: string[];
    matrix: number[][];
  };
  drawdown_series?: { timestamp: string; drawdown: number }[];
}

export interface HealthResponse {
  status: string;
}
