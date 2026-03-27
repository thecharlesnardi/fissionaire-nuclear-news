/* ============================================================
   Fissionaire — Notion Data Layer
   Queries Notion databases and maps to TypeScript types.
   Falls back to realistic mock data when NOTION_API_KEY is absent.
   ============================================================ */

import { Client } from "@notionhq/client";
import type {
  Signal,
  WeeklyDigest,
  Source,
  DashboardData,
  Category,
  Urgency,
  Relevance,
  SourceType,
  Subcategory,
  DigestStatus,
  SignalQuality,
  SourcePlatform,
  SourceCategory,
} from "./types";

// ---------- Notion Client ----------

const notion = process.env.NOTION_API_KEY
  ? new Client({ auth: process.env.NOTION_API_KEY })
  : null;

const DAILY_FEED_DB =
  process.env.NOTION_DAILY_FEED_DB || "aba0126025b443efa114ae91b112566c";
const WEEKLY_DIGEST_DB =
  process.env.NOTION_WEEKLY_DIGEST_DB || "94752c7cb14a484289c355c5c0ea4ca8";
const SOURCE_REGISTRY_DB =
  process.env.NOTION_SOURCE_REGISTRY_DB || "d4e754249b8a4564b275f913e9bb7ea1";

// ---------- Property Extractors ----------

/* eslint-disable @typescript-eslint/no-explicit-any */
function extractTitle(prop: any): string {
  if (!prop?.title) return "";
  return prop.title.map((t: any) => t.plain_text).join("") || "";
}

function extractRichText(prop: any): string | null {
  if (!prop?.rich_text) return null;
  const text = prop.rich_text.map((t: any) => t.plain_text).join("");
  return text || null;
}

function extractSelect(prop: any): string | null {
  return prop?.select?.name || null;
}

function extractMultiSelect(prop: any): string[] {
  if (!prop?.multi_select) return [];
  return prop.multi_select.map((s: any) => s.name);
}

function extractDate(prop: any): string | null {
  return prop?.date?.start || null;
}

function extractCheckbox(prop: any): boolean {
  return prop?.checkbox === true;
}

function extractUrl(prop: any): string | null {
  return prop?.url || null;
}

function extractNumber(prop: any): number | null {
  if (prop?.number === undefined || prop?.number === null) return null;
  return prop.number;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------- Data Fetchers ----------

export async function getAllSignals(): Promise<Signal[]> {
  if (!notion) return MOCK_SIGNALS;

  try {
    const response = await notion.databases.query({
      database_id: DAILY_FEED_DB,
      sorts: [{ property: "Date Captured", direction: "descending" }],
      page_size: 100,
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        signal: extractTitle(props["Signal"]),
        dateCaptured: extractDate(props["Date Captured"]),
        dateAnnounced: extractDate(props["Date Announced"]),
        source: extractSelect(props["Source"]) as SourceType | null,
        category: extractSelect(props["Category"]) as Category | null,
        subcategory: extractSelect(props["Subcategory"]) as Subcategory | null,
        urgency: extractSelect(props["Urgency"]) as Urgency | null,
        fissionaireRelevance: extractSelect(
          props["Fissionaire Relevance"],
        ) as Relevance | null,
        sourceUrl: extractUrl(props["Source URL"]),
        sourceAccount: extractRichText(props["Source Account"]),
        rawSignal: extractRichText(props["Raw Signal"]),
        analysis: extractRichText(props["Analysis"]),
        actionRequired: extractCheckbox(props["Action Required"]),
        actionItem: extractRichText(props["Action Item"]),
      };
    });
  } catch (error) {
    console.error("Failed to fetch signals from Notion:", error);
    return MOCK_SIGNALS;
  }
}

export async function getAllDigests(): Promise<WeeklyDigest[]> {
  if (!notion) return MOCK_DIGESTS;

  try {
    const response = await notion.databases.query({
      database_id: WEEKLY_DIGEST_DB,
      sorts: [{ property: "Week Start", direction: "descending" }],
      page_size: 50,
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        week: extractTitle(props["Week"]),
        weekStart: extractDate(props["Week Start"]),
        status: extractSelect(props["Status"]) as DigestStatus | null,
        topSignals: extractNumber(props["Top Signals"]),
        criticalAlerts: extractNumber(props["Critical Alerts"]),
        regulatorySummary: extractRichText(props["Regulatory Summary"]),
        commercialSummary: extractRichText(props["Commercial Summary"]),
        supplyChainSummary: extractRichText(props["Supply Chain Summary"]),
        sentimentSummary: extractRichText(props["Sentiment Summary"]),
        investmentSummary: extractRichText(props["Investment Summary"]),
        fissionaireActionItems: extractRichText(
          props["Fissionaire Action Items"],
        ),
      };
    });
  } catch (error) {
    console.error("Failed to fetch digests from Notion:", error);
    return MOCK_DIGESTS;
  }
}

