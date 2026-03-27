/* ============================================================
   Sources Page — Source Registry displayed as a table
   Grouped by Signal Quality tier. Category tags as badges.
   ============================================================ */

import { getAllSources } from "@/lib/notion";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import type { SignalQuality } from "@/lib/types";

const TIER_ORDER: SignalQuality[] = [
  "Tier 1 - Primary",
  "Tier 2 - Valuable",
  "Tier 3 - Background",
];

const TIER_COLORS: Record<string, string> = {
  "Tier 1 - Primary": "#C0FF9E",
  "Tier 2 - Valuable": "#02A2FE",
  "Tier 3 - Background": "#706d68",
};

export default async function SourcesPage() {
  const sources = await getAllSources();

  // Group sources by signal quality tier
  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    sources: sources.filter((s) => s.signalQuality === tier),
  })).filter((g) => g.sources.length > 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-display font-black uppercase tracking-wider text-text-primary">
          Source Registry
        </h2>
        <p className="text-sm font-body text-text-muted mt-1">
          Intelligence sources organized by quality tier
        </p>
      </div>

      {/* Tier groups */}
      {grouped.map(({ tier, sources: tierSources }) => (
        <div key={tier}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: TIER_COLORS[tier] }}
            />
            <h3
              className="text-xs font-display font-bold uppercase tracking-wider"
              style={{ color: TIER_COLORS[tier] }}
            >
              {tier}
            </h3>
            <span className="text-xs font-mono text-text-muted">
              ({tierSources.length})
            </span>
          </div>

          <Card noHover className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                      Source
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                      Last Checked
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider w-8">
                      {/* link */}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tierSources.map((src) => (
                    <tr
                      key={src.id}
                      className="border-b border-white/6 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-text-primary font-body font-medium">
                        {src.source}
                      </td>
                      <td className="px-4 py-3">
                        {src.platform && (
                          <Badge label={src.platform} variant="source" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {src.category.map((cat) => (
                            <Badge key={cat} label={cat} variant="category" />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted font-mono text-xs">
                        {formatDate(src.lastChecked)}
                      </td>
                      <td className="px-4 py-3">
                        {src.active ? (
                          <CheckCircle className="w-4 h-4 text-lime" />
                        ) : (
                          <XCircle className="w-4 h-4 text-text-muted" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-flat hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
