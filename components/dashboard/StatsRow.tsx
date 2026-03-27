/* ============================================================
   StatsRow — 4 stat cards in a responsive grid
   Icon + number (IBM Plex Mono) + label (Outfit)
   ============================================================ */

import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";

export interface StatItem {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color?: string; // hex color for the icon accent
}

interface StatsRowProps {
  stats: StatItem[];
}

export default function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                {/* Number — IBM Plex Mono */}
                <p
                  className="text-3xl font-medium font-mono tracking-tight"
                  style={{ color: stat.color || "#e8e6e3" }}
                >
                  {stat.value}
                </p>
                {/* Label — Outfit */}
                <p className="mt-1 text-sm text-text-secondary font-body">
                  {stat.label}
                </p>
              </div>
              {/* Icon */}
              <div
                className="p-2 rounded-[8px]"
                style={{
                  backgroundColor: `${stat.color || "#00B7FF"}15`,
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: stat.color || "#00B7FF" }}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
