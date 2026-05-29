import type { PortalUpdater, AttendanceUpdatePayload, UpdateResult } from "./types";
import { saveUpdateLog } from "./logger";

const SITE_NAME = "chocolat" as const;

// TODO: ショコラのログインURLを設定
// const LOGIN_URL = "https://...";

export class ChocolatUpdater implements PortalUpdater {
  siteName = SITE_NAME;

  async updateAttendance(payload: AttendanceUpdatePayload): Promise<UpdateResult> {
    const { castId, castName, date, status, startTime, endTime, comment, dryRun } = payload;

    if (dryRun) {
      await saveUpdateLog({
        site: SITE_NAME, castId, castName, targetDate: date,
        status, startTime, endTime, comment, success: true, dryRun: true,
      });
      return {
        site: SITE_NAME, castId, castName, success: true, dryRun: true,
        message: `[DryRun] ショコラ: ${castName} ${date} ${status} の更新をシミュレートしました`,
      };
    }

    // TODO: ショコラの自動操作を実装する
    return {
      site: SITE_NAME, castId, castName, success: false,
      message: "ショコラの自動操作は未実装です",
    };
  }
}
