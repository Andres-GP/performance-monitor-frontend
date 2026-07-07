import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrategiesTable } from "@/components/strategies/strategies-table";

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
        deleteAria: "Delete {name}",
        deleteDisabledAria: "Delete {name} (disabled)",
        viewAria: "View {name}",
      },
      strategyDetail: {
        onlyStoppedCanBeDeleted: "Only stopped strategies can be deleted",
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
const mockStrategies = [
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
    sizing: "2%",
    edge_health: true,
    backtest: false,
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
    sizing: "1%",
    edge_health: false,
    backtest: true,
  },
];

describe("StrategiesTable", () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <StrategiesTable strategies={mockStrategies} onDelete={mockOnDelete} />,
    );

    const deleteButton = screen.getByRole("button", {
      name: "Delete My Strategy 2",
    });
    expect(deleteButton).not.toBeDisabled();

    await user.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockStrategies[1]);
  });

  it("disables delete button for non-stopped strategies", () => {
    render(
      <StrategiesTable strategies={mockStrategies} onDelete={mockOnDelete} />,
    );

    const deleteButton = screen.getByRole("button", {
      name: "Delete My Strategy 1 (disabled)",
    });
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveAttribute(
      "title",
      "Only stopped strategies can be deleted",
    );
  });

  it("shows empty message when no strategies", () => {
    render(<StrategiesTable strategies={[]} onDelete={mockOnDelete} />);
    expect(screen.getByText("No strategies found")).toBeInTheDocument();
  });
});
