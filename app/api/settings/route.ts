import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SITE_NAMES } from "@/lib/automation/types";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany();
    const result: Record<string, boolean> = {};
    for (const site of SITE_NAMES) {
      const found = settings.find((s) => s.site === site);
      result[site] = found?.enabled ?? true;
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "設定の取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    for (const [site, enabled] of Object.entries(body)) {
      await prisma.siteSettings.upsert({
        where: { site },
        create: { site, enabled: Boolean(enabled) },
        update: { enabled: Boolean(enabled) },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "設定の保存に失敗しました" }, { status: 500 });
  }
}
