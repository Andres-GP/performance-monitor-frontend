import { render, screen } from "@testing-library/react"
import { HealthBadge, SeverityBadge, StatusBadge } from "@/components/shared/badges"

describe("StatusBadge", () => {
  it("renders the Running status", () => {
    render(<StatusBadge status="Running" />)
    expect(screen.getByText("Running")).toBeInTheDocument()
  })

  it("renders the Stopped status", () => {
    render(<StatusBadge status="Stopped" />)
    expect(screen.getByText("Stopped")).toBeInTheDocument()
  })
})

describe("HealthBadge", () => {
  it.each([
    ["healthy", "Healthy"],
    ["edge_decay", "Edge Decay"],
    ["unhealthy", "Unhealthy"],
  ] as const)("renders the %s label", (status, label) => {
    render(<HealthBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it("falls back to the unhealthy label for an unknown status", () => {
    // @ts-expect-error - exercising the runtime fallback branch
    render(<HealthBadge status="bogus" />)
    expect(screen.getByText("Unhealthy")).toBeInTheDocument()
  })
})

describe("SeverityBadge", () => {
  it.each(["high", "medium", "low"] as const)("renders the %s severity", (severity) => {
    render(<SeverityBadge severity={severity} />)
    expect(screen.getByText(severity)).toBeInTheDocument()
  })
})
