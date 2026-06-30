import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { navItems } from "@/components/layout/nav-items"

const usePathname = jest.fn()
jest.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}))

describe("SidebarNav", () => {
  beforeEach(() => usePathname.mockReturnValue("/"))

  it("renders every navigation item as a link", () => {
    render(<SidebarNav />)
    for (const item of navItems) {
      const link = screen.getByRole("link", { name: new RegExp(item.label, "i") })
      expect(link).toHaveAttribute("href", item.href)
    }
  })

  it("marks the active route with aria-current", () => {
    usePathname.mockReturnValue("/strategies")
    render(<SidebarNav />)
    const active = screen.getByRole("link", { name: /Estrategias/i })
    expect(active).toHaveAttribute("aria-current", "page")
  })

  it("fires onNavigate when a link is clicked", async () => {
    const onNavigate = jest.fn()
    render(<SidebarNav onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole("link", { name: /Dashboard/i }))
    expect(onNavigate).toHaveBeenCalled()
  })
})
