/* ============================================================
   CompetitorCard — Card for a single competitor
   Shows company name, signal count, latest 3 signals.
   ============================================================ */

import type { Signal } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface CompetitorCardProps {
  name: string;
  signals: Signal[];
}

export default function CompetitorCard({ name, signals }: CompetitorCardProps) {
  // Show latest 3 signals
  const latest = signals.slice(0, 3);

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[8px] bg-orange-flat/10">
            <Building2 className="w-5 h-5 text-orange-flat" />
          </div>
          <div>
            <h3 className="text-text-primary font-display font-bold text-sm uppercase tracking-wide">
              {name}
            </h3>
            <p className="text-text-muted font-mono text-xs">
              {signals.length} signal{signals.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Latest signals */}
      <div className="space-y-3">
        {latest.map((signal) => (
          <div key={signal.id} className="border-l-2 border-white/10 pl-3 py-1">
            <p className="text-text-secondary text-xs font-body leading-relaxed line-clamp-2">
              {signal.signal}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-text-muted text-[10px] font-mono">
                {formatDate(signal.dateAnnounced)}
              </span>
              <Badge label={signal.urgency} variant="urgency" />
            </div>
          </div>
        ))}

        {signals.length === 0 && (
          <p className="text-text-muted text-xs font-body italic">
            No signals captured yet.
          </p>
        )}
      </div>
    </Card>
  );
}
