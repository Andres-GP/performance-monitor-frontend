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
        dashboard: "Dashboard",
        strategies: "Strategies",
        portfolio: "Portfolio",
        marketRegime: "Market Regime",
        alerts: "Alerts",
        settings: "Settings",
      },
      header: {
        strategyDetail: "Strategy Detail",
        user: "User",
        closeSession: "Log out",
        openMenu: "Open menu",
        navigation: "Navigation",
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

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the Strategies title on the root route", () => {
    mockUsePathname.mockReturnValue("/");
    render(<Header />);

    expect(
      screen.getByRole("heading", { name: "Strategies" }),
    ).toBeInTheDocument();
  });
});
