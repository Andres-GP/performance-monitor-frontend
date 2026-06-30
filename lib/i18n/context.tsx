"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react"
import { useRouter } from "next/navigation"
import { setLocaleCookie } from "@/app/actions/locale"
import { defaultLocale, type Locale } from "./config"
import { getDictionary, type Dictionary } from "./dictionaries"

// Replaces {placeholder} tokens in a template string with the provided values.
// Example: interpolate("Trend: {value}", { value: "Up" }) -> "Trend: Up"
export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}

interface I18nContextValue {
  locale: Locale
  dict: Dictionary
  /** Interpolation helper for dictionary strings that contain {placeholders}. */
  t: (template: string, vars?: Record<string, string | number>) => string
  setLocale: (locale: Locale) => void
  isPending: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const dict = useMemo(() => getDictionary(locale), [locale])

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return
      // Update the UI immediately, then persist the choice in the cookie so the
      // server (layout, <html lang>) stays in sync on the next navigation.
      setLocaleState(next)
      if (typeof document !== "undefined") {
        document.documentElement.lang = next
      }
      startTransition(async () => {
        await setLocaleCookie(next)
        router.refresh()
      })
    },
    [locale, router],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dict, t: interpolate, setLocale, isPending }),
    [locale, dict, setLocale, isPending],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Defensive fallback so a component rendered outside the provider does not
    // crash the whole tree during development.
    return {
      locale: defaultLocale,
      dict: getDictionary(defaultLocale),
      t: interpolate,
      setLocale: () => {},
      isPending: false,
    }
  }
  return ctx
}
