"use client";

import { useClerk } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiSend, getWithFallback } from "@/lib/api-client";
import type {
  Alert,
  MarketRegime,
  PerformanceMetric,
  PortfolioMetrics,
  PortfolioWeight,
  MonitoringPage,
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
  regime: ["market", "regime"] as const,
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

export function useAlerts(limit = 100) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: qk.alerts(limit),
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<MonitoringPage<Alert>>(`/alerts?limit=${limit}`, {
        signal,
        token,
      });
    },
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

export function useMarketRegime() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: qk.regime,
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getWithFallback<MarketRegime>("/market/regime", {
        signal,
        token,
      });
    },
    staleTime: STALE,
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
      });
    },
    staleTime: STALE,
  });
}

export function useDeleteStrategy() {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error("No autenticado");
      return apiSend(`/strategies/${id}`, "DELETE", undefined, { token });
    },
    onSuccess: () => {
      toast.success("Strategy deleted");
      qc.invalidateQueries({ queryKey: qk.strategies });
    },
    onError: (error) =>
      toast.error(error.message || "Could not delete strategy"),
  });
}

export function useUploadBacktest(strategyId: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (body: {
      expected_pnl: number;
      expected_sharpe: number;
      expected_drawdown: number;
      period_start: string;
      period_end: string;
      parameters?: Record<string, any>;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("No autenticado");
      return apiSend(
        "/backtest/upload",
        "POST",
        { strategy_id: strategyId, ...body },
        { token },
      );
    },
    onSuccess: () => {
      toast.success("Backtest subido correctamente");
      qc.invalidateQueries({ queryKey: qk.metrics(strategyId) });
    },
    onError: (error) =>
      toast.error(error.message || "No se pudo subir el backtest"),
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
    onError: (error) => toast.error(error.message || "Could not update weight"),
  });
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
  });
}
