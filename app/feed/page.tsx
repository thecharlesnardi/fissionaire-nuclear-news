/* ============================================================
   Feed Page — Full signal table with all filters
   Action items banner at top showing pending actions.
   ============================================================ */

import { getAllSignals } from "@/lib/notion";
import SignalTable from "@/components/dashboard/SignalTable";
import Card from "@/components/ui/Card";
import { AlertTriangle } from "lucide-react";

export default async function FeedPage() {
  const signals = await getAllSignals();

  // Collect action items
  const actionSignals = signals.filter((s) => s.actionRequired && s.actionItem);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-display font-black uppercase tracking-wider text-text-primary">
          Intelligence Feed
        </h2>
        <p className="text-sm font-body text-text-muted mt-1">
          All captured signals with full filter controls
        </p>
      </div>

      {/* Action items banner */}
      {actionSignals.length > 0 && (
        <Card noHover className="p-5 border-orange-flat/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-flat" />
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-orange-flat">
              Pending Action Items ({actionSignals.length})
            </h3>
          </div>
          <ul className="space-y-2">
            {actionSignals.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-3 text-sm font-body"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-flat mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-text-primary">{s.actionItem}</span>
                  <span className="text-text-muted ml-2 text-xs font-mono">
                    — {s.signal.slice(0, 60)}...
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Full signal table with filters */}
      <SignalTable signals={signals} showFilters />
    </div>
  );
}
