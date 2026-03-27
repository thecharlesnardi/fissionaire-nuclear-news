/* ============================================================
   SignalTable — Interactive table with filters & expandable rows
   Shows signals with category/urgency/relevance badges.
   Client component for interactivity.
   ============================================================ */

"use client";

import { useState, useMemo } from "react";
import type { Signal, Category, Urgency, Relevance } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

interface SignalTableProps {
  signals: Signal[];
  /** Show filter dropdowns above the table */
  showFilters?: boolean;
  /** Max rows to display (0 = all) */
  limit?: number;
}

const CATEGORIES: Category[] = [
  "Regulatory",
  "Commercial",
  "Supply Chain",
  "Sentiment",
  "Investment",
  "Policy",
  "Technical",
  "Competitor",
];

const URGENCIES: Urgency[] = ["Critical", "High", "Medium", "Low"];

const RELEVANCES: Relevance[] = [
  "Direct Impact",
  "Adjacent",
  "Market Context",
  "Background",
];

export default function SignalTable({
  signals,
  showFilters = false,
  limit = 0,
}: SignalTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [filterRelevance, setFilterRelevance] = useState<string>("all");

  // Apply filters
  const filtered = useMemo(() => {
    let result = signals;
    if (filterCategory !== "all") {
      result = result.filter((s) => s.category === filterCategory);
    }
    if (filterUrgency !== "all") {
      result = result.filter((s) => s.urgency === filterUrgency);
    }
    if (filterRelevance !== "all") {
      result = result.filter((s) => s.fissionaireRelevance === filterRelevance);
    }
    if (limit > 0) {
      result = result.slice(0, limit);
    }
    return result;
  }, [signals, filterCategory, filterUrgency, filterRelevance, limit]);

  const selectClasses =
    "bg-bg-interactive border border-white/10 text-text-primary text-sm rounded-[4px] px-3 py-1.5 font-body focus:outline-none focus:border-blue-flat/40";

  return (
    <div>
      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={selectClasses}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className={selectClasses}
          >
            <option value="all">All Urgency</option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select
            value={filterRelevance}
            onChange={(e) => setFilterRelevance(e.target.value)}
            className={selectClasses}
          >
            <option value="all">All Relevance</option>
            {RELEVANCES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <span className="text-text-muted text-sm font-mono self-center">
            {filtered.length} signal{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Table */}
      <Card noHover className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider w-8">
                  {/* expand toggle */}
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                  Signal
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                  Urgency
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-display text-xs uppercase tracking-wider">
                  Relevance
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((signal) => {
                const isExpanded = expandedId === signal.id;
                return (
                  <tbody key={signal.id}>
                    <tr
                      className="border-b border-white/6 hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : signal.id)
                      }
                    >
                      <td className="px-4 py-3 text-text-muted">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs whitespace-nowrap">
                        {formatDate(signal.dateAnnounced)}
                      </td>
                      <td className="px-4 py-3 text-text-primary font-body max-w-md">
                        <div className="flex items-center gap-2">
                          {signal.actionRequired && (
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-flat flex-shrink-0" />
                          )}
                          <span className="truncate">{signal.signal}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={signal.category} variant="category" />
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={signal.urgency} variant="urgency" />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          label={signal.fissionaireRelevance}
                          variant="relevance"
                        />
                      </td>
                    </tr>
                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="bg-bg-raised/50">
                        <td colSpan={6} className="px-8 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            {signal.rawSignal && (
                              <div>
                                <h4 className="text-text-muted text-xs font-display uppercase tracking-wider mb-2">
                                  Raw Signal
                                </h4>
                                <p className="text-text-secondary font-body leading-relaxed">
                                  {signal.rawSignal}
                                </p>
                              </div>
                            )}
                            {signal.analysis && (
                              <div>
                                <h4 className="text-text-muted text-xs font-display uppercase tracking-wider mb-2">
                                  Analysis
                                </h4>
                                <p className="text-text-secondary font-body leading-relaxed">
                                  {signal.analysis}
                                </p>
                              </div>
                            )}
                            {signal.actionItem && (
                              <div>
                                <h4 className="text-text-muted text-xs font-display uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-orange-flat" />
                                  Action Item
                                </h4>
                                <p className="text-orange-flat font-body leading-relaxed">
                                  {signal.actionItem}
                                </p>
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              {signal.sourceUrl && (
                                <a
                                  href={signal.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-blue-flat hover:underline text-xs font-mono"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  View Source
                                </a>
                              )}
                              {signal.source && (
                                <Badge label={signal.source} variant="source" />
                              )}
                              {signal.sourceAccount && (
                                <span className="text-text-muted text-xs font-mono">
                                  {signal.sourceAccount}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-8 py-12 text-center text-text-muted font-body">
            No signals match the current filters.
          </div>
        )}
      </Card>
    </div>
  );
}
