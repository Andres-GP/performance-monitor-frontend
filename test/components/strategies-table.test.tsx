import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrategiesTable } from "@/components/strategies/strategies-table";

// --- Mock de useI18n ---
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
        deleteAria: "Delete {name}",
        viewAria: "View {name}",
      },
    },
    // t debe devolver el template reemplazado
    t: (template: string, opts?: { name: string }) => {
      if (opts?.name) {
        return template.replace("{name}", opts.name);
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
    // Si se proporciona render, se usa en lugar de children
    const content = render || children;
    // Eliminar nativeButton y render de las props que se pasan al DOM
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

// --- Datos mockeados ---
const mockStrategies = [
  {
    id: "strategy-1",
    name: "My Strategy 1",
    instrument: "ES",
    platform: "MT5",
    status: "Running",
    health_status: "healthy",
    win_rate: 55,
    profit_factor: 1.2,
    drawdown: -0.08,
    trades_count: 150,
  },
  {
    id: "strategy-2",
    name: "My Strategy 2",
    instrument: "GC",
    platform: "NT8",
    status: "Stopped",
    health_status: "edge_decay",
    win_rate: 45,
    profit_factor: 0.9,
    drawdown: -0.18,
    trades_count: 80,
  },
];

describe("StrategiesTable", () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a row per strategy with a link to its detail page", () => {
    render(
      <StrategiesTable strategies={mockStrategies} onDelete={mockOnDelete} />,
    );

    const rows = screen.getAllByRole("row");
    // Una fila para el header + una por estrategia = 3
    expect(rows).toHaveLength(3);

    const first = mockStrategies[0];
    const link = screen.getByRole("link", {
      name: new RegExp(first.name, "i"),
    });
    expect(link).toHaveAttribute("href", `/strategies/${first.id}`);

    expect(screen.getByText(mockStrategies[1].name)).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <StrategiesTable strategies={mockStrategies} onDelete={mockOnDelete} />,
    );

    // El aria-label ahora es "Delete My Strategy 1" gracias al mock de t
    const deleteButton = screen.getByRole("button", {
      name: `Delete ${mockStrategies[0].name}`,
    });
    await user.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockStrategies[0]);
  });

  it("shows empty message when no strategies", () => {
    render(<StrategiesTable strategies={[]} onDelete={mockOnDelete} />);
    expect(screen.getByText("No strategies found")).toBeInTheDocument();
  });
});
