/* ============================================================
   Sidebar — Navigation component
   Collapsible on mobile, always visible on desktop.
   Links: Overview, Feed, Digest, Competitors, Sources, Trends
   ============================================================ */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  FileText,
  Building2,
  Database,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/feed", label: "Feed", icon: Radio },
  { href: "/digest", label: "Digest", icon: FileText },
  { href: "/competitors", label: "Competitors", icon: Building2 },
  { href: "/sources", label: "Sources", icon: Database },
  { href: "/trends", label: "Trends", icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button — fixed at top-left */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-[8px] bg-bg-card border border-white/10"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-text-primary" />
        ) : (
          <Menu className="w-5 h-5 text-text-primary" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-56 bg-bg-card border-r border-white/10
          flex flex-col
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo area (mobile) */}
        <div className="p-5 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-[#018DFF] to-[#02A2FE] flex items-center justify-center">
              <span className="text-white font-display font-black text-xs">
                F
              </span>
            </div>
            <span className="font-display font-bold text-sm text-text-primary uppercase tracking-wide">
              Fissionaire
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-body
                  transition-all duration-150
                  ${
                    isActive
                      ? "bg-blue-flat/10 text-blue-flat border border-blue-flat/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="p-4 border-t border-white/6">
          <p className="text-[10px] font-mono text-text-muted text-center uppercase tracking-widest">
            Intelligence v1.0
          </p>
        </div>
      </nav>
    </>
  );
}