export async function getAllSources(): Promise<Source[]> {
  if (!notion) return MOCK_SOURCES;

  try {
    const response = await notion.databases.query({
      database_id: SOURCE_REGISTRY_DB,
      sorts: [{ property: "Source", direction: "ascending" }],
      page_size: 100,
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        source: extractTitle(props["Source"]),
        platform: extractSelect(props["Platform"]) as SourcePlatform | null,
        category: extractMultiSelect(props["Category"]) as SourceCategory[],
        signalQuality: extractSelect(
          props["Signal Quality"],
        ) as SignalQuality | null,
        lastChecked: extractDate(props["Last Checked"]),
        notes: extractRichText(props["Notes"]),
        url: extractUrl(props["URL"]),
        active: extractCheckbox(props["Active"]),
      };
    });
  } catch (error) {
    console.error("Failed to fetch sources from Notion:", error);
    return MOCK_SOURCES;
  }
}

/** Fetch all three datasets together — main entry point */
export async function getStaticData(): Promise<DashboardData> {
  const [signals, digests, sources] = await Promise.all([
    getAllSignals(),
    getAllDigests(),
    getAllSources(),
  ]);
  return { signals, digests, sources };
}

/** Fetch recent signals (last N days) for the live API route */
export async function getRecentSignals(days: number = 7): Promise<Signal[]> {
  if (!notion) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return MOCK_SIGNALS.filter((s) => {
      if (!s.dateCaptured) return false;
      return new Date(s.dateCaptured) >= cutoff;
    });
  }

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const response = await notion.databases.query({
      database_id: DAILY_FEED_DB,
      filter: {
        property: "Date Captured",
        date: { on_or_after: cutoff.toISOString().split("T")[0] },
      },
      sorts: [{ property: "Date Captured", direction: "descending" }],
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        signal: extractTitle(props["Signal"]),
        dateCaptured: extractDate(props["Date Captured"]),
        dateAnnounced: extractDate(props["Date Announced"]),
        source: extractSelect(props["Source"]) as SourceType | null,
        category: extractSelect(props["Category"]) as Category | null,
        subcategory: extractSelect(props["Subcategory"]) as Subcategory | null,
        urgency: extractSelect(props["Urgency"]) as Urgency | null,
        fissionaireRelevance: extractSelect(
          props["Fissionaire Relevance"],
        ) as Relevance | null,
        sourceUrl: extractUrl(props["Source URL"]),
        sourceAccount: extractRichText(props["Source Account"]),
        rawSignal: extractRichText(props["Raw Signal"]),
        analysis: extractRichText(props["Analysis"]),
        actionRequired: extractCheckbox(props["Action Required"]),
        actionItem: extractRichText(props["Action Item"]),
      };
    });
  } catch (error) {
    console.error("Failed to fetch recent signals:", error);
    return [];
  }
}

// ============================================================
// MOCK DATA — Realistic signals for demo/development
// ============================================================

