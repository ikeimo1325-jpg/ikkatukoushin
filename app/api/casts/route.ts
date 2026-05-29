import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const castSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  active: z.boolean().optional().default(true),
  memo: z.string().optional(),
  pokeparaUrl: z.string().optional(),
  chocolatUrl: z.string().optional(),
  nightstyleUrl: z.string().optional(),
  caba2Url: z.string().optional(),
  pokeparaEnabled: z.boolean().optional().default(true),
  chocolatEnabled: z.boolean().optional().default(true),
  nightstyleEnabled: z.boolean().optional().default(true),
  caba2Enabled: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const casts = await prisma.cast.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(casts);
  } catch {
    return NextResponse.json({ error: "キャスト一覧の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = castSchema.parse(body);
    const cast = await prisma.cast.create({ data });
    return NextResponse.json(cast, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "入力データが正しくありません", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "キャストの登録に失敗しました" }, { status: 500 });
  }
}
