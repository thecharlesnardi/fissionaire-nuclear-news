/* ============================================================
   UrgencyBarChart — Recharts BarChart showing urgency distribution
   Client component for Recharts interactivity.
   ============================================================ */

"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Signal, Urgency } from "@/lib/types";
import { urgencyColor } from "@/lib/utils";

interface UrgencyBarChartProps {
  signals: Signal[];
}

const URGENCY_ORDER: Urgency[] = ["Critical", "High", "Medium", "Low"];

export default function UrgencyBarChart({ signals }: UrgencyBarChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    signals.forEach((s) => {
      const urg = s.urgency || "Unknown";
      counts[urg] = (counts[urg] || 0) + 1;
    });

    return URGENCY_ORDER.map((u) => ({
      name: u,
      value: counts[u] || 0,
      color: urgencyColor(u),
    }));
  }, [signals]);

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{
              fill: "#706d68",
              fontSize: 11,
              fontFamily: "IBM Plex Mono",
            }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: "#706d68",
              fontSize: 11,
              fontFamily: "IBM Plex Mono",
            }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F1F1F",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#e8e6e3",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} signals`, "Count"]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