const MOCK_SIGNALS: Signal[] = [
  {
    id: "mock-1",
    signal:
      "NRC approves Kairos Power Hermes 2 construction permit application review",
    dateCaptured: "2026-03-25",
    dateAnnounced: "2026-03-24",
    source: "NRC",
    category: "Regulatory",
    subcategory: "NRC/Regulatory",
    urgency: "Critical",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://www.nrc.gov/",
    sourceAccount: "@NRCgov",
    rawSignal:
      "NRC has formally accepted Kairos Power's construction permit application for the Hermes 2 reactor, marking only the second non-LWR construction permit application in NRC history.",
    analysis:
      "This signals accelerating regulatory acceptance of advanced reactor designs. Kairos uses molten fluoride salt coolant — directly relevant to Fissionaire MSR R&D. The approval timeline will set precedent for our own regulatory pathway.",
    actionRequired: true,
    actionItem:
      "Schedule meeting with regulatory counsel to assess implications for Fissionaire licensing timeline.",
  },
  {
    id: "mock-2",
    signal:
      "Microsoft announces 2GW nuclear procurement target for AI data centers by 2030",
    dateCaptured: "2026-03-24",
    dateAnnounced: "2026-03-23",
    source: "News",
    category: "Commercial",
    subcategory: "Hyperscaler",
    urgency: "Critical",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://microsoft.com/",
    sourceAccount: null,
    rawSignal:
      "Microsoft has announced plans to procure 2GW of nuclear energy by 2030 to power its AI data center operations, expanding beyond the Three Mile Island restart deal.",
    analysis:
      "Massive demand signal. 2GW is ~2 large reactors worth of capacity. Microsoft is the most aggressive hyperscaler on nuclear. This validates the AI-nuclear thesis and creates potential offtake opportunity.",
    actionRequired: true,
    actionItem:
      "Prepare capability brief for Microsoft nuclear procurement team. Coordinate with BD on outreach strategy.",
  },
  {
    id: "mock-3",
    signal: "DOE announces $1.5B in advanced reactor fuel cycle funding",
    dateCaptured: "2026-03-22",
    dateAnnounced: "2026-03-21",
    source: "DOE",
    category: "Policy",
    subcategory: "Fuel Cycle",
    urgency: "High",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://www.energy.gov/",
    sourceAccount: "@ABORTNOT",
    rawSignal:
      "Department of Energy awards $1.5B through the Advanced Reactor Fuel Cycle Program to support HALEU production and advanced fuel fabrication facilities.",
    analysis:
      "Critical for Fissionaire fuel sourcing. HALEU supply has been the bottleneck for advanced reactor deployment. This funding should accelerate Centrus and other enrichment capabilities.",
    actionRequired: true,
    actionItem:
      "Review funding opportunity details. Assess eligibility for fuel cycle partnership applications.",
  },
  {
    id: "mock-4",
    signal:
      "Oklo files updated Aurora powerhouse design with NRC, targets 2028 operation",
    dateCaptured: "2026-03-21",
    dateAnnounced: "2026-03-20",
    source: "EDGAR/SEC",
    category: "Competitor",
    subcategory: "Nuclear Companies",
    urgency: "High",
    fissionaireRelevance: "Adjacent",
    sourceUrl: "https://www.sec.gov/",
    sourceAccount: null,
    rawSignal:
      "Oklo Inc. (OKLO) has submitted an updated Combined License Application for its Aurora powerhouse, a 15 MWe fast reactor design, targeting operational status by 2028.",
    analysis:
      "Oklo is moving aggressively post-IPO. Their 2028 target is ambitious. Fast reactor design differs from MSR approach but competes for same customer segments. Monitor their NRC timeline closely.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-5",
    signal:
      "Google signs 500MW nuclear PPA with TerraPower for Natrium deployment",
    dateCaptured: "2026-03-20",
    dateAnnounced: "2026-03-19",
    source: "News",
    category: "Commercial",
    subcategory: "Hyperscaler",
    urgency: "High",
    fissionaireRelevance: "Market Context",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "Google has signed a power purchase agreement with TerraPower for 500MW of nuclear energy from planned Natrium sodium-cooled fast reactors.",
    analysis:
      "Second major hyperscaler-nuclear deal this month. Validates the market but TerraPower's Natrium is a competing advanced reactor design. Google now joins Microsoft and Amazon in nuclear procurement.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-6",
    signal:
      "X-energy secures $800M Series D led by Ares Management for Xe-100 deployment",
    dateCaptured: "2026-03-19",
    dateAnnounced: "2026-03-18",
    source: "News",
    category: "Investment",
    subcategory: "VC/Funding",
    urgency: "Medium",
    fissionaireRelevance: "Market Context",
    sourceUrl: null,
    sourceAccount: "@Xenergy",
    rawSignal:
      "X-energy has closed an $800M Series D funding round led by Ares Management, with participation from existing investors. Proceeds will fund Xe-100 HTGR manufacturing facility.",
    analysis:
      "Largest private advanced nuclear funding round to date. Shows continued investor appetite for nuclear. Ares involvement signals institutional capital entering the space. Comp for Fissionaire fundraising.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-7",
    signal:
      "Senate Energy Committee advances ADVANCE Act II with bipartisan support",
    dateCaptured: "2026-03-18",
    dateAnnounced: "2026-03-17",
    source: "Congress.gov",
    category: "Policy",
    subcategory: "NRC/Regulatory",
    urgency: "High",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://www.congress.gov/",
    sourceAccount: null,
    rawSignal:
      "The Senate Energy and Natural Resources Committee voted 18-4 to advance the ADVANCE Act II, which would further streamline NRC licensing for advanced reactors and provide 10-year regulatory fee waivers.",
    analysis:
      "Regulatory tailwind. Fee waivers alone could save $10-20M in NRC licensing costs for an advanced reactor company. Bipartisan support (18-4) makes passage likely. Direct benefit to Fissionaire.",
    actionRequired: true,
    actionItem:
      "Brief board on ADVANCE Act II implications. Update financial model with potential fee savings.",
  },
  {
    id: "mock-8",
    signal:
      "NuScale reports Q4 2025 loss, pivots to smaller VOYGR-4 configuration",
    dateCaptured: "2026-03-17",
    dateAnnounced: "2026-03-16",
    source: "EDGAR/SEC",
    category: "Competitor",
    subcategory: "Nuclear Companies",
    urgency: "Medium",
    fissionaireRelevance: "Adjacent",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "NuScale Power (SMR) reported Q4 2025 net loss of $64M and announced pivot to smaller VOYGR-4 plant configuration after UAMPS project cancellation.",
    analysis:
      "NuScale continues to struggle with commercialization despite being first with NRC design certification. Their pivot suggests the large SMR plant model may not be economically viable. Validates smaller, modular approach.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-9",
    signal:
      "Amazon Web Services partners with Natura Resources on small modular reactors for data centers",
    dateCaptured: "2026-03-16",
    dateAnnounced: "2026-03-15",
    source: "News",
    category: "Commercial",
    subcategory: "AI Data Center",
    urgency: "High",
    fissionaireRelevance: "Adjacent",
    sourceUrl: null,
    sourceAccount: "@AWSCloud",
    rawSignal:
      "AWS announces strategic partnership with Natura Resources to develop small modular reactors adjacent to data center campuses in Virginia and Ohio.",
    analysis:
      "Third hyperscaler entering nuclear this quarter. AWS is prioritizing co-located generation. Natura Resources is a relatively new entrant — their partnership with AWS gives them significant credibility. Competitive landscape is intensifying.",
    actionRequired: true,
    actionItem:
      "Research Natura Resources capabilities and technology. Assess whether AWS data center nuclear play creates opportunity or threat.",
  },
  {
    id: "mock-10",
    signal:
      "IAEA report shows global nuclear capacity must triple by 2050 for net-zero targets",
    dateCaptured: "2026-03-15",
    dateAnnounced: "2026-03-14",
    source: "News",
    category: "Sentiment",
    subcategory: "International",
    urgency: "Medium",
    fissionaireRelevance: "Market Context",
    sourceUrl: null,
    sourceAccount: "@IAEAorg",
    rawSignal:
      "IAEA publishes updated energy outlook requiring 950 GW of global nuclear capacity by 2050, up from current ~440 GW, to meet Paris Agreement targets.",
    analysis:
      "Strong macro narrative for nuclear. 510 GW of new build represents $2-3T in market opportunity. Report will be widely cited by policymakers and investors.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-11",
    signal:
      "Centrus Energy completes first HALEU delivery to DOE under expanded contract",
    dateCaptured: "2026-03-14",
    dateAnnounced: "2026-03-13",
    source: "News",
    category: "Supply Chain",
    subcategory: "Fuel Cycle",
    urgency: "High",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: null,
    sourceAccount: "@CentrusEnergy",
    rawSignal:
      "Centrus Energy has delivered the first batch of HALEU under its expanded DOE contract, totaling 200 kg of 19.75% enriched uranium from the Piketon, Ohio facility.",
    analysis:
      "Critical milestone for the advanced reactor fuel supply chain. HALEU availability has been the single biggest near-term bottleneck. 200 kg is modest but proves production capability. Fissionaire should begin fuel sourcing discussions.",
    actionRequired: true,
    actionItem:
      "Initiate preliminary HALEU supply discussions with Centrus. Get pricing and timeline estimates.",
  },
  {
    id: "mock-12",
    signal:
      "Nuclear energy favorability reaches 65% in latest Gallup poll, highest since 2010",
    dateCaptured: "2026-03-13",
    dateAnnounced: "2026-03-12",
    source: "News",
    category: "Sentiment",
    subcategory: "Sentiment",
    urgency: "Low",
    fissionaireRelevance: "Background",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "Gallup's annual energy survey shows 65% of Americans now favor nuclear energy, up from 55% in 2023, driven by AI energy demand awareness and climate concerns.",
    analysis:
      "Favorable trend for nuclear sentiment. AI data center narrative has been the key driver of public opinion shift. Good for policy environment and community acceptance of new builds.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-13",
    signal:
      "Kairos Power Hermes demonstration reactor reaches first criticality at ETTP",
    dateCaptured: "2026-03-11",
    dateAnnounced: "2026-03-10",
    source: "NRC",
    category: "Technical",
    subcategory: "MSR R&D",
    urgency: "Critical",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://www.nrc.gov/",
    sourceAccount: "@KairosPower",
    rawSignal:
      "Kairos Power's Hermes low-power demonstration reactor has achieved first criticality at the East Tennessee Technology Park, making it the first new non-LWR to operate in the US in decades.",
    analysis:
      "Landmark achievement for the advanced reactor sector and specifically for molten salt technology. Hermes uses FLiBe coolant — directly relevant to Fissionaire MSR design. Operational data will be invaluable for our modeling.",
    actionRequired: true,
    actionItem:
      "Request technical briefing from Kairos on Hermes operational learnings. Assess implications for our MSR design parameters.",
  },
  {
    id: "mock-14",
    signal:
      "Federal Register publishes proposed rule for advanced reactor licensing modernization",
    dateCaptured: "2026-03-09",
    dateAnnounced: "2026-03-08",
    source: "Federal Register",
    category: "Regulatory",
    subcategory: "NRC/Regulatory",
    urgency: "High",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://www.federalregister.gov/",
    sourceAccount: null,
    rawSignal:
      "NRC publishes proposed 10 CFR Part 53 rule for licensing of advanced nuclear reactor technologies, establishing technology-inclusive, risk-informed framework.",
    analysis:
      "Part 53 is the regulatory framework we've been tracking. Technology-inclusive approach is favorable for MSR designs. 90-day comment period creates opportunity to shape the final rule.",
    actionRequired: true,
    actionItem:
      "Prepare detailed technical comments on Part 53 proposed rule. Engage regulatory counsel for 90-day comment submission.",
  },
  {
    id: "mock-15",
    signal: "TerraPower breaks ground on Natrium reactor in Kemmerer, Wyoming",
    dateCaptured: "2026-03-07",
    dateAnnounced: "2026-03-06",
    source: "News",
    category: "Competitor",
    subcategory: "Nuclear Companies",
    urgency: "Medium",
    fissionaireRelevance: "Market Context",
    sourceUrl: null,
    sourceAccount: "@TerraPower",
    rawSignal:
      "TerraPower holds groundbreaking ceremony for its 345 MWe Natrium sodium-cooled fast reactor at the former Naughton coal plant site in Kemmerer, Wyoming.",
    analysis:
      "TerraPower is executing well on its coal-to-nuclear site strategy. DOE cost-sharing deal and local community support are strong. Different technology than MSR but competing for similar policy support.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-16",
    signal:
      "South Korea signs MOU with US for joint advanced reactor development",
    dateCaptured: "2026-03-05",
    dateAnnounced: "2026-03-04",
    source: "News",
    category: "Policy",
    subcategory: "International",
    urgency: "Medium",
    fissionaireRelevance: "Market Context",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "DOE and South Korea's Ministry of Trade, Industry and Energy sign MOU for cooperation on advanced nuclear reactor development, SMR deployment, and fuel cycle services.",
    analysis:
      "Strengthens international nuclear cooperation. South Korea has strong nuclear engineering capabilities. Could open export market opportunities for US-designed advanced reactors.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-17",
    signal:
      "Breakthrough Energy Ventures leads $200M investment in molten salt battery technology",
    dateCaptured: "2026-03-03",
    dateAnnounced: "2026-03-02",
    source: "News",
    category: "Investment",
    subcategory: "VC/Funding",
    urgency: "Low",
    fissionaireRelevance: "Adjacent",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "Breakthrough Energy Ventures leads a $200M round in Ambri, developer of molten salt battery technology for grid-scale storage.",
    analysis:
      "Molten salt technology gaining broad investment interest beyond reactors. Ambri's success validates molten salt material science. Potential synergies in materials R&D.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-18",
    signal:
      "NRC staff recommends approval of GE-Hitachi BWRX-300 standard design",
    dateCaptured: "2026-03-01",
    dateAnnounced: "2026-02-28",
    source: "NRC",
    category: "Regulatory",
    subcategory: "NRC/Regulatory",
    urgency: "Medium",
    fissionaireRelevance: "Background",
    sourceUrl: "https://www.nrc.gov/",
    sourceAccount: "@NRCgov",
    rawSignal:
      "NRC staff issues Final Safety Evaluation Report recommending approval of GE-Hitachi's BWRX-300 small modular reactor standard design application.",
    analysis:
      "Second SMR to receive NRC design approval after NuScale. BWRX-300 is a simplified boiling water reactor, not an advanced design. Shows NRC review pipeline is functioning.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-19",
    signal: "Data center power demand forecast revised up 40% by IEA for 2030",
    dateCaptured: "2026-02-27",
    dateAnnounced: "2026-02-26",
    source: "News",
    category: "Sentiment",
    subcategory: "AI Data Center",
    urgency: "Medium",
    fissionaireRelevance: "Market Context",
    sourceUrl: null,
    sourceAccount: "@IEA",
    rawSignal:
      "International Energy Agency revises data center electricity demand forecast upward by 40% for 2030, projecting 1,200 TWh annually driven by AI training and inference workloads.",
    analysis:
      "Demand signal continues to grow. 1,200 TWh is roughly 5% of current global electricity production. Nuclear is the only carbon-free baseload technology that can scale to meet this demand.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-20",
    signal:
      "Congressional Budget Office scores nuclear PTC extension at $12B over 10 years",
    dateCaptured: "2026-02-25",
    dateAnnounced: "2026-02-24",
    source: "Congress.gov",
    category: "Policy",
    subcategory: "NRC/Regulatory",
    urgency: "Medium",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://www.congress.gov/",
    sourceAccount: null,
    rawSignal:
      "CBO scores the proposed nuclear Production Tax Credit extension bill at $12B over 10 years, covering advanced reactor and existing fleet operations.",
    analysis:
      "PTC extension would provide significant revenue certainty for new nuclear projects. $12B CBO score is manageable in current budget context. Enhances project financing attractiveness.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-21",
    signal:
      "Constellation Energy acquires 3 natural gas plants for nuclear-gas hybrid model",
    dateCaptured: "2026-02-22",
    dateAnnounced: "2026-02-21",
    source: "EDGAR/SEC",
    category: "Commercial",
    subcategory: "Nuclear Companies",
    urgency: "Low",
    fissionaireRelevance: "Background",
    sourceUrl: null,
    sourceAccount: "@ConstellationEG",
    rawSignal:
      "Constellation Energy announces acquisition of three natural gas peaking plants in PJM territory, citing nuclear-gas complementary dispatch strategy.",
    analysis:
      "Constellation is building a hybrid generation portfolio. Nuclear for baseload, gas for peaking. Shows market evolution toward firm power portfolios rather than pure-play approaches.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-22",
    signal:
      "Oak Ridge National Lab publishes MSR material corrosion study with promising Hastelloy-N results",
    dateCaptured: "2026-02-19",
    dateAnnounced: "2026-02-18",
    source: "DOE",
    category: "Technical",
    subcategory: "MSR R&D",
    urgency: "High",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://www.ornl.gov/",
    sourceAccount: "@ABORTNOT",
    rawSignal:
      "ORNL publishes 5-year corrosion study results showing modified Hastelloy-N alloy maintains structural integrity in fluoride salt environments up to 700C for 50,000 hours.",
    analysis:
      "Directly relevant to Fissionaire MSR materials selection. 50,000 hours at 700C is excellent for our operating envelope. Modified Hastelloy-N should be evaluated as primary structural material.",
    actionRequired: true,
    actionItem:
      "Obtain full ORNL report. Brief engineering team on Hastelloy-N test results. Update materials selection database.",
  },
  {
    id: "mock-23",
    signal:
      "Nuclear workforce shortage: DOE projects 20,000 new nuclear workers needed by 2030",
    dateCaptured: "2026-02-15",
    dateAnnounced: "2026-02-14",
    source: "DOE",
    category: "Supply Chain",
    subcategory: "Procurement",
    urgency: "Medium",
    fissionaireRelevance: "Adjacent",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "DOE workforce analysis projects a need for 20,000 additional nuclear engineers, technicians, and construction workers by 2030 to support the advanced reactor buildout.",
    analysis:
      "Workforce is becoming a binding constraint. Fissionaire should invest early in recruiting pipeline. Partner with university programs. Consider training program development.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-24",
    signal:
      "Canadian Nuclear Safety Commission harmonizes SMR review process with NRC",
    dateCaptured: "2026-02-12",
    dateAnnounced: "2026-02-11",
    source: "News",
    category: "Regulatory",
    subcategory: "International",
    urgency: "Low",
    fissionaireRelevance: "Background",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "CNSC and NRC announce harmonized review framework for small modular reactor designs, enabling parallel licensing in both countries.",
    analysis:
      "Regulatory harmonization reduces cost and time for dual US-Canada deployment. Canada is a strong potential market for advanced reactors given its nuclear infrastructure and climate commitments.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-25",
    signal:
      "Meta Platforms evaluating nuclear power for AI training clusters, sources say",
    dateCaptured: "2026-02-08",
    dateAnnounced: "2026-02-07",
    source: "X/Twitter",
    category: "Commercial",
    subcategory: "Hyperscaler",
    urgency: "Medium",
    fissionaireRelevance: "Market Context",
    sourceUrl: null,
    sourceAccount: "@Deepnucleus",
    rawSignal:
      "Sources indicate Meta Platforms is actively evaluating nuclear power options for its next-generation AI training clusters, with RFI sent to multiple nuclear developers.",
    analysis:
      "Fourth major tech company entering nuclear procurement. Meta has been slower than peers but the RFI process suggests serious intent. Monitor for formal announcements.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-26",
    signal: "Rolls-Royce SMR receives UK design acceptance confirmation",
    dateCaptured: "2026-02-04",
    dateAnnounced: "2026-02-03",
    source: "News",
    category: "Competitor",
    subcategory: "International",
    urgency: "Low",
    fissionaireRelevance: "Background",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "UK Office for Nuclear Regulation issues Design Acceptance Confirmation for Rolls-Royce SMR 470 MWe pressurized water reactor design.",
    analysis:
      "International SMR deployment accelerating. Rolls-Royce SMR is PWR-based, not advanced reactor, but shows global regulatory systems functioning. UK could be future export market.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-27",
    signal: "Nuclear-themed ETF (NLR) AUM crosses $5B for first time",
    dateCaptured: "2026-01-28",
    dateAnnounced: "2026-01-27",
    source: "News",
    category: "Investment",
    subcategory: "VC/Funding",
    urgency: "Low",
    fissionaireRelevance: "Background",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "VanEck Uranium+Nuclear Energy ETF (NLR) surpasses $5B in assets under management, reflecting sustained investor interest in nuclear energy equities.",
    analysis:
      "Public market indicator of nuclear investment thesis strength. $5B AUM in a sector ETF shows institutional capital is allocated. Supports valuation environment for nuclear startups.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-28",
    signal: "Idaho National Lab completes MARVEL microreactor fuel loading",
    dateCaptured: "2026-01-20",
    dateAnnounced: "2026-01-19",
    source: "DOE",
    category: "Technical",
    subcategory: "MSR R&D",
    urgency: "Medium",
    fissionaireRelevance: "Adjacent",
    sourceUrl: null,
    sourceAccount: "@INabortnot",
    rawSignal:
      "Idaho National Laboratory completes fuel loading for the MARVEL microreactor at the Transient Reactor Test Facility, preparing for initial criticality tests.",
    analysis:
      "MARVEL is a sodium-potassium cooled microreactor, different from MSR but relevant for understanding advanced reactor operational challenges at small scale.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-29",
    signal: "Uranium spot price reaches $95/lb, highest since 2007",
    dateCaptured: "2026-01-14",
    dateAnnounced: "2026-01-13",
    source: "News",
    category: "Supply Chain",
    subcategory: "Fuel Cycle",
    urgency: "Medium",
    fissionaireRelevance: "Adjacent",
    sourceUrl: null,
    sourceAccount: null,
    rawSignal:
      "Uranium spot price hits $95/lb U3O8 on the Numerco exchange, driven by utility term contracting and supply uncertainty from Kazakhstan production cuts.",
    analysis:
      "Rising uranium prices increase operating costs but also signal strong demand for nuclear fuel. MSR fuel economics differ from LWR but uranium price environment affects overall industry sentiment.",
    actionRequired: false,
    actionItem: null,
  },
  {
    id: "mock-30",
    signal:
      "DOE selects 4 sites for advanced reactor demonstration under ARDP Round 3",
    dateCaptured: "2026-01-07",
    dateAnnounced: "2026-01-06",
    source: "DOE",
    category: "Policy",
    subcategory: "Nuclear Companies",
    urgency: "High",
    fissionaireRelevance: "Direct Impact",
    sourceUrl: "https://www.energy.gov/",
    sourceAccount: "@ABORTNOT",
    rawSignal:
      "DOE announces Round 3 of the Advanced Reactor Demonstration Program, selecting 4 sites for advanced reactor deployment with total federal cost-share of $3.2B.",
    analysis:
      "ARDP Round 3 is significant — $3.2B in federal cost-share. Fissionaire should assess whether future rounds or related programs are applicable. The selected sites and technologies will shape near-term industry direction.",
    actionRequired: true,
    actionItem:
      "Review ARDP Round 3 selections. Identify lessons for Fissionaire's federal funding strategy.",
  },
];

