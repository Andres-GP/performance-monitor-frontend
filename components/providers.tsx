"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import type { Locale } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/context";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60_000,
            gcTime: 1000 * 60 * 60,
          },
        },
      }),
  );

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider initialLocale={locale}>
          {children}
          <Toaster theme="dark" position="top-right" richColors />
        </I18nProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
