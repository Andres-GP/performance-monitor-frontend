import { render, screen } from "@testing-library/react"
import { Header } from "@/components/layout/header"

const usePathname = jest.fn()
jest.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}))

describe("Header", () => {
  it("shows the Dashboard title on the root route", () => {
    usePathname.mockReturnValue("/")
    render(<Header />)
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument()
  })

  it("shows the matching nav label for a section route", () => {
    usePathname.mockReturnValue("/alerts")
    render(<Header />)
    expect(screen.getByRole("heading", { name: "Alertas" })).toBeInTheDocument()
  })

  it("shows the strategy detail title for nested strategy routes", () => {
    usePathname.mockReturnValue("/strategies/str-001")
    render(<Header />)
    expect(screen.getByRole("heading", { name: /Detalle de Estrategia/i })).toBeInTheDocument()
  })

  it("renders the menu toggle with an accessible label", () => {
    usePathname.mockReturnValue("/")
    render(<Header />)
    expect(screen.getByRole("button", { name: /Abrir menú de navegación/i })).toBeInTheDocument()
  })
})
