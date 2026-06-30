import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RegimeWidget } from "@/components/market-regime/regime-widget"

const lastConfig: { value: Record<string, unknown> | null } = { value: null }

jest.mock("@/components/tradingview/lazy", () => ({
  TvWidget: (props: { config: Record<string, unknown> }) => {
    lastConfig.value = props.config
    return <div data-testid="tv-widget-stub" />
  },
}))

describe("RegimeWidget", () => {
  beforeEach(() => {
    lastConfig.value = null
  })

  it("renders the title, description and the embedded widget", () => {
    render(<RegimeWidget title="Volatilidad" description="Índice VIX" defaultSymbols="TVC:VIX" />)
    expect(screen.getByText("Volatilidad")).toBeInTheDocument()
    expect(screen.getByText("Índice VIX")).toBeInTheDocument()
    expect(screen.getByTestId("tv-widget-stub")).toBeInTheDocument()
  })

  it("parses the default symbols into the widget config", () => {
    render(
      <RegimeWidget
        title="Correlaciones"
        description="SPY/QQQ"
        defaultSymbols="AMEX:SPY, NASDAQ:QQQ"
      />,
    )
    expect(lastConfig.value?.symbols).toEqual([["AMEX:SPY"], ["NASDAQ:QQQ"]])
  })

  it("applies new symbols when the user edits the input and clicks Aplicar", async () => {
    render(<RegimeWidget title="Test" description="desc" defaultSymbols="AMEX:SPY" />)
    const input = screen.getByLabelText(/Símbolos para Test/i)
    await userEvent.clear(input)
    await userEvent.type(input, "NASDAQ:TLT")
    await userEvent.click(screen.getByRole("button", { name: /Aplicar/i }))
    expect(lastConfig.value?.symbols).toEqual([["NASDAQ:TLT"]])
  })
})
