import { cookies } from "next/headers"
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config"

// Reads the active locale from the cookie on the server. Falls back to the
// default locale (English) when no valid cookie is present.
export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : defaultLocale
}
