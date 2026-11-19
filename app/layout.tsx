import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Performance Monitor",
  description: "Watch all relevant data about Quant Trading",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#142720",
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
          {process.env.NODE_ENV === "production" && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  );
}
