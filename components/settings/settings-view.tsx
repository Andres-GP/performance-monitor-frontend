"use client";

import { Bell, Mail, Moon, Server } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { useHealth } from "@/lib/queries";

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
  const health = useHealth();

  const backendStatus = health.isPending
    ? dict.settings.checking
    : health.status === "success"
      ? dict.settings.online
      : dict.settings.offline;

  const statusClass = health.isPending
    ? "bg-chart-1/10 text-chart-1"
    : health.status === "success"
      ? "bg-muted text-muted-foreground"
      : "bg-destructive/10 text-destructive";

  const dotClass = health.isPending
    ? "bg-muted-foreground"
    : health.status === "success"
      ? "bg-emerald-400"
      : "bg-destructive";

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
