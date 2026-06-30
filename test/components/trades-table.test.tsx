import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TradesTable } from "@/components/strategies/trades-table";
import type { Trade } from "@/types";

const useTrades = jest.fn();
jest.mock("@/lib/queries", () => ({
  useTrades: (id: string) => useTrades(id),
}));

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
  it("renders a loading skeleton", () => {
    useTrades.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<TradesTable strategyId="str-1" />);
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("renders trades and paginates beyond the page size", async () => {
    useTrades.mockReturnValue({
      data: { data: buildTrades(20), isFallback: false },
      isLoading: false,
    });
    render(<TradesTable strategyId="str-1" />);

    expect(
      screen.getByText(/20 operaciones · página 1 de 2/i),
    ).toBeInTheDocument();
    const prev = screen.getByRole("button", { name: /Página anterior/i });
    expect(prev).toBeDisabled();

    await userEvent.click(
      screen.getByRole("button", { name: /Página siguiente/i }),
    );
    expect(screen.getByText(/página 2 de 2/i)).toBeInTheDocument();
  });
});
