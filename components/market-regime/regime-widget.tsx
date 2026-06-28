"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TvWidget } from "@/components/tradingview/lazy"

const SYMBOL_OVERVIEW_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"

interface RegimeWidgetProps {
  title: string
  description: string
  defaultSymbols: string
  height?: number
}

// Configurable TradingView "Symbol Overview" widget. Symbols are entered as a
// comma-separated list (e.g. "AMEX:SPY, NASDAQ:QQQ, AMEX:TLT") and applied to
// the embedded widget.
export function RegimeWidget({
  title,
  description,
  defaultSymbols,
  height = 400,
}: RegimeWidgetProps) {
  const [draft, setDraft] = useState(defaultSymbols)
  const [applied, setApplied] = useState(defaultSymbols)

  const config = useMemo(
    () => ({
      symbols: applied
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => [s] as [string]),
      chartOnly: false,
      locale: "en",
      isTransparent: true,
      showVolume: false,
      showMA: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "inherit",
      dateRanges: ["1m|30", "3m|60", "12m|1D", "60m|1W"],
    }),
    [applied],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="AMEX:SPY, NASDAQ:QQQ"
            aria-label={`Símbolos para ${title}`}
          />
          <Button variant="outline" onClick={() => setApplied(draft)} className="shrink-0">
            Aplicar
          </Button>
        </div>
        <TvWidget scriptSrc={SYMBOL_OVERVIEW_SRC} config={config} height={height} />
      </CardContent>
    </Card>
  )
}
