/* ============================================================
   Trends Page — Charts for signal analysis
   - Stacked area chart (signal volume by category over time)
   - Urgency distribution bar chart
   - Fissionaire relevance pie chart
   ============================================================ */

import { getAllSignals } from "@/lib/notion";
import Card from "@/components/ui/Card";
import TimelineChart from "@/components/dashboard/TimelineChart";
import UrgencyBarChart from "@/components/dashboard/UrgencyBarChart";
import RelevancePieChart from "@/components/dashboard/RelevancePieChart";

export default async function TrendsPage() {
  const signals = await getAllSignals();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-display font-black uppercase tracking-wider text-text-primary">
          Trends
        </h2>
        <p className="text-sm font-body text-text-muted mt-1">
          Signal volume, urgency distribution, and relevance analysis
        </p>
      </div>

      {/* Signal volume by category */}
      <Card noHover className="p-5">
        <h3 className="text-xs font-display font-bold uppercase tracking-wider text-text-muted mb-4">
          Signal Volume by Category Over Time
        </h3>
        <TimelineChart signals={signals} />
      </Card>

      {/* Two-column: urgency + relevance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card noHover className="p-5">
          <h3 className="text-xs font-display font-bold uppercase tracking-wider text-text-muted mb-4">
            Urgency Distribution
          </h3>
          <UrgencyBarChart signals={signals} />
        </Card>

        <Card noHover className="p-5">
          <h3 className="text-xs font-display font-bold uppercase tracking-wider text-text-muted mb-4">
            Fissionaire Relevance
          </h3>
          <RelevancePieChart signals={signals} />
        </Card>
      </div>
    </div>
  );
}
