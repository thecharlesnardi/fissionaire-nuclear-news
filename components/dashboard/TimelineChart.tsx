/* ============================================================
   TimelineChart — Recharts AreaChart of signal volume by week
   Stacked by category with brand colors. Responsive.
   Client component for Recharts interactivity.
   ============================================================ */

"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Signal, Category } from "@/lib/types";
import { categoryColor, getWeekKey } from "@/lib/utils";

interface TimelineChartProps {
  signals: Signal[];
}

const CATEGORIES: Category[] = [
  "Regulatory",
  "Commercial",
  "Policy",
  "Investment",
  "Supply Chain",
  "Sentiment",
  "Technical",
  "Competitor",
];

export default function TimelineChart({ signals }: TimelineChartProps) {
  const data = useMemo(() => {
    // Group signals by week
    const weekMap: Record<string, Record<string, number>> = {};
    signals.forEach((s) => {
      const week = getWeekKey(s.dateAnnounced || s.dateCaptured);
      if (week === "unknown") return;
      if (!weekMap[week]) {
        weekMap[week] = {};
        CATEGORIES.forEach((c) => (weekMap[week][c] = 0));
      }
      const cat = s.category || "Unknown";
      weekMap[week][cat] = (weekMap[week][cat] || 0) + 1;
    });

    // Sort weeks and return as array
    return Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, counts]) => ({
        week,
        ...counts,
      }));
  }, [signals]);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
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
            itemStyle={{ fontFamily: "IBM Plex Mono, monospace" }}
          />
          {CATEGORIES.map((category) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId="1"
              fill={categoryColor(category)}
              stroke={categoryColor(category)}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
