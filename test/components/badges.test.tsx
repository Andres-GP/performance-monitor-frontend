import { render, screen } from "@testing-library/react";
import { HealthBadge, StatusBadge } from "@/components/shared/badges";

describe("StatusBadge", () => {
  it("renders the Running status", () => {
    render(<StatusBadge status="Running" />);
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("renders the Stopped status", () => {
    render(<StatusBadge status="Stopped" />);
    expect(screen.getByText("Stopped")).toBeInTheDocument();
  });
});

describe("HealthBadge", () => {
  it.each([
    ["healthy", "Healthy"],
    ["edge_decay", "Edge Decay"],
    ["unhealthy", "Unhealthy"],
  ] as const)("renders the %s label", (status, label) => {
    render(<HealthBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
