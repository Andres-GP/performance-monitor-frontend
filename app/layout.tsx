import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Alphaca Capital | Portfolio Monitor",
  description: "Portfolio and strategy monitoring for Alphaca Capital.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#1f3d36",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <ClerkProvider>
      <html
        lang={locale}
        className="dark"
      >
      <body className="font-sans antialiased bg-background text-foreground">
          <Providers locale={locale}>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
