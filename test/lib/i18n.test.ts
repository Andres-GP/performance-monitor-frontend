import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  localeNames,
  locales,
} from "@/lib/i18n/config"
import { dictionaries, en, es, getDictionary } from "@/lib/i18n/dictionaries"

describe("i18n config", () => {
  it("exposes the supported locales", () => {
    expect(locales).toEqual(["en", "es"])
    expect(defaultLocale).toBe("en")
    expect(LOCALE_COOKIE).toBe("locale")
  })

  it("maps locale display names", () => {
    expect(localeNames.en).toBe("English")
    expect(localeNames.es).toBe("Español")
  })

  describe("isLocale", () => {
    it("returns true for supported locales", () => {
      expect(isLocale("en")).toBe(true)
      expect(isLocale("es")).toBe(true)
    })

    it("returns false for unsupported / nullish values", () => {
      expect(isLocale("fr")).toBe(false)
      expect(isLocale(undefined)).toBe(false)
      expect(isLocale(null)).toBe(false)
    })
  })
})

describe("dictionaries", () => {
  it("getDictionary returns the matching dictionary", () => {
    expect(getDictionary("en")).toBe(en)
    expect(getDictionary("es")).toBe(es)
  })

  it("falls back to English for unknown locales", () => {
    // @ts-expect-error - exercising the runtime fallback branch
    expect(getDictionary("de")).toBe(en)
  })

  it("keeps the same key shape between locales", () => {
    expect(Object.keys(es.dashboard)).toEqual(Object.keys(en.dashboard))
    expect(Object.keys(dictionaries.es.nav)).toEqual(Object.keys(dictionaries.en.nav))
  })
})
