"use client"

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

export function useStrategies() {
  return useQuery({
    queryKey: qk.strategies,
    queryFn: () => getWithFallback<Strategy[]>("/strategies", mockStrategies),
    staleTime: STALE,
  })
}

export function useStrategy(id: string) {
  const all = useStrategies()
  const strategy = all.data?.data.find((s) => s.id === id)
  return { strategy, isFallback: all.data?.isFallback ?? false, isLoading: all.isLoading }
}

export function useTrades(id: string) {
  return useQuery({
    queryKey: qk.trades(id),
    queryFn: () => getWithFallback<Trade[]>(`/strategies/${id}/trades`, mockTradesFor(id)),
    staleTime: STALE,
    enabled: !!id,
  })
}

export function useMetrics(id: string) {
  return useQuery({
    queryKey: qk.metrics(id),
    queryFn: () =>
      getWithFallback<PerformanceMetric[]>(`/performance/metrics/${id}`, mockMetricsFor(id)),
    staleTime: STALE,
    enabled: !!id,
  })
}

export function useAlerts(limit = 100) {
  return useQuery({
    queryKey: qk.alerts(limit),
    queryFn: () => getWithFallback<Alert[]>(`/alerts?limit=${limit}`, mockAlerts),
    staleTime: STALE,
  })
}

export function useEquityCurve() {
  return useQuery({
    queryKey: qk.equityCurve,
    queryFn: () =>
      getWithFallback<PerformanceMetric[]>("/performance/equity", mockEquityCurve),
    staleTime: STALE,
  })
}

export function useCapitalSummary() {
  return useQuery({
    queryKey: qk.capital,
    queryFn: () => getWithFallback<CapitalSummary>("/capital/summary", mockCapitalSummary),
    staleTime: STALE,
  })
}

export function useMarketRegime() {
  return useQuery({
    queryKey: qk.regime,
    queryFn: () => getWithFallback<MarketRegime>("/market/regime", mockMarketRegime),
    staleTime: STALE,
  })
}

export function usePortfolioWeights() {
  return useQuery({
    queryKey: qk.weights,
    queryFn: () => getWithFallback<PortfolioWeight[]>("/portfolio/weights", mockPortfolioWeights),
    staleTime: STALE,
  })
}

export function usePortfolioMetrics() {
  return useQuery({
    queryKey: qk.portfolioMetrics,
    queryFn: () =>
      getWithFallback<PortfolioMetrics>("/portfolio/metrics", mockPortfolioMetrics),
    staleTime: STALE,
  })
}

export function useDeleteStrategy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiSend(`/strategies/${id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Strategy deleted")
      qc.invalidateQueries({ queryKey: qk.strategies })
    },
    onError: () => toast.error("Could not delete strategy"),
  })
}

export function useSetWeight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { strategy_id: string; target_weight: number }) =>
      apiSend("/portfolio/weights", "POST", body),
    onSuccess: () => {
      toast.success("Target weight updated")
      qc.invalidateQueries({ queryKey: qk.weights })
    },
    onError: () => toast.error("Could not update weight"),
  })
}
