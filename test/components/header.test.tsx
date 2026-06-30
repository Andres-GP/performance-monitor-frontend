import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/header";

const usePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("Header", () => {
  it("shows the Dashboard title on the root route", () => {
    usePathname.mockReturnValue("/");
    render(<Header />);
    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});
