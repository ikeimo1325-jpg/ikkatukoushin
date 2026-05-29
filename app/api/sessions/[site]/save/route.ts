import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/automation/session";
import type { SiteName } from "@/lib/automation/types";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ site: string }> }) {
  try {
    const { site } = await params;
    deleteSession(site as SiteName);
    return NextResponse.json({ success: true, message: "セッションを削除しました" });
  } catch {
    return NextResponse.json({ error: "セッションの削除に失敗しました" }, { status: 500 });
  }
}
