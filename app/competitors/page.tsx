/* ============================================================
   Competitors Page — Grid of CompetitorCards
   Filters signals by matching company name in Signal title.
   ============================================================ */

import { getAllSignals } from "@/lib/notion";
import CompetitorCard from "@/components/dashboard/CompetitorCard";

const COMPETITORS = [
  "Kairos Power",
  "TerraPower",
  "Oklo",
  "NuScale",
  "X-energy",
  "Natura Resources",
];

export default async function CompetitorsPage() {
  const signals = await getAllSignals();

  // Build competitor data by matching company name in signal title
  const competitorData = COMPETITORS.map((name) => {
    const matchingSignals = signals.filter((s) =>
      s.signal.toLowerCase().includes(name.toLowerCase()),
    );
    return { name, signals: matchingSignals };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-display font-black uppercase tracking-wider text-text-primary">
          Competitors
        </h2>
        <p className="text-sm font-body text-text-muted mt-1">
          Competitive intelligence — signals mentioning key industry players
        </p>
      </div>

      {/* Competitor cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitorData.map((competitor) => (
          <CompetitorCard
            key={competitor.name}
            name={competitor.name}
            signals={competitor.signals}
          />
        ))}
      </div>
    </div>
  );
}
