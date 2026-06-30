import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StrategiesTable } from "@/components/strategies/strategies-table"
import { mockStrategies } from "@/lib/mock-data"

describe("StrategiesTable", () => {
  it("renders an empty state when there are no strategies", () => {
    render(<StrategiesTable strategies={[]} onDelete={jest.fn()} />)
    expect(screen.getByText(/No hay estrategias/i)).toBeInTheDocument()
  })

  it("renders a row per strategy with a link to its detail page", () => {
    render(<StrategiesTable strategies={mockStrategies} onDelete={jest.fn()} />)
    const first = mockStrategies[0]
    const link = screen.getByRole("link", { name: new RegExp(first.name, "i") })
    expect(link).toHaveAttribute("href", `/strategies/${first.id}`)
  })

  it("calls onDelete with the strategy when the delete button is clicked", async () => {
    const onDelete = jest.fn()
    render(<StrategiesTable strategies={mockStrategies} onDelete={onDelete} />)
    const first = mockStrategies[0]
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`Eliminar ${first.name}`, "i") }))
    expect(onDelete).toHaveBeenCalledWith(first)
  })
})
