import { brandIcon, navItems } from "@/components/layout/nav-items"

describe("navItems", () => {
  it("includes the core sections with unique hrefs", () => {
    const hrefs = navItems.map((i) => i.href)
    expect(hrefs).toEqual(
      expect.arrayContaining(["/", "/strategies", "/portfolio", "/market-regime", "/alerts", "/settings"]),
    )
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it("each item has a label and an icon", () => {
    for (const item of navItems) {
      expect(item.label).toBeTruthy()
      expect(item.icon).toBeDefined()
    }
  })

  it("exposes a brand icon", () => {
    expect(brandIcon).toBeDefined()
  })
})
