/* ============================================================
   Overview Page — Fissionaire Nuclear Intelligence Dashboard
   StatsRow, TimelineChart, CategoryDonut, Latest 10 signals.
   Server component that fetches data at request time.
   ============================================================ */

import { getStaticData } from "@/lib/notion";
import StatsRow from "@/components/dashboard/StatsRow";
import TimelineChart from "@/components/dashboard/TimelineChart";
import CategoryDonut from "@/components/dashboard/CategoryDonut";
import SignalTable from "@/components/dashboard/SignalTable";
import Card from "@/components/ui/Card";
import { Radio, AlertTriangle, CalendarDays, Database } from "lucide-react";

export default async function OverviewPage() {
  const { signals, sources } = await getStaticData();

  // Compute stats
  const totalSignals = signals.length;
  const criticalAlerts = signals.filter((s) => s.urgency === "Critical").length;

  // Signals from this week (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekSignals = signals.filter((s) => {
    if (!s.dateCaptured) return false;
    return new Date(s.dateCaptured) >= weekAgo;
  }).length;

  const activeSources = sources.filter((s) => s.active).length;

  const stats = [
    {
      icon: Radio,
      value: totalSignals,
      label: "Total Signals",
      color: "#00B7FF",
    },
    {
      icon: AlertTriangle,
      value: criticalAlerts,
      label: "Critical Alerts",
      color: "#EF4C23",
    },
    {
      icon: CalendarDays,
      value: thisWeekSignals,
      label: "This Week",
      color: "#C0FF9E",
    },
    {
      icon: Database,
      value: activeSources,
      label: "Active Sources",
      color: "#CC66FF",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-display font-black uppercase tracking-wider text-text-primary">
          Overview
        </h2>
        <p className="text-sm font-body text-text-muted mt-1">
          Nuclear intelligence at a glance
        </p>
      </div>

      {/* Stats */}
      <StatsRow stats={stats} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline chart — takes 2 cols */}
        <Card className="lg:col-span-2 p-5" noHover>
          <h3 className="text-xs font-display font-bold uppercase tracking-wider text-text-muted mb-4">
            Signal Volume by Week
          </h3>
          <TimelineChart signals={signals} />
        </Card>

        {/* Category donut */}
        <Card className="p-5" noHover>
          <h3 className="text-xs font-display font-bold uppercase tracking-wider text-text-muted mb-4">
            Signals by Category
          </h3>
          <CategoryDonut signals={signals} />
        </Card>
      </div>

      {/* Latest signals table */}
      <div>
        <h3 className="text-xs font-display font-bold uppercase tracking-wider text-text-muted mb-4">
          Latest Signals
        </h3>
        <SignalTable signals={signals} limit={10} />
      </div>
    </div>
  );
}
