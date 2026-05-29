import type { PortalUpdater, AttendanceUpdatePayload, UpdateResult } from "./types";
import { createBrowserWithSession, takeScreenshot } from "./common";
import { saveSession, getSessionPath } from "./session";
import { getScreenshotPath, saveUpdateLog } from "./logger";
import { chromium } from "playwright";

const SITE_NAME = "pokepara" as const;
const LOGIN_URL = "https://www.pokepara.jp/shopc_manage/login.html";

export class PokeparaUpdater implements PortalUpdater {
  siteName = SITE_NAME;

  async updateAttendance(payload: AttendanceUpdatePayload): Promise<UpdateResult> {
    const { castId, castName, siteUrl, date, status, startTime, endTime, comment, dryRun } = payload;

    if (dryRun) {
      await saveUpdateLog({
        site: SITE_NAME, castId, castName, targetDate: date,
        status, startTime, endTime, comment, success: true, dryRun: true,
      });
      return {
        site: SITE_NAME, castId, castName, success: true, dryRun: true,
        message: `[DryRun] ポケパラ: ${castName} ${date} ${status} の更新をシミュレートしました`,
      };
    }

    if (!siteUrl) {
      return {
        site: SITE_NAME, castId, castName, success: false,
        message: "ポケパラのキャスト管理URLが設定されていません",
      };
    }

    const { browser, page } = await createBrowserWithSession(SITE_NAME, true);
    const screenshotPath = getScreenshotPath(SITE_NAME, castId, date);

    try {
      await page.goto(siteUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

      if (page.url().includes("login")) {
        await takeScreenshot(page, screenshotPath);
        await browser.close();
        return {
          site: SITE_NAME, castId, castName, success: false, screenshotPath,
          message: "セッションが切れています。セッション管理ページから再ログインしてください。",
        };
      }

      // TODO: 実際のポケパラ管理画面のHTMLを確認してセレクタを実装してください
      // 以下はセレクタの仮実装です。実際のHTML構造に合わせて修正が必要です。

      // 日付入力
      // await page.fill('input[name="date"]', date);

      // ステータス選択
      // const statusMap = { working: "1", off: "2", unknown: "3" };
      // await page.selectOption('select[name="status"]', statusMap[status]);

      // 開始時間
      // if (startTime) await page.fill('input[name="startTime"]', startTime);

      // 退勤時間
      // if (endTime) await page.fill('input[name="endTime"]', endTime);

      // コメント
      // if (comment) await page.fill('textarea[name="comment"]', comment);

      // 保存ボタン
      // await page.click('button[type="submit"]');
      // await page.waitForLoadState("networkidle");

      throw new Error(
        "ポケパラの自動操作はまだ実装中です。実際のHTML構造を確認してセレクタを設定してください。"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      try { await takeScreenshot(page, screenshotPath); } catch {}
      try { await browser.close(); } catch {}
      await saveUpdateLog({
        site: SITE_NAME, castId, castName, targetDate: date,
        status, startTime, endTime, comment, success: false, errorMessage, screenshotPath, dryRun: false,
      });
      return { site: SITE_NAME, castId, castName, success: false, message: errorMessage, screenshotPath };
    }
  }
}

export async function startLoginSession(): Promise<boolean> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(LOGIN_URL);
  try {
    await page.waitForURL((url) => !url.href.includes("login"), { timeout: 180000 });
    saveSession(SITE_NAME, await context.storageState());
    await browser.close();
    return true;
  } catch {
    await browser.close();
    return false;
  }
}
