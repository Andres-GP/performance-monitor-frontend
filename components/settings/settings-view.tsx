"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Bell, Mail, Moon, Server } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet } from "@/lib/api-client"
import { cn } from "@/lib/utils"

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-background transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Bell
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </div>
      {children}
    </div>
  )
}

export function SettingsView() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(false)
  const [dailyDigest, setDailyDigest] = useState(true)

  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      try {
        await apiGet<{ status: string }>("/health")
        return "online" as const
      } catch {
        return "offline" as const
      }
    },
    refetchInterval: 30_000,
  })

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Ajustes</h2>
        <p className="text-sm text-muted-foreground">
          Preferencias de notificaciones, apariencia y estado del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notificaciones</CardTitle>
          <CardDescription>Controla cómo recibes las alertas de salud</CardDescription>
        </CardHeader>
        <CardContent className="py-0">
          <SettingRow
            icon={Mail}
            title="Alertas por email"
            description="Recibe un correo cuando una estrategia presenta problemas"
          >
            <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="Alertas por email" />
          </SettingRow>
          <SettingRow
            icon={Bell}
            title="Alertas push"
            description="Notificaciones en tiempo real en el navegador"
          >
            <Toggle checked={pushAlerts} onChange={setPushAlerts} label="Alertas push" />
          </SettingRow>
          <SettingRow
            icon={Mail}
            title="Resumen diario"
            description="Un resumen del rendimiento de la cartera cada día"
          >
            <Toggle checked={dailyDigest} onChange={setDailyDigest} label="Resumen diario" />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apariencia</CardTitle>
          <CardDescription>Tema de la interfaz</CardDescription>
        </CardHeader>
        <CardContent className="py-0">
          <SettingRow
            icon={Moon}
            title="Modo oscuro"
            description="El panel está optimizado exclusivamente para tema oscuro"
          >
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Activo
            </span>
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sistema</CardTitle>
          <CardDescription>Conexión con el backend vía proxy seguro</CardDescription>
        </CardHeader>
        <CardContent className="py-0">
          <SettingRow
            icon={Server}
            title="Estado del backend"
            description="Las peticiones se enrutan por el middleware server-side de Next.js"
          >
            <span
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium",
                health.data === "online"
                  ? "bg-chart-1/10 text-chart-1"
                  : health.data === "offline"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  health.data === "online"
                    ? "bg-chart-1"
                    : health.data === "offline"
                      ? "bg-destructive"
                      : "bg-muted-foreground",
                )}
              />
              {health.isLoading ? "Comprobando" : health.data === "online" ? "En línea" : "Sin conexión"}
            </span>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
