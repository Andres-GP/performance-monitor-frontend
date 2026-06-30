import { render, screen } from "@testing-library/react"
import { Activity } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"

describe("StatCard", () => {
  it("renders label, value and hint", () => {
    render(<StatCard label="Capital" value="$1,000" icon={Activity} hint="All accounts" />)
    expect(screen.getByText("Capital")).toBeInTheDocument()
    expect(screen.getByText("$1,000")).toBeInTheDocument()
    expect(screen.getByText("All accounts")).toBeInTheDocument()
  })

  it("hides the value and shows a skeleton while loading", () => {
    render(<StatCard label="Capital" value="$1,000" icon={Activity} loading />)
    expect(screen.queryByText("$1,000")).not.toBeInTheDocument()
    expect(screen.getByText("Capital")).toBeInTheDocument()
  })

  it("omits the hint when not provided", () => {
    render(<StatCard label="Sharpe" value="1.7" icon={Activity} />)
    expect(screen.queryByText("All accounts")).not.toBeInTheDocument()
  })
})
