import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Al Mahasib — project finance",
    template: "%s · Al Mahasib",
  },
  description:
    "Track expenses, advances and progress billing separately for every project.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#171613" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <a
          href="#main"
          className="sr-only rounded-md bg-surface px-4 py-2 text-[13px] font-medium shadow-[var(--shadow-pop)] focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50"
        >
          Skip to content
        </a>

        <AppHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="mt-16 border-t border-border">
          <div className="mx-auto max-w-[1100px] px-4 py-5 text-[12px] text-faint sm:px-6">
            Al Mahasib · every figure is scoped to one project
          </div>
        </footer>
      </body>
    </html>
  );
}
