"use server"

import { cookies } from "next/headers"
import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config"

// Server action that persists the selected locale in an httpOnly-free cookie so
// it can be read on both the server (layout) and the client.
export async function setLocaleCookie(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return
  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
}
