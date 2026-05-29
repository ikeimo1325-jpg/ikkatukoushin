export type SiteName = "pokepara" | "chocolat" | "nightstyle" | "caba2";

export const SITE_LABELS: Record<SiteName, string> = {
  pokepara: "ポケパラ",
  chocolat: "ショコラ",
  nightstyle: "ナイトスタイル",
  caba2: "キャバキャバ",
};

export const SITE_NAMES: SiteName[] = ["pokepara", "chocolat", "nightstyle", "caba2"];

export type AttendanceStatus = "working" | "off" | "unknown";

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  working: "出勤",
  off: "休み",
  unknown: "未定",
};

export type AttendanceUpdatePayload = {
  castId: string;
  castName: string;
  castDisplayName: string;
  siteUrl: string;
  date: string;
  status: AttendanceStatus;
  startTime?: string;
  endTime?: string;
  comment?: string;
  dryRun?: boolean;
};

export type UpdateResult = {
  site: SiteName;
  castId: string;
  castName: string;
  success: boolean;
  message: string;
  screenshotPath?: string;
  dryRun?: boolean;
};

export interface PortalUpdater {
  siteName: SiteName;
  updateAttendance(payload: AttendanceUpdatePayload): Promise<UpdateResult>;
}

export type SessionStatus = "active" | "none" | "expired";
