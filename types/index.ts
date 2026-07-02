export type StrategyStatus = "Running" | "Stopped";
export type Platform = "NT8" | "MT5";
export type HealthStatus = "healthy" | "unhealthy" | "edge_decay";
export type Severity = "high" | "medium" | "low";
export type AccountType = "demo" | "real" | "funded";

export interface Strategy {
  id: string;
  name: string;
  instrument: string;
  platform: Platform;
  status: StrategyStatus;
  health_status: HealthStatus;
  win_rate: number;
  profit_factor: number;
  drawdown: number;
  trades_count: number;
  sharpe?: number;
  capital?: number;
  updated_at: string;
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
