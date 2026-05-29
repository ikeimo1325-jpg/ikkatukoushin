import { NextRequest, NextResponse } from "next/server";
import { sessionExists, getSessionAge } from "@/lib/automation/session";
import type { SiteName } from "@/lib/automation/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ site: string }> }) {
  try {
    const { site } = await params;
    const exists = sessionExists(site as SiteName);
    const ageMs = getSessionAge(site as SiteName);

    return NextResponse.json({
      site,
      exists,
      ageMs,
      ageDays: ageMs ? Math.floor(ageMs / (1000 * 60 * 60 * 24)) : null,
    });
  } catch {
    return NextResponse.json({ error: "セッション状態の取得に失敗しました" }, { status: 500 });
  }
}
