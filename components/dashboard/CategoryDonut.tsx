/* ============================================================
   CategoryDonut — Recharts PieChart (donut) by category
   Shows signal count by category with brand data-viz colors.
   Client component for Recharts interactivity.
   ============================================================ */

"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Signal, Category } from "@/lib/types";
import { categoryColor } from "@/lib/utils";

interface CategoryDonutProps {
  signals: Signal[];
}

const CATEGORY_ORDER: Category[] = [
  "Regulatory",
  "Commercial",
  "Supply Chain",
  "Sentiment",
  "Investment",
  "Policy",
  "Technical",
  "Competitor",
];

export default function CategoryDonut({ signals }: CategoryDonutProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    signals.forEach((s) => {
      const cat = s.category || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return CATEGORY_ORDER.filter((cat) => counts[cat]).map((cat) => ({
      name: cat,
      value: counts[cat],
      color: categoryColor(cat),
    }));
  }, [signals]);

  const total = signals.length;

  return (
    <div className="w-full h-[280px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            dataKey="value"
            stroke="none"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
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
            itemStyle={{ color: "#e8e6e3" }}
            formatter={(value, name) => [
              `${value} signal${value !== 1 ? "s" : ""}`,
              String(name),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Centered total label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-mono font-medium text-text-primary">
          {total}
        </span>
        <span className="text-xs font-body text-text-muted uppercase tracking-wider">
          Signals
        </span>
      </div>

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
          </div>
        ))}
      </div>
    </div>
  );
}
