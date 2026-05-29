import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { saveSession } from "@/lib/automation/session";
import type { SiteName } from "@/lib/automation/types";

const LOGIN_URLS: Record<SiteName, string> = {
  pokepara: "https://www.pokepara.jp/shopc_manage/login.html",
  chocolat: "https://chocolat.jp/shop/login",       // TODO: 実際のURLを確認
  nightstyle: "https://nightstyle.jp/manage/login", // TODO: 実際のURLを確認
  caba2: "https://caba2.jp/shop/login",             // TODO: 実際のURLを確認
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ site: string }> }) {
  try {
    const { site } = await params;
    const siteName = site as SiteName;
    const loginUrl = LOGIN_URLS[siteName];

    if (!loginUrl) {
      return NextResponse.json({ error: "不明なサイト名です" }, { status: 400 });
    }

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(loginUrl);

    try {
      await page.waitForURL((url) => !url.href.includes("login"), { timeout: 180000 });
    } catch {
      await browser.close();
      return NextResponse.json(
        { error: "ログインのタイムアウトが発生しました。再度お試しください。" },
        { status: 408 }
      );
    }

    saveSession(siteName, await context.storageState());
    await browser.close();

    return NextResponse.json({ success: true, message: "セッションを保存しました" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `ログイン処理中にエラーが発生しました: ${errorMessage}` },
      { status: 500 }
    );
  }
}