const MOCK_DIGESTS: WeeklyDigest[] = [
  {
    id: "digest-1",
    week: "Week of March 24, 2026",
    weekStart: "2026-03-24",
    status: "Published",
    topSignals: 8,
    criticalAlerts: 2,
    regulatorySummary:
      "NRC accepted Kairos Power Hermes 2 construction permit application. Part 53 proposed rule published in Federal Register with 90-day comment period. Both are directly relevant to Fissionaire licensing pathway.",
    commercialSummary:
      "Microsoft announced 2GW nuclear procurement target. Google signed 500MW PPA with TerraPower. AWS partnered with Natura Resources. Hyperscaler nuclear adoption is accelerating dramatically.",
    supplyChainSummary:
      "Centrus completed first HALEU delivery under expanded DOE contract. 200 kg batch proves production capability. Uranium spot price stable at $92/lb.",
    sentimentSummary:
      "Nuclear favorability at 65% per Gallup. IEA revised data center power demand up 40% for 2030. Macro narrative strongly favors nuclear.",
    investmentSummary:
      "X-energy closed $800M Series D. Nuclear ETF AUM crossed $5B. Private and public market indicators positive.",
    fissionaireActionItems:
      "1. Schedule regulatory counsel meeting re: Hermes 2 implications\n2. Prepare capability brief for Microsoft procurement team\n3. Review Part 53 comment opportunity\n4. Initiate HALEU supply discussions with Centrus",
  },
  {
    id: "digest-2",
    week: "Week of March 17, 2026",
    weekStart: "2026-03-17",
    status: "Published",
    topSignals: 6,
    criticalAlerts: 1,
    regulatorySummary:
      "Senate Energy Committee advanced ADVANCE Act II with strong bipartisan support (18-4). NRC staff recommended approval of BWRX-300 standard design. Regulatory environment continues to strengthen.",
    commercialSummary:
      "NuScale pivoted to smaller VOYGR-4 configuration after reporting $64M Q4 loss. Constellation acquired gas plants for hybrid portfolio model.",
    supplyChainSummary:
      "DOE projects 20,000 new nuclear workers needed by 2030. Workforce development becoming critical constraint for industry growth.",
    sentimentSummary:
      "CBO scored nuclear PTC extension at $12B over 10 years, considered manageable. Growing bipartisan policy support.",
    investmentSummary:
      "Breakthrough Energy Ventures led $200M round in Ambri molten salt batteries. Cross-pollination of molten salt technology investment.",
    fissionaireActionItems:
      "1. Brief board on ADVANCE Act II implications\n2. Update financial model with PTC extension scenarios\n3. Obtain ORNL Hastelloy-N corrosion study report",
  },
];

