import Link from "next/link";
import { prisma } from "@/lib/db";
import { sessionExists } from "@/lib/automation/session";
import { SITE_NAMES, SITE_LABELS } from "@/lib/automation/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getToday } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [castCount, todayRecords, recentLogs] = await Promise.all([
    prisma.cast.count({ where: { active: true } }),
    prisma.attendanceRecord.findMany({
      where: { date: getToday() },
      include: { cast: true },
    }),
    prisma.updateLog.findMany({
      orderBy: { executedAt: "desc" },
      take: 5,
    }),
  ]);
  const sessionStatuses = Object.fromEntries(SITE_NAMES.map((s) => [s, sessionExists(s)]));
  return { castCount, todayRecords, recentLogs, sessionStatuses };
}

export default async function DashboardPage() {
  const { castCount, todayRecords, recentLogs, sessionStatuses } = await getDashboardData();
  const today = getToday();
  const workingToday = todayRecords.filter((r) => r.status === "working").length;
  const offToday = todayRecords.filter((r) => r.status === "off").length;
  const connectedSites = SITE_NAMES.filter((s) => sessionStatuses[s]).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <p className="text-gray-500 text-sm mt-1">今日: {today}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500 mb-1">在籍キャスト数</p>
            <p className="text-2xl font-bold text-gray-900">{castCount}名</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500 mb-1">今日の出勤</p>
            <p className="text-2xl font-bold text-green-600">{workingToday}名</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500 mb-1">今日の休み</p>
            <p className="text-2xl font-bold text-red-500">{offToday}名</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500 mb-1">連携サイト数</p>
            <p className="text-2xl font-bold text-blue-600">{connectedSites}/4</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader><CardTitle>クイックアクション</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href={`/attendance?date=${today}`}>
              <Button className="w-full" size="lg">📅 今日の出勤を入力</Button>
            </Link>
            <Link href="/attendance/preview">
              <Button variant="outline" className="w-full" size="lg">👁 更新プレビューを確認</Button>
            </Link>
            <Link href="/casts/new">
              <Button variant="secondary" className="w-full" size="lg">➕ キャストを登録</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>サイト接続状況</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SITE_NAMES.map((site) => (
                <div key={site} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{SITE_LABELS[site]}</span>
                  {sessionStatuses[site] ? (
                    <Badge variant="success">✓ 接続済み</Badge>
                  ) : (
                    <Badge variant="warning">未ログイン</Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/sessions">
                <Button variant="outline" size="sm" className="w-full">セッション管理へ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {todayRecords.length > 0 && (
        <Card className="mb-4">
          <CardHeader><CardTitle>今日の出勤情報</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-sm">{record.cast.displayName}</span>
                  <div className="flex items-center gap-2">
                    {record.status === "working" && (
                      <Badge variant="working">出勤 {record.startTime}{record.endTime ? `〜${record.endTime}` : ""}</Badge>
                    )}
                    {record.status === "off" && <Badge variant="off">休み</Badge>}
                    {record.status === "unknown" && <Badge variant="unknown">未定</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recentLogs.length > 0 && (
        <Card>
          <CardHeader><CardTitle>最近の更新ログ</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                  <div>
                    <span className="font-medium">{log.castName}</span>
                    <span className="text-gray-500 ml-2">{SITE_LABELS[log.site as keyof typeof SITE_LABELS] ?? log.site}</span>
                    {log.dryRun && <Badge variant="secondary" className="ml-1 text-xs">DryRun</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">
                      {new Date(log.executedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {log.success ? <Badge variant="success">成功</Badge> : <Badge variant="destructive">失敗</Badge>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Link href="/logs">
                <Button variant="ghost" size="sm" className="w-full text-gray-500">すべてのログを見る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
