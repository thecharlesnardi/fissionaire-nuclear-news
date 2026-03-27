/* ============================================================
   API Route — /api/signals
   Queries Notion for signals from the last 7 days.
   Returns JSON. Enables live refresh from the client.
   ============================================================ */

import { NextResponse } from "next/server";
import { getRecentSignals } from "@/lib/notion";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  try {
    const signals = await getRecentSignals(days);
    return NextResponse.json({ signals, count: signals.length });
  } catch (error) {
    console.error("API /signals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 },
    );
  }
}
