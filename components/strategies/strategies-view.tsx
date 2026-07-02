"use client"

import { useCallback, useMemo, useState } from "react"
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
import { useI18n } from "@/lib/i18n/context"
import { useDeleteStrategy, useStrategies } from "@/lib/queries"
import type { Strategy } from "@/types"
import { StrategiesTable } from "./strategies-table"
import { DeleteStrategyDialog } from "./delete-strategy-dialog"

export function StrategiesView() {
  const { dict, t } = useI18n()
  const { data, isLoading } = useStrategies()
  const deleteStrategy = useDeleteStrategy()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [health, setHealth] = useState("all")
  const [pending, setPending] = useState<Strategy | null>(null)

  const strategies = data?.data ?? []

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  const handleStatusChange = useCallback((v: string) => setStatus(v), [])

  const handleHealthChange = useCallback((v: string) => setHealth(v), [])

  const handleDeleteConfirm = useCallback(() => {
    if (pending) deleteStrategy.mutate(pending.id)
    setPending(null)
  }, [pending, deleteStrategy])

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) setPending(null)
  }, [])

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
        <h2 className="text-xl font-semibold">{dict.strategies.title}</h2>
        <p className="text-sm text-muted-foreground">
          {t(dict.strategies.subtitle, { count: strategies.length })}
        </p>
      </div>

      {data?.isFallback && <OfflineBanner />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={dict.strategies.searchPlaceholder}
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select
          items={{
            all: dict.strategies.statusAll,
            Running: dict.strategies.statusRunning,
            Stopped: dict.strategies.statusStopped,
          }}
          value={status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={dict.strategies.statusPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{dict.strategies.statusAll}</SelectItem>
            <SelectItem value="Running">{dict.strategies.statusRunning}</SelectItem>
            <SelectItem value="Stopped">{dict.strategies.statusStopped}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          items={{
            all: dict.strategies.healthAll,
            healthy: dict.strategies.healthHealthy,
            edge_decay: dict.strategies.healthEdgeDecay,
            unhealthy: dict.strategies.healthUnhealthy,
          }}
          value={health}
          onValueChange={handleHealthChange}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={dict.strategies.healthPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{dict.strategies.healthAll}</SelectItem>
            <SelectItem value="healthy">{dict.strategies.healthHealthy}</SelectItem>
            <SelectItem value="edge_decay">{dict.strategies.healthEdgeDecay}</SelectItem>
            <SelectItem value="unhealthy">{dict.strategies.healthUnhealthy}</SelectItem>
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
        onOpenChange={handleDialogOpenChange}
        onConfirm={handleDeleteConfirm}
        isPending={deleteStrategy.isPending}
      />
    </div>
  )
}
