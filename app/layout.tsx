import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/shell/bottom-nav";
import { TopNav } from "@/components/shell/top-nav";

export const metadata: Metadata = {
  title: {
    default: "Public Receipt",
    template: "%s | Public Receipt",
  },
  description:
    "Ask what government promised your community, inspect the official record, and see what evidence exists.",
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
