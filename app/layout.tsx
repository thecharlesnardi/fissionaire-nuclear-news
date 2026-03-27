/* ============================================================
   Root Layout — Fissionaire Nuclear Intelligence Dashboard
   Fonts: Inter (display), Outfit (body), IBM Plex Mono (data)
   Dark background, sidebar navigation, header with logo
   ============================================================ */

import type { Metadata } from "next";
import { Inter, Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

// ---------- Font Loading ----------

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// ---------- Metadata ----------

export const metadata: Metadata = {
  title: "Fissionaire Nuclear Intelligence",
  description:
    "Real-time nuclear industry intelligence dashboard — regulatory signals, competitive analysis, and market trends for Fissionaire.",
};

// ---------- Layout ----------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full bg-bg-primary text-text-primary antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Navigation */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                {/* Logo */}
                <img
                  src="https://cdn.prod.website-files.com/6762f71de68537688f613b88/679426a0b91b57b90a70f5f9_Asset%2037.webp"
                  alt="Fissionaire Logo"
                  className="h-8 w-auto"
                />
                <div className="hidden sm:block">
                  <h1 className="text-sm font-display font-black uppercase tracking-wider text-text-primary">
                    Nuclear Intelligence
                  </h1>
                  <p className="text-[10px] font-body text-text-muted uppercase tracking-widest">
                    Signal Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-xs font-mono text-text-muted">
                  Live Data
                </span>
                <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              </div>
            </header>

            {/* Page content (scrollable) */}
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
