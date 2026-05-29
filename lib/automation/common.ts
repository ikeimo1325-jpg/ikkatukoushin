import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { loadSession, sessionExists } from "./session";
import type { SiteName } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function createBrowserWithSession(
  site: SiteName,
  headless = true
): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  const browser = await chromium.launch({ headless });
  const context = sessionExists(site)
    ? await browser.newContext({ storageState: loadSession(site) as never, userAgent: USER_AGENT })
    : await browser.newContext({ userAgent: USER_AGENT });
  const page = await context.newPage();
  return { browser, context, page };
}

export async function createLoginBrowser(
  loginUrl: string
): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(loginUrl);
  return { browser, context, page };
}

export async function takeScreenshot(page: Page, screenshotPath: string): Promise<void> {
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch {
    // スクリーンショット保存失敗は無視して処理継続
  }
}
