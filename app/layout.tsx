import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/shell/bottom-nav";
import { TopNav } from "@/components/shell/top-nav";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: {
    default: "Public Receipt — Every public project deserves a public receipt",
    template: "%s | Public Receipt",
  },
  description:
    "Search public budget records in plain language, inspect official sources, and understand what is known, reported and still unknown.",
  applicationName: "Public Receipt",
  openGraph: {
    type: "website",
    siteName: "Public Receipt",
    title: "Public Receipt — Every public project deserves a public receipt",
    description:
      "Search public budget records in plain language and inspect the official evidence behind every answer.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#171717",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <main className="mx-auto min-h-[calc(100vh-8rem)] w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
