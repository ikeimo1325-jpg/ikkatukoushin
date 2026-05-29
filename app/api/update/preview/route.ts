import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionExists } from "@/lib/automation/session";
import { SITE_LABELS, type SiteName } from "@/lib/automation/types";
import { z } from "zod";

const previewSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  castIds: z.array(z.string()).optional(),
  sites: z.array(z.enum(["pokepara", "chocolat", "nightstyle", "caba2"])).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, castIds, sites } = previewSchema.parse(body);

    const where: Record<string, unknown> = { date };
    if (castIds?.length) where.castId = { in: castIds };

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: { cast: true },
    });

    const targetSites: SiteName[] = sites ?? ["pokepara", "chocolat", "nightstyle", "caba2"];
    const sessionStatuses = Object.fromEntries(targetSites.map((s) => [s, sessionExists(s)]));
    const previewItems = [];

    for (const record of records) {
      const cast = record.cast;
      const siteTargets: Record<string, {
        willUpdate: boolean;
        reason?: string;
        sessionOk: boolean;
        siteUrl: string | null;
      }> = {};

      for (const siteName of targetSites) {
        const castEnabled = cast[`${siteName}Enabled` as keyof typeof cast] as boolean;
        const recordEnabled = record[`update${siteName.charAt(0).toUpperCase() + siteName.slice(1)}` as keyof typeof record] as boolean;
        const siteUrl = cast[`${siteName}Url` as keyof typeof cast] as string | null;
        const sessionOk = sessionStatuses[siteName];

        let willUpdate = false;
        let reason: string | undefined;

        if (!castEnabled) {
          reason = `${SITE_LABELS[siteName]}の更新がOFFです`;
        } else if (!recordEnabled) {
          reason = `この出勤情報での${SITE_LABELS[siteName]}更新がOFFです`;
        } else if (!siteUrl) {
          reason = `${SITE_LABELS[siteName]}のキャストURLが未設定です`;
        } else if (!sessionOk) {
          reason = `${SITE_LABELS[siteName]}のセッションが保存されていません`;
        } else {
          willUpdate = true;
        }

        siteTargets[siteName] = { willUpdate, reason, sessionOk, siteUrl };
      }

      previewItems.push({ record, cast, siteTargets });
    }

    return NextResponse.json({ date, previewItems, sessionStatuses });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "入力データが正しくありません" }, { status: 400 });
    }
    return NextResponse.json({ error: "プレビューの生成に失敗しました" }, { status: 500 });
  }
}