const MOCK_SOURCES: Source[] = [
  {
    id: "src-1",
    source: "NRC Public Documents",
    platform: "Government",
    category: ["Regulatory", "Nuclear Companies"],
    signalQuality: "Tier 1 - Primary",
    lastChecked: "2026-03-25",
    notes:
      "Primary source for all NRC licensing actions, proposed rules, and enforcement",
    url: "https://www.nrc.gov/reading-rm.html",
    active: true,
  },
  {
    id: "src-2",
    source: "DOE Office of Nuclear Energy",
    platform: "Government",
    category: ["Fuel Cycle", "Nuclear Companies"],
    signalQuality: "Tier 1 - Primary",
    lastChecked: "2026-03-24",
    notes: "Funding announcements, ARDP updates, lab reports",
    url: "https://www.energy.gov/ne/",
    active: true,
  },
  {
    id: "src-3",
    source: "Federal Register - Nuclear",
    platform: "Government",
    category: ["Regulatory"],
    signalQuality: "Tier 1 - Primary",
    lastChecked: "2026-03-25",
    notes: "Proposed rules, final rules, notices for NRC and DOE",
    url: "https://www.federalregister.gov/",
    active: true,
  },
  {
    id: "src-4",
    source: "@Deepnucleus",
    platform: "X/Twitter",
    category: ["Nuclear Companies", "Analyst"],
    signalQuality: "Tier 1 - Primary",
    lastChecked: "2026-03-25",
    notes: "Top nuclear energy analyst account. Breaks news, provides context.",
    url: "https://x.com/Deepnucleus",
    active: true,
  },
  {
    id: "src-5",
    source: "SEC EDGAR - Nuclear Filings",
    platform: "Government",
    category: ["Nuclear Companies", "VC/Funding"],
    signalQuality: "Tier 1 - Primary",
    lastChecked: "2026-03-23",
    notes:
      "10-K, 10-Q, 8-K filings for public nuclear companies (SMR, OKLO, CEG, etc.)",
    url: "https://www.sec.gov/cgi-bin/browse-edgar",
    active: true,
  },
  {
    id: "src-6",
    source: "World Nuclear News",
    platform: "News",
    category: ["International", "Nuclear Companies", "Regulatory"],
    signalQuality: "Tier 2 - Valuable",
    lastChecked: "2026-03-25",
    notes: "Comprehensive global nuclear industry coverage",
    url: "https://world-nuclear-news.org/",
    active: true,
  },
  {
    id: "src-7",
    source: "@KairosPower",
    platform: "X/Twitter",
    category: ["Nuclear Companies", "MSR R&D"],
    signalQuality: "Tier 2 - Valuable",
    lastChecked: "2026-03-24",
    notes:
      "Key competitor using molten salt technology. Track for technical developments.",
    url: "https://x.com/KairosPower",
    active: true,
  },
  {
    id: "src-8",
    source: "Congress.gov - Energy Bills",
    platform: "Government",
    category: ["Regulatory"],
    signalQuality: "Tier 2 - Valuable",
    lastChecked: "2026-03-20",
    notes: "Track ADVANCE Act, nuclear PTC, and other energy legislation",
    url: "https://www.congress.gov/",
    active: true,
  },
  {
    id: "src-9",
    source: "Nuclear Newswire (ANS)",
    platform: "News",
    category: ["Nuclear Companies", "Regulatory", "Fuel Cycle"],
    signalQuality: "Tier 2 - Valuable",
    lastChecked: "2026-03-22",
    notes:
      "American Nuclear Society's daily news digest. Good technical coverage.",
    url: "https://www.ans.org/news/",
    active: true,
  },
  {
    id: "src-10",
    source: "Numerco Uranium Prices",
    platform: "Other",
    category: ["Fuel Cycle"],
    signalQuality: "Tier 3 - Background",
    lastChecked: "2026-03-19",
    notes:
      "Weekly uranium spot and term price data. Background market indicator.",
    url: "https://numerco.com/",
    active: true,
  },
];
