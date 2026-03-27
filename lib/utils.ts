/* ============================================================
   Fissionaire — Utility Functions
   Color mappings, date formatting, helpers
   ============================================================ */

import type { Category, Urgency, Relevance } from "./types";

// ---------- Color Maps ----------

/** Returns the brand hex color for a given urgency level */
export function urgencyColor(urgency: Urgency | null): string {
  switch (urgency) {
    case "Critical":
      return "#EF4C23";
    case "High":
      return "#F47E20";
    case "Medium":
      return "#02A2FE";
    case "Low":
      return "#706d68";
    default:
      return "#706d68";
  }
}

/** Returns the brand hex color for a given relevance level */
export function relevanceColor(relevance: Relevance | null): string {
  switch (relevance) {
    case "Direct Impact":
      return "#C0FF9E";
    case "Adjacent":
      return "#02A2FE";
    case "Market Context":
      return "#F47E20";
    case "Background":
      return "#706d68";
    default:
      return "#706d68";
  }
}

/** Returns a brand hex color for a given category */
export function categoryColor(category: Category | null): string {
  switch (category) {
    case "Regulatory":
      return "#018DFF";
    case "Commercial":
      return "#F26522";
    case "Supply Chain":
      return "#C0FF9E";
    case "Sentiment":
      return "#CC66FF";
    case "Investment":
      return "#02A2FE";
    case "Policy":
      return "#F47E20";
    case "Technical":
      return "#9ECC7E";
    case "Competitor":
      return "#EF4C23";
    default:
      return "#706d68";
  }
}

/** Format an ISO date string to a friendly display format */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Convert an ISO date string to a relative time string (e.g. "2 days ago") */
export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffDay < 0) return "upcoming";
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek === 1) return "1 week ago";
  if (diffWeek < 8) return `${diffWeek} weeks ago`;
  return formatDate(dateStr);
}

/**
 * Get the ISO week string for a date (e.g. "2026-W12")
 * Used for grouping signals by week in charts
 */
export function getWeekKey(dateStr: string | null): string {
  if (!dateStr) return "unknown";
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (d.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000),
  );
  const weekNum = Math.ceil((dayOfYear + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
