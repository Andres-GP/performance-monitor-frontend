"use client"

import { useAuth } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiSend, getWithFallback } from "@/lib/api-client"
import {
  mockAlerts,
  mockCapitalSummary,
  mockEquityCurve,
  mockMarketRegime,
  mockMetricsFor,
  mockPortfolioMetrics,
  mockPortfolioWeights,
  mockStrategies,
  mockTradesFor,
} from "@/lib/mock-data"
import type {
  Alert,
  CapitalSummary,
  MarketRegime,
  PerformanceMetric,
  PortfolioMetrics,
  PortfolioWeight,
  Strategy,
  Trade,
} from "@/types"

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
}

const STALE = 60_000

// Internal hook to get Clerk token for API calls
function useApiToken() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  return async () => {
    if (!isLoaded || !isSignedIn) return undefined
    return getToken()
  }
}

export function useStrategies() {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.strategies,
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<Strategy[]>("/strategies", mockStrategies, { signal, token })
    },
    staleTime: STALE,
  })
}

export function useStrategy(id: string) {
  const all = useStrategies()
  const strategy = all.data?.data.find((s) => s.id === id)
  return { strategy, isFallback: all.data?.isFallback ?? false, isLoading: all.isLoading }
}

export function useTrades(id: string) {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.trades(id),
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<Trade[]>(`/strategies/${id}/trades`, mockTradesFor(id), { signal, token })
    },
    staleTime: STALE,
    enabled: !!id,
  })
}

export function useMetrics(id: string) {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.metrics(id),
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<PerformanceMetric[]>(`/performance/metrics/${id}`, mockMetricsFor(id), { signal, token })
    },
    staleTime: STALE,
    enabled: !!id,
  })
}

export function useAlerts(limit = 100) {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.alerts(limit),
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<Alert[]>(`/alerts?limit=${limit}`, mockAlerts, { signal, token })
    },
    staleTime: STALE,
  })
}

export function useEquityCurve() {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.equityCurve,
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<PerformanceMetric[]>("/performance/equity", mockEquityCurve, { signal, token })
    },
    staleTime: STALE,
  })
}

export function useCapitalSummary() {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.capital,
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<CapitalSummary>("/capital/summary", mockCapitalSummary, { signal, token })
    },
    staleTime: STALE,
  })
}

export function useMarketRegime() {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.regime,
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<MarketRegime>("/market/regime", mockMarketRegime, { signal, token })
    },
    staleTime: STALE,
  })
}

export function usePortfolioWeights() {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.weights,
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<PortfolioWeight[]>("/portfolio/weights", mockPortfolioWeights, { signal, token })
    },
    staleTime: STALE,
  })
}

export function usePortfolioMetrics() {
  const getToken = useApiToken()
  return useQuery({
    queryKey: qk.portfolioMetrics,
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return getWithFallback<PortfolioMetrics>("/portfolio/metrics", mockPortfolioMetrics, { signal, token })
    },
    staleTime: STALE,
  })
}

export function useDeleteStrategy() {
  const qc = useQueryClient()
  const getToken = useApiToken()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiSend(`/strategies/${id}`, "DELETE", undefined, { token })
    },
    onSuccess: () => {
      toast.success("Strategy deleted")
      qc.invalidateQueries({ queryKey: qk.strategies })
    },
    onError: () => toast.error("Could not delete strategy"),
  })
}

export function useUploadBacktest(strategyId: string) {
  const qc = useQueryClient()
  const getToken = useApiToken()
  return useMutation({
    mutationFn: async (body: { expected_pnl: number; notes?: string }) => {
      const token = await getToken()
      return apiSend("/backtest/upload", "POST", { strategy_id: strategyId, ...body }, { token })
    },
    onSuccess: () => {
      toast.success("Backtest subido correctamente")
      qc.invalidateQueries({ queryKey: qk.metrics(strategyId) })
    },
    onError: () => toast.error("No se pudo subir el backtest"),
  })
}

export function useSetWeight() {
  const qc = useQueryClient()
  const getToken = useApiToken()
  return useMutation({
    mutationFn: async (body: { strategy_id: string; target_weight: number }) => {
      const token = await getToken()
      return apiSend("/portfolio/weights", "POST", body, { token })
    },
    onSuccess: () => {
      toast.success("Target weight updated")
      qc.invalidateQueries({ queryKey: qk.weights })
    },
    onError: () => toast.error("Could not update weight"),
  })
}
