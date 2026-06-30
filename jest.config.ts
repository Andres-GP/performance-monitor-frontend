import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  // Path to the Next.js app so next/jest can load next.config and .env files.
  dir: "./",
})

// Custom Jest configuration. Coverage is collected from the testable units of
// the app (pure libs + presentational components) and gated at 70% so the suite
// fails if coverage regresses below the agreed threshold.
const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // `server-only` throws when imported outside an RSC bundler; stub it in tests.
    "^server-only$": "<rootDir>/test/mocks/empty.ts",
  },
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "components/shared/**/*.{ts,tsx}",
    "components/layout/**/*.{ts,tsx}",
    "components/tradingview/tv-widget.tsx",
    "components/strategies/strategies-table.tsx",
    "components/strategies/trades-table.tsx",
    "components/alerts/alerts-view.tsx",
    "components/market-regime/regime-widget.tsx",
    "types/**/*.{ts,tsx}",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

export default createJestConfig(config)
