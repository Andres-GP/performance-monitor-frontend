import { brandIcon, navItems } from "@/components/layout/nav-items";

describe("navItems", () => {
  it("includes the core sections with unique hrefs", () => {
    const hrefs = navItems.map((i) => i.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/",
        "/portfolio",
        "/market-regime",
        "/alerts",
        "/settings",
      ]),
    );
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("exposes a brand icon", () => {
    expect(brandIcon).toBeDefined();
  });
});
