/* ============================================================
   Badge — Reusable pill component
   Renders urgency, relevance, category, or source badges
   with the correct brand color for each value.
   ============================================================ */

import { urgencyColor, relevanceColor, categoryColor } from "@/lib/utils";
import type { Category, Urgency, Relevance } from "@/lib/types";

type BadgeVariant = "urgency" | "relevance" | "category" | "source";

interface BadgeProps {
  label: string | null;
  variant: BadgeVariant;
}

/** Map source types to colors */
function sourceColor(source: string): string {
  const map: Record<string, string> = {
    "X/Twitter": "#02A2FE",
    "Federal Register": "#018DFF",
    NRC: "#018DFF",
    DOE: "#F47E20",
    "EDGAR/SEC": "#9ECC7E",
    "Congress.gov": "#CC66FF",
    News: "#706d68",
    Other: "#706d68",
  };
  return map[source] || "#706d68";
}

/** Get the correct color based on variant and label value */
function getColor(variant: BadgeVariant, label: string): string {
  switch (variant) {
    case "urgency":
      return urgencyColor(label as Urgency);
    case "relevance":
      return relevanceColor(label as Relevance);
    case "category":
      return categoryColor(label as Category);
    case "source":
      return sourceColor(label);
    default:
      return "#706d68";
  }
}

export default function Badge({ label, variant }: BadgeProps) {
  if (!label) return null;

  const color = getColor(variant, label);

  // Use a translucent background of the brand color
  // with the solid color as text
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-xs font-medium font-mono whitespace-nowrap"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  );
}
