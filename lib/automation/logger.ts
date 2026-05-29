import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";
import type { SiteName, AttendanceStatus } from "./types";

const SCREENSHOTS_DIR = path.join(process.cwd(), "logs", "screenshots");

export function ensureLogDirs(): void {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

export function getScreenshotPath(site: SiteName, castId: string, date: string): string {
  ensureLogDirs();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(SCREENSHOTS_DIR, `${site}_${castId}_${date}_${timestamp}.png`);
}

export async function saveUpdateLog(params: {
  site: SiteName;
  castId: string;
  castName: string;
  targetDate: string;
  status: AttendanceStatus;
  startTime?: string;
  endTime?: string;
  comment?: string;
  success: boolean;
  errorMessage?: string;
  screenshotPath?: string;
  dryRun: boolean;
}): Promise<void> {
  await prisma.updateLog.create({ data: params });
}
