import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const site = searchParams.get("site");
    const success = searchParams.get("success");
    const dryRun = searchParams.get("dryRun");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (site) where.site = site;
    if (success !== null) where.success = success === "true";
    if (dryRun !== null) where.dryRun = dryRun === "true";
    if (from || to) {
      where.executedAt = {};
      if (from) (where.executedAt as Record<string, Date>).gte = new Date(from);
      if (to) (where.executedAt as Record<string, Date>).lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      prisma.updateLog.findMany({
        where,
        orderBy: { executedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.updateLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, limit });
  } catch {
    return NextResponse.json({ error: "ログの取得に失敗しました" }, { status: 500 });
  }
}
