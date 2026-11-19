import { render, screen } from "@testing-library/react";
import { StrategiesTable } from "@/components/strategies/strategies-table";
import type { Strategy } from "@/types";

// --- Mock de useI18n (con todas las claves que usa el componente) ---
jest.mock("@/lib/i18n/context", () => ({
  useI18n: () => ({
    dict: {
      strategies: {
        empty: "No strategies found",
        colStrategy: "Strategy",
        colStatus: "Status",
        colHealth: "Health",
        colWinRate: "Win Rate",
        colProfitFactor: "Profit Factor",
        colDrawdown: "Drawdown",
        colTrades: "Trades",
        colActions: "Actions",
        alertsInLast30Days: "Alerts (30d)",
        strategyId: "ID",
        creationDate: "Start Date",
        timeFrame: "Timeframe",
        dataType: "Data Type",
        sizing: "Sizing",
        viewAria: "View {name}",
      },
      strategyDetail: {
      },
    },
    t: (template: string, opts?: { name: string }) => {
      if (opts?.name) {
        return template.replace(/\{name\}/g, opts.name);
      }
      return template;
    },
  }),
}));

// --- Mock de componentes de badges ---
jest.mock("@/components/shared/badges", () => ({
  HealthBadge: ({ status }: { status: string }) => (
    <span data-testid="health-badge">{status}</span>
  ),
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

// --- Mock de Button (maneja nativeButton y render) ---
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, render, nativeButton, ...props }: any) => {
    const content = render || children;
    const { nativeButton: _, render: __, ...domProps } = props;
    return (
      <button data-testid="mock-button" onClick={onClick} {...domProps}>
        {content}
      </button>
    );
  },
}));

// --- Mock de Link ---
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// --- Datos mockeados con TODAS las propiedades que usa el componente ---
const mockStrategies: Strategy[] = [
  {
    strategy_id: "strategy-1",
    name: "My Strategy 1",
    instrument: "ES",
    platform: "MT5",
    state: "Running",
    health_status: "healthy",
    metrics: {
      win_rate: 0.55,
      profit_factor: 1.2,
      drawdown: -0.08,
    },
    trades_count: 150,
    alerts_30d: 5,
    start_date: "2025-01-01T00:00:00Z",
    timeframe: "1h",
    data_type: "OHLC",
    sizing: 2,
    edge_health: null,
    backtest: null,
  },
  {
    strategy_id: "strategy-2",
    name: "My Strategy 2",
    instrument: "GC",
    platform: "NT8",
    state: "Stopped",
    health_status: "edge_decay",
    metrics: {
      win_rate: 0.45,
      profit_factor: 0.9,
      drawdown: -0.18,
    },
    trades_count: 80,
    alerts_30d: 12,
    start_date: "2025-02-15T00:00:00Z",
    timeframe: "15m",
    data_type: "tick",
    sizing: 1,
    edge_health: null,
    backtest: null,
  },
];

describe("StrategiesTable", () => {
  it("provides navigation to strategy detail without destructive actions", () => {
    render(<StrategiesTable strategies={mockStrategies} />);
    expect(
      screen.getByRole("button", { name: "View My Strategy 1" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
  });

  it("shows empty message when no strategies", () => {
    render(<StrategiesTable strategies={[]} />);
    expect(screen.getByText("No strategies found")).toBeInTheDocument();
  });
});
