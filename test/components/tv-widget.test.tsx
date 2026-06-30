import { render } from "@testing-library/react"
import TvWidget from "@/components/tradingview/tv-widget"

const SRC = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"

describe("TvWidget", () => {
  it("injects the TradingView script with the provided src", () => {
    const { getByTestId } = render(<TvWidget scriptSrc={SRC} config={{ symbols: [["AMEX:SPY"]] }} />)
    const container = getByTestId("tv-widget-container")
    const script = container.querySelector("script")
    expect(script).not.toBeNull()
    expect(script).toHaveAttribute("src", SRC)
  })

  it("forces dark mode and autosize in the embedded config", () => {
    const { getByTestId } = render(
      <TvWidget scriptSrc={SRC} config={{ symbols: [["TVC:VIX"]], isTransparent: true }} />,
    )
    const script = getByTestId("tv-widget-container").querySelector("script")
    const parsed = JSON.parse(script?.innerHTML ?? "{}")
    expect(parsed.colorTheme).toBe("dark")
    expect(parsed.autosize).toBe(true)
    // The caller passed isTransparent: true but the widget must override it so
    // the chart never renders on a white background.
    expect(parsed.isTransparent).toBe(false)
    expect(parsed.symbols).toEqual([["TVC:VIX"]])
  })

  it("renders the widget container that fills its parent", () => {
    const { getByTestId } = render(<TvWidget scriptSrc={SRC} config={{}} height={420} />)
    const container = getByTestId("tv-widget-container")
    const widget = container.querySelector(".tradingview-widget-container__widget") as HTMLElement
    expect(widget).not.toBeNull()
    expect(widget.style.height).toBe("100%")
    expect(widget.style.width).toBe("100%")
    expect(container.style.height).toBe("420px")
  })
})
