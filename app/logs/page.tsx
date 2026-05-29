import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE_LABELS, type SiteName, STATUS_LABELS } from "@/lib/automation/types";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const logs = await prisma.updateLog.findMany({
    orderBy: { executedAt: "desc" },
    take: 100,
  });

  const successCount = logs.filter((l) => l.success).length;
  const failCount = logs.filter((l) => !l.success).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">更新ログ</h2>
        <p className="text-gray-500 text-sm mt-1">
          直近100件 / 成功: {successCount}件 / 失敗: {failCount}件
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            更新ログがありません
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className={log.success ? "" : "border-red-200"}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.castName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {SITE_LABELS[log.site as SiteName] ?? log.site}
                      </Badge>
                      {log.dryRun && (
                        <Badge variant="secondary" className="text-xs">DryRun</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                      <span>対象日: {log.targetDate}</span>
                      <span>
                        ステータス: {STATUS_LABELS[log.status as keyof typeof STATUS_LABELS] ?? log.status}
                        {log.status === "working" && log.startTime && ` ${log.startTime}`}
                        {log.status === "working" && log.endTime && `〜${log.endTime}`}
                      </span>
                      {log.comment && <span>コメント: {log.comment}</span>}
                    </div>
                    {!log.success && log.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">{log.errorMessage}</p>
                    )}
                    {log.screenshotPath && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        スクリーンショット: {log.screenshotPath}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {log.success ? (
                      <Badge variant="success">成功</Badge>
                    ) : (
                      <Badge variant="destructive">失敗</Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(log.executedAt).toLocaleString("ja-JP", {
                        month: "numeric", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
