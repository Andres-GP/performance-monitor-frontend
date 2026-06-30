import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatNumber,
  formatPercent,
} from "@/lib/format"

describe("formatCurrency", () => {
  it("formats a number as USD with no decimals", () => {
    expect(formatCurrency(1500)).toBe("$1,500")
  })

  it("returns an em dash for null/undefined/NaN", () => {
    expect(formatCurrency(null)).toBe("—")
    expect(formatCurrency(undefined)).toBe("—")
    expect(formatCurrency(Number.NaN)).toBe("—")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0")
  })
})

describe("formatPercent", () => {
  it("multiplies by 100 and appends a percent sign with default 1 digit", () => {
    expect(formatPercent(0.625)).toBe("62.5%")
  })

  it("respects a custom number of digits", () => {
    expect(formatPercent(0.6234, 2)).toBe("62.34%")
  })

  it("returns an em dash for nullish/NaN values", () => {
    expect(formatPercent(null)).toBe("—")
    expect(formatPercent(undefined)).toBe("—")
    expect(formatPercent(Number.NaN)).toBe("—")
  })
})

describe("formatNumber", () => {
  it("formats with 2 decimals by default", () => {
    expect(formatNumber(1.844)).toBe("1.84")
  })

  it("respects a custom number of digits", () => {
    expect(formatNumber(1.844, 1)).toBe("1.8")
  })

  it("returns an em dash for nullish/NaN values", () => {
    expect(formatNumber(null)).toBe("—")
    expect(formatNumber(undefined)).toBe("—")
    expect(formatNumber(Number.NaN)).toBe("—")
  })
})

describe("formatDate", () => {
  it("formats a valid ISO timestamp", () => {
    const out = formatDate("2026-06-26T18:30:00Z")
    expect(out).not.toBe("—")
    expect(typeof out).toBe("string")
  })

  it("returns an em dash for empty/invalid input", () => {
    expect(formatDate(null)).toBe("—")
    expect(formatDate("")).toBe("—")
    expect(formatDate("not-a-date")).toBe("—")
  })
})

describe("formatDateShort", () => {
  it("formats a valid ISO timestamp", () => {
    const out = formatDateShort("2026-06-26T18:30:00Z")
    expect(out).not.toBe("—")
    expect(typeof out).toBe("string")
  })

  it("returns an em dash for empty/invalid input", () => {
    expect(formatDateShort(undefined)).toBe("—")
    expect(formatDateShort("nope")).toBe("—")
  })
})
