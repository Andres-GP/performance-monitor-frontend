import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertsView } from "@/components/alerts/alerts-view";
import type { Alert } from "@/types";

const useAlerts = jest.fn();
const useStrategies = jest.fn();

jest.mock("@/lib/queries", () => ({
  useAlerts: (limit?: number) => useAlerts(limit),
  useStrategies: () => useStrategies(),
}));

function buildAlerts(count: number): Alert[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `al-${i}`,
    strategy_id: "str-1",
    strategy_name: "Momentum",
    problem: `Problema ${i}`,
    details: `Detalle ${i}`,
    severity: i % 2 === 0 ? "high" : "low",
    timestamp: new Date(2026, 5, 1, 12, i).toISOString(),
  }));
}

describe("AlertsView", () => {
  beforeEach(() => {
    useStrategies.mockReturnValue({
      data: { data: [{ id: "str-1", name: "Momentum" }] },
    });
  });

  it("shows a loading skeleton while fetching", () => {
    useAlerts.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<AlertsView />);
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });
});
