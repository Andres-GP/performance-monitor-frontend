"use client"

import { useEffect, useRef } from "react"

interface TvWidgetProps {
  scriptSrc: string
  config: Record<string, unknown>
  height?: number
}

// Generic TradingView embed loader. Injects the official widget script with the
// provided JSON config into an isolated container.
export default function TvWidget({ scriptSrc, config, height = 400 }: TvWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ""
    const widgetDiv = document.createElement("div")
    widgetDiv.className = "tradingview-widget-container__widget"
    widgetDiv.style.height = `${height}px`
    widgetDiv.style.width = "100%"
    container.appendChild(widgetDiv)

    const script = document.createElement("script")
    script.src = scriptSrc
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      ...config,
      colorTheme: "dark",
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
      className="tradingview-widget-container"
      style={{ height, width: "100%" }}
    />
  )
}
