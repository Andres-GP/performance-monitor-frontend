import { render, screen } from "@testing-library/react";
import { MonitoringPortfolioDashboard } from "@/components/portfolio/monitoring-dashboard";

const useQueryMock = jest.fn();
const refetchMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

jest.mock("@/lib/queries", () => ({
  useApiToken: () => jest.fn().mockResolvedValue("session-token"),
  useCapitalSummary: () => ({ data: undefined, isError: false, refetch: jest.fn() }),
  useExecutionEvents: () => ({ data: undefined, isLoading: false, isError: false, refetch: refetchMock }),
  usePortfolioTrades: () => ({ data: undefined, isLoading: false, isError: false, refetch: refetchMock }),
}));

jest.mock("@/lib/api-client", () => ({ apiGet: jest.fn() }));

jest.mock("@/lib/i18n/context", () => ({
  useI18n: () => ({
    locale: "en",
    t: (message: string, values?: Record<string, string | number>) =>
      Object.entries(values ?? {}).reduce(
        (result, [key, value]) => result.replace(`{${key}}`, String(value)),
        message,
      ),
    dict: {
      portfolio: {
        monitoringTitle: "Portfolio monitoring and EDA",
        monitoringSubtitle: "Portfolio data",
        selectPortfolio: "Portfolio",
        currentEquity: "Current equity",
        currentDrawdown: "Current drawdown",
        openAlerts: "Open alerts",
        capitalTracked: "Reported capital",
        capitalUnavailable: "Reported capital unavailable.",
        monitoringLoading: "Loading portfolio monitoring…",
        monitoringError: "Could not load portfolio monitoring.",
        noPortfolios: "No normalized portfolios are available.",
        retry: "Retry",
        equityCurve: "Portfolio equity curve",
        noEquitySamples: "No portfolio equity samples are available.",
        correlation: "Strategy correlation",
        noCorrelations: "No strategy correlations are available.",
        strategiesHeading: "Portfolio strategies",
        attention: "Attention",
        warning: "Warning",
        alertCount: "{count} alerts",
        noAlerts: "No open alerts",
        lastHeartbeat: "Last heartbeat",
        expected: "Expected",
        observed: "Observed",
        noExecutionDetails: "Execution details unavailable.",
        dataUnavailableNote: "Missing risk data is not estimated.",
        observedDemo: "Demo account",
        observedLive: "Real capital",
        modeUnconfirmed: "Mode not confirmed",
        modeMismatch: "Observed mode differs from configuration",
        accountDemo: "Demo",
        accountReal: "Real",
        modeObservedAt: "Last observed",
      },
    },
  }),
}));

const queryResult = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: refetchMock,
  ...overrides,
});

describe("MonitoringPortfolioDashboard", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    refetchMock.mockReset();
  });

  it("shows a retry action when portfolio loading fails", () => {
    useQueryMock.mockReturnValueOnce(
      queryResult({ isError: true, error: new Error("offline") }),
    ).mockReturnValue(queryResult());

    render(<MonitoringPortfolioDashboard />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load portfolio monitoring.",
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("distinguishes expected and observed account modes", () => {
    useQueryMock
      .mockReturnValueOnce(
        queryResult({ data: { items: [{ id: "portfolio-a" }], total: 1 } }),
      )
      .mockReturnValueOnce(
        queryResult({
          data: {
            portfolio: { id: "portfolio-a" },
            metrics: null,
            alerts: [],
            equity_curve: [],
            strategies: [
              {
                id: "strategy-a",
                expected_mode: "demo",
                current_mode: "live",
                mode_status: "mode_mismatch",
                mode_observed_at: "2026-11-19T12:00:00Z",
                alerts: [],
              },
            ],
          },
        }),
      )
      .mockReturnValueOnce(
        queryResult({ data: { items: [] } }),
      );

    render(<MonitoringPortfolioDashboard />);

    expect(screen.getByText("Expected:")).toBeInTheDocument();
    expect(screen.getByText("Observed:")).toBeInTheDocument();
    expect(screen.getByText("Observed mode differs from configuration")).toBeInTheDocument();
    expect(screen.queryByText("Mode not confirmed")).not.toBeInTheDocument();
  });

  it("shows available OOS, live, and risk baseline data per strategy", () => {
    useQueryMock
      .mockReturnValueOnce(
        queryResult({ data: { items: [{ id: "portfolio-a" }], total: 1 } }),
      )
      .mockReturnValueOnce(
        queryResult({
          data: {
            portfolio: { id: "portfolio-a", daily_dd_limit_pct: 5, total_dd_limit_pct: 8 },
            metrics: null,
            alerts: [],
            equity_curve: [],
            strategies: [{
              id: "strategy-a",
              name: "Strategy A",
              baselines: { oos_profit_factor: 1.4, mc_expected_max_dd_pct: 12, bt_max_loss_streak: 8 },
              strategy_dd_total_limit_pct: 7,
              metrics: {
                profit_factor: 1.6,
                trade_count: 40,
                current_loss_streak: 3,
                total_dd_pct: 4,
                max_dd_pct: 10,
                rolling_50: { n_trades: 40, profit_factor: 1.5, win_rate: 55, expectancy_pct: 0.3 },
                trades_per_year_live_90d: 80,
                trades_per_year_expected: 100,
                frequency_vs_expected_pct: -20,
              },
              alerts: [],
            }],
          },
        }),
      )
      .mockReturnValueOnce(queryResult({ data: { items: [], total: 0 } }));

    render(<MonitoringPortfolioDashboard />);

    expect(screen.getByText("Live profit factor")).toBeInTheDocument();
    expect(screen.getByText("OOS profit factor")).toBeInTheDocument();
    expect(screen.getByText("Current / worst backtest streak")).toBeInTheDocument();
    expect(screen.getByText("Current / historical max DD")).toBeInTheDocument();
    expect(screen.getByText("Expected MC DD / limit")).toBeInTheDocument();
    expect(screen.getByText("Historical max drawdown")).toBeInTheDocument();
  });

  it("shows a correlation load failure separately from an empty correlation set", () => {
    useQueryMock
      .mockReturnValueOnce(queryResult({ data: { items: [{ id: "portfolio-a" }], total: 1 } }))
      .mockReturnValueOnce(queryResult({
        data: { portfolio: { id: "portfolio-a" }, metrics: null, alerts: [], equity_curve: [], strategies: [] },
      }))
      .mockReturnValueOnce(queryResult({ isError: true, error: new Error("offline") }));

    render(<MonitoringPortfolioDashboard />);

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load portfolio monitoring.");
    expect(screen.queryByText("No strategy correlations are available.")).not.toBeInTheDocument();
  });
});
