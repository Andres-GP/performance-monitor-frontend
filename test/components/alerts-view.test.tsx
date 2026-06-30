import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AlertsView } from "@/components/alerts/alerts-view"
import type { Alert } from "@/types"

const useAlerts = jest.fn()
const useStrategies = jest.fn()

jest.mock("@/lib/queries", () => ({
  useAlerts: (limit?: number) => useAlerts(limit),
  useStrategies: () => useStrategies(),
}))

function buildAlerts(count: number): Alert[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `al-${i}`,
    strategy_id: "str-1",
    strategy_name: "Momentum",
    problem: `Problema ${i}`,
    details: `Detalle ${i}`,
    severity: i % 2 === 0 ? "high" : "low",
    timestamp: new Date(2026, 5, 1, 12, i).toISOString(),
  }))
}

describe("AlertsView", () => {
  beforeEach(() => {
    useStrategies.mockReturnValue({ data: { data: [{ id: "str-1", name: "Momentum" }] } })
  })

  it("shows a loading skeleton while fetching", () => {
    useAlerts.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<AlertsView />)
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it("renders the offline banner when serving fallback data", () => {
    useAlerts.mockReturnValue({
      data: { data: buildAlerts(3), isFallback: true },
      isLoading: false,
    })
    render(<AlertsView />)
    expect(screen.getByText(/Backend no disponible/i)).toBeInTheDocument()
  })

  it("paginates the alerts list", async () => {
    useAlerts.mockReturnValue({
      data: { data: buildAlerts(25), isFallback: false },
      isLoading: false,
    })
    render(<AlertsView />)

    // First page shows 10 rows + the header row.
    expect(screen.getByText("Problema 0")).toBeInTheDocument()
    expect(screen.queryByText("Problema 10")).not.toBeInTheDocument()
    expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /Página siguiente/i }))
    expect(screen.getByText("Problema 10")).toBeInTheDocument()
    expect(screen.getByText(/página 2 de 3/i)).toBeInTheDocument()
  })

  it("shows an empty state when there are no alerts", () => {
    useAlerts.mockReturnValue({ data: { data: [], isFallback: false }, isLoading: false })
    render(<AlertsView />)
    expect(screen.getByText(/No hay alertas que coincidan/i)).toBeInTheDocument()
  })
})
