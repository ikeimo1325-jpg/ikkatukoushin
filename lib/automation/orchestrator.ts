import { PokeparaUpdater } from "./pokepara";
import { ChocolatUpdater } from "./chocolat";
import { NightstyleUpdater } from "./nightstyle";
import { Caba2Updater } from "./caba2";
import { saveUpdateLog } from "./logger";
import { sessionExists } from "./session";
import type { SiteName, AttendanceUpdatePayload, UpdateResult, PortalUpdater } from "./types";

const updaters: Record<SiteName, PortalUpdater> = {
  pokepara: new PokeparaUpdater(),
  chocolat: new ChocolatUpdater(),
  nightstyle: new NightstyleUpdater(),
  caba2: new Caba2Updater(),
};

export type ExecuteUpdateParams = {
  castId: string;
  castName: string;
  castDisplayName: string;
  date: string;
  status: "working" | "off" | "unknown";
  startTime?: string;
  endTime?: string;
  comment?: string;
  sites: {
    pokepara?: { enabled: boolean; siteUrl: string };
    chocolat?: { enabled: boolean; siteUrl: string };
    nightstyle?: { enabled: boolean; siteUrl: string };
    caba2?: { enabled: boolean; siteUrl: string };
  };
  dryRun: boolean;
};

export async function executeUpdate(params: ExecuteUpdateParams): Promise<UpdateResult[]> {
  const results: UpdateResult[] = [];
  const siteNames: SiteName[] = ["pokepara", "chocolat", "nightstyle", "caba2"];

  for (const siteName of siteNames) {
    const siteConfig = params.sites[siteName];
    if (!siteConfig?.enabled) continue;

    if (!params.dryRun && !sessionExists(siteName)) {
      const result: UpdateResult = {
        site: siteName, castId: params.castId, castName: params.castName,
        success: false,
        message: `セッションが保存されていません。セッション管理ページからログインしてください。`,
      };
      results.push(result);
      await saveUpdateLog({
        site: siteName, castId: params.castId, castName: params.castName,
        targetDate: params.date, status: params.status, startTime: params.startTime,
        endTime: params.endTime, comment: params.comment,
        success: false, errorMessage: result.message, dryRun: false,
      });
      continue;
    }

    const payload: AttendanceUpdatePayload = {
      castId: params.castId, castName: params.castName, castDisplayName: params.castDisplayName,
      siteUrl: siteConfig.siteUrl, date: params.date, status: params.status,
      startTime: params.startTime, endTime: params.endTime, comment: params.comment,
      dryRun: params.dryRun,
    };

    try {
      const result = await updaters[siteName].updateAttendance(payload);
      results.push(result);
      if (!params.dryRun) {
        await saveUpdateLog({
          site: siteName, castId: params.castId, castName: params.castName,
          targetDate: params.date, status: params.status, startTime: params.startTime,
          endTime: params.endTime, comment: params.comment,
          success: result.success, errorMessage: result.success ? undefined : result.message,
          screenshotPath: result.screenshotPath, dryRun: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const result: UpdateResult = {
        site: siteName, castId: params.castId, castName: params.castName,
        success: false, message: `予期しないエラーが発生しました: ${errorMessage}`,
      };
      results.push(result);
      await saveUpdateLog({
        site: siteName, castId: params.castId, castName: params.castName,
        targetDate: params.date, status: params.status,
        success: false, errorMessage: errorMessage, dryRun: params.dryRun,
      });
    }
  }

  return results;
}
