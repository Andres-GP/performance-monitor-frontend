import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/header";

const mockUsePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ signOut: jest.fn() }),
  useUser: () => ({ user: null }),
}));

jest.mock("@/lib/i18n/context", () => ({
  useI18n: () => ({
    dict: {
      nav: {
        strategies: "Strategies",
        portfolio: "Portfolio",
        alerts: "Alerts",
      },
      header: {
        strategyDetail: "Strategy Detail",
        user: "User",
        closeSession: "Log out",
        openMenu: "Open menu",
        navigation: "Navigation",
        apiChecking: "Checking backend",
        apiConnected: "Backend connected",
        apiDataStale: "Market feed is stale",
        apiAwaitingEvents: "Waiting for market events",
        apiUnavailable: "Backend unavailable",
      },
      common: { appName: "App" },
    },
  }),
}));

jest.mock("@/components/layout/language-selector", () => ({
  LanguageSelector: () => <div data-testid="language-selector" />,
}));
jest.mock("@/components/layout/sidebar-nav", () => ({
  SidebarNav: () => <div data-testid="sidebar-nav" />,
}));
jest.mock("@/components/layout/backend-status", () => ({
  BackendStatus: () => <div data-testid="backend-status" />,
}));

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the Strategies title on the root route", () => {
    mockUsePathname.mockReturnValue("/strategies");
    render(<Header />);

    expect(
      screen.getByRole("heading", { name: "Strategies" }),
    ).toBeInTheDocument();
  });
});
