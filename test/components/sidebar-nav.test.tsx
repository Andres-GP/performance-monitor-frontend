import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { navItems } from "@/components/layout/nav-items";

const usePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("SidebarNav", () => {
  beforeEach(() => usePathname.mockReturnValue("/"));

  it("fires onNavigate when a link is clicked", async () => {
    const onNavigate = jest.fn();
    render(<SidebarNav onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("link", { name: /Dashboard/i }));
    expect(onNavigate).toHaveBeenCalled();
  });
});
