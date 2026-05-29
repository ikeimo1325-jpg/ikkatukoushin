import path from "path";
import fs from "fs";
import type { SiteName } from "./types";

const SESSIONS_DIR = path.join(process.cwd(), "sessions");

export function getSessionPath(site: SiteName): string {
  return path.join(SESSIONS_DIR, `${site}.json`);
}

export function sessionExists(site: SiteName): boolean {
  return fs.existsSync(getSessionPath(site));
}

export function loadSession(site: SiteName): object | null {
  const sessionPath = getSessionPath(site);
  if (!fs.existsSync(sessionPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(sessionPath, "utf-8"));
  } catch {
    return null;
  }
}

export function saveSession(site: SiteName, storageState: object): void {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
  fs.writeFileSync(getSessionPath(site), JSON.stringify(storageState, null, 2), "utf-8");
}

export function deleteSession(site: SiteName): void {
  const sessionPath = getSessionPath(site);
  if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
}

export function getSessionAge(site: SiteName): number | null {
  const sessionPath = getSessionPath(site);
  if (!fs.existsSync(sessionPath)) return null;
  return Date.now() - fs.statSync(sessionPath).mtimeMs;
}
