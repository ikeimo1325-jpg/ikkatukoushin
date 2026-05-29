import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const attendanceSchema = z.object({
  castId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["working", "off", "unknown"]).default("unknown"),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
  updatePokepara: z.boolean().optional().default(true),
  updateChocolat: z.boolean().optional().default(true),
  updateNightstyle: z.boolean().optional().default(true),
  updateCaba2: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const castId = searchParams.get("castId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (castId) where.castId = castId;
    if (date) where.date = date;
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, string>).gte = from;
      if (to) (where.date as Record<string, string>).lte = to;
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: { cast: true },
      orderBy: [{ date: "asc" }, { castId: "asc" }],
    });
    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "出勤情報の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const data = attendanceSchema.parse(item);
        const record = await prisma.attendanceRecord.upsert({
          where: { castId_date: { castId: data.castId, date: data.date } },
          create: data,
          update: data,
          include: { cast: true },
        });
        results.push(record);
      }
      return NextResponse.json(results, { status: 201 });
    }

    const data = attendanceSchema.parse(body);
    const record = await prisma.attendanceRecord.upsert({
      where: { castId_date: { castId: data.castId, date: data.date } },
      create: data,
      update: data,
      include: { cast: true },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "入力データが正しくありません", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "出勤情報の保存に失敗しました" }, { status: 500 });
  }
}
