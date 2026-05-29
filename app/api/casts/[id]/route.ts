import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const castUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  active: z.boolean().optional(),
  memo: z.string().optional().nullable(),
  pokeparaUrl: z.string().optional().nullable(),
  chocolatUrl: z.string().optional().nullable(),
  nightstyleUrl: z.string().optional().nullable(),
  caba2Url: z.string().optional().nullable(),
  pokeparaEnabled: z.boolean().optional(),
  chocolatEnabled: z.boolean().optional(),
  nightstyleEnabled: z.boolean().optional(),
  caba2Enabled: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cast = await prisma.cast.findUnique({ where: { id } });
    if (!cast) return NextResponse.json({ error: "キャストが見つかりません" }, { status: 404 });
    return NextResponse.json(cast);
  } catch {
    return NextResponse.json({ error: "キャストの取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = castUpdateSchema.parse(body);
    const cast = await prisma.cast.update({ where: { id }, data });
    return NextResponse.json(cast);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "入力データが正しくありません", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "キャストの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.cast.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "キャストの削除に失敗しました" }, { status: 500 });
  }
}
