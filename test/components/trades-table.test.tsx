import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TradesTable } from "@/components/strategies/trades-table";
import type { Trade } from "@/types";

// ----- Mock de useTrades -----
const useTrades = jest.fn();
jest.mock("@/lib/queries", () => ({
  useTrades: (id: string) => useTrades(id),
}));

// ----- Mock de useI18n (CRUCIAL para que los textos se rendericen) -----
jest.mock("@/lib/i18n/context", () => ({
  useI18n: () => ({
    dict: {
      trades: {
        empty: "No hay operaciones",
        colSymbol: "Símbolo",
        colSide: "Lado",
        colEntry: "Entrada",
        colExit: "Salida",
        colQty: "Cant.",
        colPnl: "PnL",
        colDate: "Fecha",
      },
      strategyDetail: {
        operations: "{trades} operaciones · página {page} de {totalPages}",
      },
      common: {
        none: "—",
      },
    },
    t: (str: string, params?: Record<string, any>) => {
      // Reemplaza {clave} por el valor correspondiente en params
      return str.replace(/\{(\w+)\}/g, (_, key) => params?.[key] ?? "");
    },
  }),
}));

// ----- Helper para construir trades de prueba -----
function buildTrades(count: number): Trade[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `t-${i}`,
    strategy_id: "str-1",
    symbol: "ES",
    side: i % 2 === 0 ? "long" : "short",
    entry_price: 4500 + i,
    exit_price: 4510 + i,
    quantity: 1,
    pnl: i % 2 === 0 ? 100 : -50,
    entry_time: new Date(2026, 5, 1, 10, i).toISOString(),
  }));
}

describe("TradesTable", () => {
  beforeEach(() => {
    useTrades.mockReset();
  });

  it("renders a loading skeleton", () => {
    useTrades.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<TradesTable strategyId="str-1" />);
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("renders trades and paginates beyond the page size", async () => {
    const trades = buildTrades(20);
    useTrades.mockReturnValue({
      data: { data: trades, isFallback: false },
      isLoading: false,
    });

    render(<TradesTable strategyId="str-1" />);

    // Verifica el mensaje de paginación (ahora con el mock de i18n funciona)
    expect(
      screen.getByText("20 operaciones · página 1 de 2"),
    ).toBeInTheDocument();

    const prev = screen.getByRole("button", { name: /Página anterior/i });
    expect(prev).toBeDisabled();

    const next = screen.getByRole("button", { name: /Página siguiente/i });
    await userEvent.click(next);

    expect(
      screen.getByText("20 operaciones · página 2 de 2"),
    ).toBeInTheDocument();
  });
});
