export type HealthStatus = "healthy" | "unhealthy" | "edge_decay";
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type AccountType = "demo" | "real" | "funded";
export type Platform = "NT8" | "MT5" | "Unknown";
export type StrategyStatus = "Running" | "Stopped" | "Unknown";

export interface PerformanceMetric {
  date?: string;
  timestamp?: string;
  equity?: number | null;
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
  parameters?: Record<string, unknown>;
}

export interface EdgeMetrics {
  oos_degradation?: number | null;
  efficiency_ratio?: number | null;
  skewness?: number | null;
  kurtosis?: number | null;
  sample_size?: number | null;
  notes?: string | null;
}

export interface Strategy {
  strategy_id: string; // ← antes 'id'
  name: string;
  instrument: string;
  instrument_type?: string | null;
  timeframe?: string | null;
  data_type?: string | null;
  platform: Platform | string | null;
  sizing?: number | null;
  start_date?: string; // ISO 8601
  state: StrategyStatus;
  health_status: HealthStatus;
  last_heartbeat?: string | null;
  created_at?: string;
  updated_at?: string;
  alerts_30d?: number;
  trades_count?: number;
  metrics?: PerformanceMetric | null;
  backtest?: BacktestData | null;
  edge_health?: EdgeMetrics | null;
}

export interface Trade {
  id: number | string;
  strategy_id: string;
  symbol?: string;
  instrument?: string;
  side?: "long" | "short";
  direction?: "long" | "short";
  entry_price?: number;
  exit_price?: number;
  quantity?: number;
  volume?: number;
  pnl?: number;
  profit?: number;
  trade_type?: "long" | "short";
  commission?: number | null;
  swap?: number | null;
  spread_cost?: number | null;
  slippage?: number | null;
  reference_price?: number | null;
  currency?: string | null;
  pnl_pct_equity?: number | null;
  entry_time: string;
  exit_time?: string;
}

export interface ExecutionEvent {
  id: number | string;
  strategy_id: string;
  event_type: "signal_intent" | "execution_update";
  ts?: string | null;
  received_at?: string;
  ingest_status: "received" | "processed" | "rejected";
  payload: {
    signal_id?: string;
    symbol?: string;
    direction?: "long" | "short";
    reference_price?: number;
    volume?: number;
    bid_price?: number;
    ask_price?: number;
    spread_points?: number;
    status?: "submitted" | "filled" | "partial" | "cancelled" | "rejected" | "not_sent";
    filled_volume?: number;
    fill_price?: number | null;
    slippage_price?: number;
    slippage_bps?: number;
    signal_to_fill_seconds?: number;
    reason?: string | null;
  };
}

export interface Alert {
  id: number | string;
  strategy_id?: string | null;
  portfolio_id?: string | null;
  strategy_name?: string;
  problem?: string;
  problem_type?: string;
  rule_key?: string;
  details?: string;
  context?: Record<string, unknown> | null;
  count?: number;
  ack_at?: string | null;
  resolved_at?: string | null;
  severity: Severity;
  status?: "open" | "ack" | "resolved";
  first_seen?: string;
  last_seen?: string;
  timestamp?: string;
  read?: boolean;
}

export interface MonitoringPage<T> {
  items: T[];
  limit: number;
  offset: number;
  total: number | null;
}

export interface EquitySample {
  strategy_id: string;
  ts: string;
  equity: number;
}

export interface CapitalAccount {
  account_type: AccountType;
  capital: number;
}

export interface CapitalSummary {
  total?: number;
  by_type?: Record<string, {
    total: number;
    accounts: Array<{ capital: number; currency: string }>;
  }>;
}

export interface EdgeHealth {
  oos_degradation?: number;
  efficiency_ratio?: number;
  skewness?: number;
  kurtosis?: number;
  sample_size?: number;
  notes?: string;
}

export interface PortfolioWeight {
  strategy_id: string;
  strategy_name?: string;
  target_weight: number;
  actual_weight?: number | null;
}

export interface PortfolioMetrics {
  date?: string;
  sharpe?: number | null;
  max_drawdown?: number | null;
  current_drawdown?: number | null;
  transaction_cost_pct?: number | null;
  ruin_probability?: number | null;
  exposure_by_category?: Record<string, number> | null;
  concentration_metrics?: Record<string, number> | null;
  allocation_deviations?: Record<string, {
    target: number | null;
    actual: number | null;
    deviation: number | null;
  }> | null;
  correlation_matrix?: Record<string, Record<string, number | null>> | { note: string } | null;
}

export interface HealthResponse {
  status: string;
}
