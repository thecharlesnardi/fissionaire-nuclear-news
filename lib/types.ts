/* ============================================================
   Fissionaire Nuclear Intelligence — TypeScript Types
   Matches Notion database schemas exactly
   ============================================================ */

// ---------- Enums / Union Types ----------

export type SourceType =
  | "X/Twitter"
  | "Federal Register"
  | "NRC"
  | "DOE"
  | "EDGAR/SEC"
  | "Congress.gov"
  | "News"
  | "Other";

export type Category =
  | "Regulatory"
  | "Commercial"
  | "Supply Chain"
  | "Sentiment"
  | "Investment"
  | "Policy"
  | "Technical"
  | "Competitor";

export type Subcategory =
  | "Nuclear Companies"
  | "NRC/Regulatory"
  | "Procurement"
  | "AI Data Center"
  | "Industrial Heat"
  | "Fuel Cycle"
  | "Hyperscaler"
  | "International"
  | "VC/Funding"
  | "Sentiment"
  | "MSR R&D";

export type Urgency = "Critical" | "High" | "Medium" | "Low";

export type Relevance =
  | "Direct Impact"
  | "Adjacent"
  | "Market Context"
  | "Background";

export type DigestStatus = "Draft" | "Published" | "Reviewed";

export type SignalQuality =
  | "Tier 1 - Primary"
  | "Tier 2 - Valuable"
  | "Tier 3 - Background";

export type SourcePlatform =
  | "X/Twitter"
  | "Government"
  | "News"
  | "Academic"
  | "Other";

export type SourceCategory =
  | "Nuclear Companies"
  | "Regulatory"
  | "Procurement"
  | "AI Data Center"
  | "Industrial Heat"
  | "Fuel Cycle"
  | "Hyperscaler"
  | "International"
  | "VC/Funding"
  | "Sentiment"
  | "MSR R&D"
  | "Analyst";

// ---------- Core Data Models ----------

/** Signal from the Daily Intelligence Feed */
export interface Signal {
  id: string;
  signal: string; // title
  dateCaptured: string | null;
  dateAnnounced: string | null;
  source: SourceType | null;
  category: Category | null;
  subcategory: Subcategory | null;
  urgency: Urgency | null;
  fissionaireRelevance: Relevance | null;
  sourceUrl: string | null;
  sourceAccount: string | null;
  rawSignal: string | null;
  analysis: string | null;
  actionRequired: boolean;
  actionItem: string | null;
}

/** Weekly Intelligence Digest */
export interface WeeklyDigest {
  id: string;
  week: string; // title
  weekStart: string | null;
  status: DigestStatus | null;
  topSignals: number | null;
  criticalAlerts: number | null;
  regulatorySummary: string | null;
  commercialSummary: string | null;
  supplyChainSummary: string | null;
  sentimentSummary: string | null;
  investmentSummary: string | null;
  fissionaireActionItems: string | null;
}

/** Source from the Source Registry */
export interface Source {
  id: string;
  source: string; // title
  platform: SourcePlatform | null;
  category: SourceCategory[];
  signalQuality: SignalQuality | null;
  lastChecked: string | null;
  notes: string | null;
  url: string | null;
  active: boolean;
}

// ---------- Aggregated data shape ----------

export interface DashboardData {
  signals: Signal[];
  digests: WeeklyDigest[];
  sources: Source[];
}
