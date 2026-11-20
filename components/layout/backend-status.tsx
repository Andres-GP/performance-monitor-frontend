"use client";

import { CircleCheck, CircleDashed, CircleX, TriangleAlert } from "lucide-react";
import { useHealth } from "@/lib/queries";
import { useI18n } from "@/lib/i18n/context";

export function BackendStatus() {
  const health = useHealth();
  const { dict } = useI18n();

  const ingestionStatus = health.data?.data?.ingestion?.status;
  const unavailable =
    !health.isLoading &&
    (health.isError || health.data?.isFallback || health.data?.data?.status !== "ok");
  const stale = ingestionStatus === "stale";
  const waiting = ingestionStatus === "empty" || ingestionStatus === "unavailable";

  const label = health.isLoading
    ? dict.header.apiChecking
    : unavailable
      ? dict.header.apiUnavailable
      : stale
        ? dict.header.apiDataStale
        : waiting
          ? dict.header.apiAwaitingEvents
          : dict.header.apiConnected;
  const Icon = unavailable
    ? CircleX
    : stale || waiting
      ? TriangleAlert
      : health.isLoading
        ? CircleDashed
        : CircleCheck;
  const tone = unavailable
    ? "text-rose-200"
    : stale || waiting
      ? "text-amber-100"
      : "text-[#c8f5a8]";

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`flex size-9 shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-xs md:h-9 md:w-auto md:px-3 ${tone}`}
      title={label}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      <span className="sr-only md:not-sr-only">{label}</span>
    </span>
  );
}
