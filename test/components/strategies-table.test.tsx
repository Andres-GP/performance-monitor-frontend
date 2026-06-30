import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrategiesTable } from "@/components/strategies/strategies-table";
import { mockStrategies } from "@/lib/mock-data";

describe("StrategiesTable", () => {
  it("renders a row per strategy with a link to its detail page", () => {
    render(
      <StrategiesTable strategies={mockStrategies} onDelete={jest.fn()} />,
    );
    const first = mockStrategies[0];
    const link = screen.getByRole("link", {
      name: new RegExp(first.name, "i"),
    });
    expect(link).toHaveAttribute("href", `/strategies/${first.id}`);
  });
});
