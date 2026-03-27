/* ============================================================
   Digest Page — Weekly Intelligence Digests
   Latest digest displayed as formatted sections.
   Archive list below.
   ============================================================ */

import { getAllDigests } from "@/lib/notion";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { FileText, Calendar, AlertTriangle } from "lucide-react";

export default async function DigestPage() {
  const digests = await getAllDigests();

  // Latest digest is first (sorted descending by weekStart)
  const latest = digests[0] || null;
  const archive = digests.slice(1);

  // Digest section component
  function DigestSection({
    title,
    content,
    color,
  }: {
    title: string;
    content: string | null;
    color: string;
  }) {
    if (!content) return null;
    return (
      <div className="space-y-2">
        <h4
          className="text-xs font-display font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {title}
        </h4>
        <p className="text-sm font-body text-text-secondary leading-relaxed">
          {content}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-display font-black uppercase tracking-wider text-text-primary">
          Weekly Digest
        </h2>
        <p className="text-sm font-body text-text-muted mt-1">
          CEO-level weekly intelligence synthesis
        </p>
      </div>

      {/* Latest digest */}
      {latest ? (
        <Card noHover className="p-6">
          {/* Digest header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[8px] bg-blue-flat/10">
                <FileText className="w-5 h-5 text-blue-flat" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-text-primary">
                  {latest.week}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar className="w-3 h-3 text-text-muted" />
                  <span className="text-xs font-mono text-text-muted">
                    {formatDate(latest.weekStart)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {latest.status && (
                <Badge label={latest.status} variant="source" />
              )}
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-text-secondary">
                  <span className="text-blue-flat font-medium">
                    {latest.topSignals}
                  </span>{" "}
                  top signals
                </span>
                <span className="text-text-secondary">
                  <span className="text-orange-flat font-medium">
                    {latest.criticalAlerts}
                  </span>{" "}
                  critical
                </span>
              </div>
            </div>
          </div>

          {/* Digest sections */}
          <div className="space-y-6">
            <DigestSection
              title="Regulatory"
              content={latest.regulatorySummary}
              color="#018DFF"
            />
            <DigestSection
              title="Commercial"
              content={latest.commercialSummary}
              color="#F26522"
            />
            <DigestSection
              title="Supply Chain"
              content={latest.supplyChainSummary}
              color="#C0FF9E"
            />
            <DigestSection
              title="Sentiment"
              content={latest.sentimentSummary}
              color="#CC66FF"
            />
            <DigestSection
              title="Investment"
              content={latest.investmentSummary}
              color="#02A2FE"
            />

            {/* Action items */}
            {latest.fissionaireActionItems && (
              <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-flat" />
                  <h4 className="text-xs font-display font-bold uppercase tracking-wider text-orange-flat">
                    Fissionaire Action Items
                  </h4>
                </div>
                <div className="text-sm font-body text-text-secondary leading-relaxed whitespace-pre-line">
                  {latest.fissionaireActionItems}
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card noHover className="p-8 text-center">
          <p className="text-text-muted font-body">
            No weekly digests available yet.
          </p>
        </Card>
      )}

      {/* Archive */}
      {archive.length > 0 && (
        <div>
          <h3 className="text-xs font-display font-bold uppercase tracking-wider text-text-muted mb-4">
            Previous Digests
          </h3>
          <div className="space-y-3">
            {archive.map((digest) => (
              <Card key={digest.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-text-muted" />
                    <div>
                      <h4 className="text-sm font-display font-semibold text-text-primary">
                        {digest.week}
                      </h4>
                      <span className="text-xs font-mono text-text-muted">
                        {formatDate(digest.weekStart)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    {digest.status && (
                      <Badge label={digest.status} variant="source" />
                    )}
                    <span className="text-text-muted">
                      {digest.topSignals} signals
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
