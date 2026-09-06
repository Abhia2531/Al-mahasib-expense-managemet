import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Al Mahasib — Project Finance",
    template: "%s · Al Mahasib",
  },
  description:
    "Track expenses, advances and progress billing separately for every project.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>

        <AppHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-border py-6">
          <p className="mx-auto max-w-6xl px-4 text-xs text-muted sm:px-6">
            Al Mahasib Project Finance — every figure is scoped to a single
            project.
          </p>
        </footer>
      </body>
    </html>
  );
}
