import { brandIcon, navItems } from "@/components/layout/nav-items";

describe("navItems", () => {
  it("includes the available sections and excludes strategies with unique hrefs", () => {
    const hrefs = navItems.map((i) => i.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/portfolio",
        "/weekly-review",
        "/alerts",
      ]),
    );
    expect(hrefs).not.toContain("/strategies");
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("exposes a brand icon", () => {
    expect(brandIcon).toBeDefined();
  });
});
