"use client"

import { useEffect, useRef } from "react"

interface TvWidgetProps {
  scriptSrc: string
  config: Record<string, unknown>
  height?: number
}

// Generic TradingView embed loader. Injects the official widget script with the
// provided JSON config into an isolated container.
//
// Key details that keep the embed from rendering blank / in light mode:
// - The container gets an explicit pixel height AND the inner widget fills it at
//   100% width/height, so TradingView's auto-sized iframe always has a non-zero
//   box to paint into.
// - `colorTheme: "dark"` + `isTransparent: false` force TradingView's native
//   dark background (#131722) instead of the default white canvas.
export default function TvWidget({ scriptSrc, config, height = 400 }: TvWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ""

    // The element TradingView replaces with its iframe. It must fill the
    // container so the chart occupies all available space.
    const widgetDiv = document.createElement("div")
    widgetDiv.className = "tradingview-widget-container__widget"
    widgetDiv.style.height = "100%"
    widgetDiv.style.width = "100%"
    container.appendChild(widgetDiv)

    const script = document.createElement("script")
    script.src = scriptSrc
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      ...config,
      // Force dark theme regardless of the caller / page color scheme.
      colorTheme: "dark",
      isTransparent: false,
      autosize: true,
    })
    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [scriptSrc, config, height])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container relative w-full overflow-hidden rounded-md border border-border bg-[#131722]"
      style={{ height }}
      data-testid="tv-widget-container"
    />
  )
}
