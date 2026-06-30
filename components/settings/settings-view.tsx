"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Mail, Moon, Server } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "cursor-pointer inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
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
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  children: React.ReactNode;
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
  );
}

export function SettingsView() {
  const { dict } = useI18n();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(true);

  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      try {
        await apiGet<{ status: string }>("/health");
        return "online" as const;
      } catch {
        return "offline" as const;
      }
    },
    refetchInterval: 30_000,
  });

  // Determinar el estado del backend para mostrarlo
  const backendStatus = health.isLoading
    ? dict.settings.checking
    : health.data === "online"
      ? dict.settings.online
      : dict.settings.offline;

  const statusClass =
    health.data === "online"
      ? "bg-chart-1/10 text-chart-1"
      : health.data === "offline"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";

  const dotClass =
    health.data === "online"
      ? "bg-chart-1"
      : health.data === "offline"
        ? "bg-destructive"
        : "bg-muted-foreground";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{dict.settings.title}</h2>
        <p className="text-sm text-muted-foreground">
          {dict.settings.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {dict.settings.appearance}
          </CardTitle>
          <CardDescription>{dict.settings.appearanceDesc}</CardDescription>
        </CardHeader>
        <CardContent className="py-0">
          <SettingRow
            icon={Moon}
            title={dict.settings.darkMode}
            description={dict.settings.darkModeDesc}
          >
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {dict.settings.active}
            </span>
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{dict.settings.system}</CardTitle>
          <CardDescription>{dict.settings.systemDesc}</CardDescription>
        </CardHeader>
        <CardContent className="py-0">
          <SettingRow
            icon={Server}
            title={dict.settings.backendStatus}
            description={dict.settings.backendStatusDesc}
          >
            <span
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium",
                statusClass,
              )}
            >
              <span className={cn("size-1.5 rounded-full", dotClass)} />
              {backendStatus}
            </span>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
