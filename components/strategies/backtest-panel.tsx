"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUploadBacktest } from "@/lib/queries"

export function BacktestPanel({ strategyId }: { strategyId: string }) {
  const upload = useUploadBacktest(strategyId)
  const [expectedPnl, setExpectedPnl] = useState("")
  const [notes, setNotes] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(expectedPnl)
    if (Number.isNaN(value)) return
    upload.mutate(
      { expected_pnl: value, notes: notes || undefined },
      {
        onSuccess: () => {
          setExpectedPnl("")
          setNotes("")
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subir Backtest</CardTitle>
        <CardDescription>
          Registra los resultados esperados de un backtest para comparar contra el rendimiento en vivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expected-pnl">PnL esperado (USD)</Label>
              <Input
                id="expected-pnl"
                type="number"
                step="any"
                placeholder="12500"
                value={expectedPnl}
                onChange={(e) => setExpectedPnl(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                placeholder="Período, parámetros, mercado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={upload.isPending} className="w-fit">
            <Upload className="size-4" />
            {upload.isPending ? "Subiendo..." : "Subir backtest"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
