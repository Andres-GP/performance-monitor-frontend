import { WifiOff } from "lucide-react"

export function OfflineBanner({ show = true }: { show?: boolean }) {
  if (!show) return null
  return (
    <div className="flex items-center gap-2 rounded-md border border-chart-4/30 bg-chart-4/10 px-3 py-2 text-sm text-chart-4">
      <WifiOff className="size-4 shrink-0" />
      <span>Backend no disponible — mostrando datos en caché de demostración.</span>
    </div>
  )
}
