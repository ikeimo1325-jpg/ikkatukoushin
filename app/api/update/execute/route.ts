import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeUpdate } from "@/lib/automation/orchestrator";
import { z } from "zod";

const executeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  castIds: z.array(z.string()).optional(),
  sites: z.array(z.enum(["pokepara", "chocolat", "nightstyle", "caba2"])).optional(),
  dryRun: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, castIds, sites, dryRun } = executeSchema.parse(body);

    const where: Record<string, unknown> = { date };
    if (castIds?.length) where.castId = { in: castIds };

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: { cast: true },
    });

    if (records.length === 0) {
      return NextResponse.json({ error: "更新対象の出勤情報が見つかりません" }, { status: 404 });
    }

    const targetSites = sites ?? ["pokepara", "chocolat", "nightstyle", "caba2"];
    const allResults = [];

    for (const record of records) {
      const cast = record.cast;
      const siteConfig: Record<string, { enabled: boolean; siteUrl: string }> = {};

      for (const siteName of targetSites) {
        const castEnabled = cast[`${siteName}Enabled` as keyof typeof cast] as boolean;
        const recordEnabled = record[`update${siteName.charAt(0).toUpperCase() + siteName.slice(1)}` as keyof typeof record] as boolean;
        const siteUrl = cast[`${siteName}Url` as keyof typeof cast] as string | null;

        siteConfig[siteName] = {
          enabled: castEnabled && recordEnabled,
          siteUrl: siteUrl ?? "",
        };
      }

      const results = await executeUpdate({
        castId: cast.id,
        castName: cast.name,
        castDisplayName: cast.displayName,
        date,
        status: record.status as "working" | "off" | "unknown",
        startTime: record.startTime ?? undefined,
        endTime: record.endTime ?? undefined,
        comment: record.comment ?? undefined,
        sites: siteConfig as Parameters<typeof executeUpdate>[0]["sites"],
        dryRun,
      });

      allResults.push(...results);
    }

    return NextResponse.json({
      success: true,
      dryRun,
      results: allResults,
      summary: {
        total: allResults.length,
        succeeded: allResults.filter((r) => r.success).length,
        failed: allResults.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "入力データが正しくありません" }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "予期しないエラーが発生しました";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
