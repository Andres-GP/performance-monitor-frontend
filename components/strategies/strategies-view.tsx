"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { useDeleteStrategy, useStrategies } from "@/lib/queries"
import type { Strategy } from "@/types"
import { StrategiesTable } from "./strategies-table"
import { DeleteStrategyDialog } from "./delete-strategy-dialog"

export function StrategiesView() {
  const { data, isLoading } = useStrategies()
  const deleteStrategy = useDeleteStrategy()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [health, setHealth] = useState("all")
  const [pending, setPending] = useState<Strategy | null>(null)

  const strategies = data?.data ?? []

  const filtered = useMemo(() => {
    return strategies.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.instrument.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === "all" || s.status === status
      const matchesHealth = health === "all" || s.health_status === health
      return matchesSearch && matchesStatus && matchesHealth
    })
  }, [strategies, search, status, health])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Estrategias</h2>
        <p className="text-sm text-muted-foreground">
          {strategies.length} estrategias monitoreadas en NinjaTrader y MetaTrader
        </p>
      </div>

      {data?.isFallback && <OfflineBanner />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o instrumento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as string)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Running">En ejecución</SelectItem>
            <SelectItem value="Stopped">Detenida</SelectItem>
          </SelectContent>
        </Select>
        <Select value={health} onValueChange={(v) => setHealth(v as string)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Salud" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda la salud</SelectItem>
            <SelectItem value="healthy">Saludable</SelectItem>
            <SelectItem value="edge_decay">Edge Decay</SelectItem>
            <SelectItem value="unhealthy">No saludable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <StrategiesTable strategies={filtered} onDelete={setPending} />
      )}

      <DeleteStrategyDialog
        strategy={pending}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={() => {
          if (pending) deleteStrategy.mutate(pending.id)
          setPending(null)
        }}
        isPending={deleteStrategy.isPending}
      />
    </div>
  )
}
