/**
 * @jest-environment node
 */
const cookieGet = jest.fn()

jest.mock("next/headers", () => ({
  cookies: async () => ({ get: cookieGet }),
}))

import { getLocale } from "@/lib/i18n/server"

describe("getLocale", () => {
  beforeEach(() => cookieGet.mockReset())

  it("returns the locale stored in the cookie when valid", async () => {
    cookieGet.mockReturnValue({ value: "es" })
    expect(await getLocale()).toBe("es")
  })

  it("falls back to the default locale when the cookie is missing", async () => {
    cookieGet.mockReturnValue(undefined)
    expect(await getLocale()).toBe("en")
  })

  it("falls back to the default locale when the cookie value is invalid", async () => {
    cookieGet.mockReturnValue({ value: "fr" })
    expect(await getLocale()).toBe("en")
  })
})
