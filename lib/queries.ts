"use client";

import { useClerk } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiSend, getWithFallback } from "@/lib/api-client";
import type {
  Alert,
  PerformanceMetric,
  PortfolioMetrics,
  PortfolioWeight,
  CapitalSummary,
  MonitoringPage,
  EquitySample,
  Strategy,
  Trade,
} from "@/types";

export const qk = {
  strategies: ["strategies"] as const,
  strategy: (id: string) => ["strategies", id] as const,
  trades: (id: string) => ["strategies", id, "trades"] as const,
  metrics: (id: string) => ["performance", "metrics", id] as const,
  alerts: (limit: number) => ["alerts", limit] as const,
  capital: ["capital", "summary"] as const,
  weights: ["portfolio", "weights"] as const,
  portfolioMetrics: ["portfolio", "metrics"] as const,
  equityCurve: ["performance", "equity"] as const,
  health: ["health"] as const,
};

const STALE = 60_000;

export function useApiToken() {
  const { session } = useClerk();

  return async (): Promise<string | undefined> => {
    if (!session) throw new Error("Your session has expired. Sign in again.");
    const token = await session.getToken();
    if (!token) throw new Error("Your session has expired. Sign in again.");
    return token;
  };
}

export function useStrategies() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: qk.strategies,
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<Strategy[]>("/strategies", {
        signal,
        token,
      });
    },
    staleTime: STALE,
  });
}

export function useStrategy(id: string) {
  const all = useStrategies();
  const strategies = all.data?.data ?? [];
  const strategy = strategies.find((s) => s.strategy_id === id);
  return {
    strategy,
    isFallback: all.data?.isFallback ?? false,
    isLoading: all.isLoading,
  };
}

export function useTrades(id: string, page = 0, pageSize = 100) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: [...qk.trades(id), page, pageSize],
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<MonitoringPage<Trade>>(
        `/strategies/${id}/trades?limit=${pageSize}&offset=${page * pageSize}`,
        {
        signal,
        token,
        },
      );
    },
    staleTime: STALE,
    enabled: !!id,
  });
}

export function useMetrics(id: string) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: qk.metrics(id),
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<PerformanceMetric[]>(
        `/performance/metrics/${id}`,
        {
          signal,
          token,
        },
      );
    },
    staleTime: STALE,
    enabled: !!id,
  });
}

export function useStrategyEquity(id: string, page = 0, pageSize = 500) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: [...qk.equityCurve, id, page, pageSize],
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<MonitoringPage<EquitySample>>(
        `/strategies/${id}/equity?limit=${pageSize}&offset=${page * pageSize}`,
        { signal, token },
      );
    },
    staleTime: STALE,
    enabled: !!id,
  });
}

export interface AlertQueryOptions {
  enabled?: boolean;
  offset?: number;
  status?: "open" | "ack" | "resolved";
  severity?: Alert["severity"];
  from?: string;
  to?: string;
}

export function useAlerts(limit = 100, options: AlertQueryOptions = {}) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: [...qk.alerts(limit), options],
    queryFn: async ({ signal }) => {
      const token = await getToken();
      const params = new URLSearchParams({ limit: String(limit) });
      if (options.offset) params.set("offset", String(options.offset));
      if (options.status) params.set("status", options.status);
      if (options.severity) params.set("severity", options.severity);
      if (options.from) params.set("from", options.from);
      if (options.to) params.set("to", options.to);
      return getWithFallback<MonitoringPage<Alert>>(
        `/alerts?${params.toString()}`,
        { signal, token },
      );
    },
    enabled: options.enabled !== false,
    staleTime: STALE,
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (alertId: number | string) => {
      const token = await getToken();
      if (!/^\d+$/.test(String(alertId))) throw new Error("Invalid alert ID");
      return apiSend(`/alerts/${alertId}/ack`, "POST", undefined, { token });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
    onError: (error) => toast.error(error.message || "Could not acknowledge alert"),
  });
}

export function usePortfolioWeights() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: qk.weights,
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<PortfolioWeight[]>("/portfolio/weights", {
        signal,
        token,
      });
    },
    staleTime: STALE,
  });
}

export function usePortfolioMetrics() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: qk.portfolioMetrics,
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<PortfolioMetrics>("/portfolio/metrics", {
        signal,
        token,
        emptyOnNotFound: true,
      });
    },
    staleTime: STALE,
  });
}

export function useCapitalSummary() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: qk.capital,
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<CapitalSummary>("/capital/summary", {
        signal,
        token,
      });
    },
    staleTime: STALE,
  });
}

export function useSetWeight() {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (body: {
      strategy_id: string;
      target_weight: number;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("No autenticado");
      return apiSend("/portfolio/weights", "POST", body, { token });
    },
    onSuccess: () => {
      toast.success("Target weight updated");
      qc.invalidateQueries({ queryKey: qk.weights });
      qc.invalidateQueries({ queryKey: qk.portfolioMetrics });
    },
  });
}

export function healthRefetchInterval(isError: boolean, isFallback: boolean): number {
  return isError || isFallback ? 5_000 : 60_000;
}

export function useHealth() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: qk.health,
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<{ status: string; ingestion?: { status: string; last_received_at?: string | null; age_seconds?: number | null } }>("/health", {
        signal,
        token,
      });
    },
    staleTime: STALE,
    // A cold or slow Supabase health check can time out once while Render
    // wakes. Retry health quickly after an offline/error result, then settle
    // back to the normal one-minute freshness poll.
    refetchInterval: (query) =>
      healthRefetchInterval(
        query.state.status === "error",
        query.state.data?.isFallback ?? false,
      ),
  });
}
