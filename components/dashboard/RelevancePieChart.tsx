/* ============================================================
   RelevancePieChart — Recharts PieChart for Fissionaire Relevance
   Shows distribution of signals by relevance level.
   Client component for Recharts interactivity.
   ============================================================ */

"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Signal, Relevance } from "@/lib/types";
import { relevanceColor } from "@/lib/utils";

interface RelevancePieChartProps {
  signals: Signal[];
}

const RELEVANCE_ORDER: Relevance[] = [
  "Direct Impact",
  "Adjacent",
  "Market Context",
  "Background",
];

export default function RelevancePieChart({ signals }: RelevancePieChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    signals.forEach((s) => {
      const rel = s.fissionaireRelevance || "Unknown";
      counts[rel] = (counts[rel] || 0) + 1;
    });

    return RELEVANCE_ORDER.filter((r) => counts[r]).map((r) => ({
      name: r,
      value: counts[r],
      color: relevanceColor(r),
    }));
  }, [signals]);

  return (
    <div className="w-full h-[280px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            dataKey="value"
            stroke="none"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F1F1F",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#e8e6e3",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "12px",
            }}
            formatter={(value, name) => [
              `${value} signal${value !== 1 ? "s" : ""}`,
              String(name),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] font-body text-text-muted">
              {entry.name}
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
