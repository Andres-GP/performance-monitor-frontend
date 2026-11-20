import { isBackendRouteAllowed } from "@/lib/server/backend-routes";

describe("backend proxy route allowlist", () => {
  it.each([
    ["GET", ["health"]],
    ["GET", ["strategies"]],
    ["GET", ["strategies", "strategy-1", "trades"]],
    ["GET", ["strategies", "strategy-1", "equity"]],
    ["GET", ["portfolios", "portfolio-1", "correlation"]],
    ["GET", ["portfolio", "metrics"]],
    ["GET", ["weekly", "reports", "latest"]],
    ["POST", ["alerts", "123", "ack"]],
    ["POST", ["portfolio", "weights"]],
  ])("allows %s /%s", (method, path) => {
    expect(isBackendRouteAllowed(method, path)).toBe(true);
  });

  it.each([
    ["DELETE", ["strategies", "strategy-1"]],
    ["POST", ["monitor", "events"]],
    ["POST", ["strategies", "start"]],
    ["POST", ["backtest", "upload"]],
    ["GET", ["admin", "secrets"]],
    ["GET", ["market", "regime"]],
    ["GET", ["strategies", "strategy-1", "unknown"]],
  ])("blocks %s /%s", (method, path) => {
    expect(isBackendRouteAllowed(method, path)).toBe(false);
  });
});
