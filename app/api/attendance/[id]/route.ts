import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const attendanceUpdateSchema = z.object({
  status: z.enum(["working", "off", "unknown"]).optional(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
  updatePokepara: z.boolean().optional(),
  updateChocolat: z.boolean().optional(),
  updateNightstyle: z.boolean().optional(),
  updateCaba2: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = attendanceUpdateSchema.parse(body);
    const record = await prisma.attendanceRecord.update({ where: { id }, data, include: { cast: true } });
    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "入力データが正しくありません" }, { status: 400 });
    }
    return NextResponse.json({ error: "出勤情報の更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.attendanceRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "出勤情報の削除に失敗しました" }, { status: 500 });
  }
}
