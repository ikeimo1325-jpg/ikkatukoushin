"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { SITE_LABELS, SITE_NAMES, type SiteName } from "@/lib/automation/types";
import { getToday, formatDate, getDayOfWeek } from "@/lib/utils";

type SiteTarget = {
  willUpdate: boolean;
  reason?: string;
  sessionOk: boolean;
  siteUrl: string | null;
};

type PreviewItem = {
  record: {
    id: string;
    castId: string;
    date: string;
    status: string;
    startTime: string | null;
    endTime: string | null;
    comment: string | null;
  };
  cast: { id: string; name: string; displayName: string };
  siteTargets: Record<string, SiteTarget>;
};

type PreviewResult = {
  date: string;
  previewItems: PreviewItem[];
  sessionStatuses: Record<string, boolean>;
};

type UpdateResult = {
  site: string;
  castId: string;
  castName: string;
  success: boolean;
  message: string;
  screenshotPath?: string;
  dryRun?: boolean;
};

const STATUS_LABELS: Record<string, { label: string; badge: "working" | "off" | "unknown" }> = {
  working: { label: "出勤", badge: "working" },
  off: { label: "休み", badge: "off" },
  unknown: { label: "未定", badge: "unknown" },
};

export function PreviewPanel() {
  const searchParams = useSearchParams();
  const [date, setDate] = useState(searchParams.get("date") ?? getToday());
  const [selectedSites, setSelectedSites] = useState<Record<SiteName, boolean>>(
    Object.fromEntries(SITE_NAMES.map((s) => [s, true])) as Record<SiteName, boolean>
  );
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [results, setResults] = useState<UpdateResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const sites = SITE_NAMES.filter((s) => selectedSites[s]);
      const res = await fetch("/api/update/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, sites }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "プレビューの取得に失敗しました");
      }
      setPreview(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [date, selectedSites]);

  const executeUpdate = async () => {
    if (!preview) return;
    setExecuting(true);
    setError(null);
    try {
      const sites = SITE_NAMES.filter((s) => selectedSites[s]);
      const res = await fetch("/api/update/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, sites, dryRun }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "更新に失敗しました");
      setResults(data.results);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setExecuting(false);
    }
  };

  const willUpdateCount = preview?.previewItems.reduce(
    (acc, item) => acc + Object.values(item.siteTargets).filter((t) => t.willUpdate).length,
    0
  ) ?? 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">更新プレビュー</h2>
        <p className="text-gray-500 text-sm mt-1">更新内容を確認してから実行してください</p>
      </div>

      <Card className="mb-4">
        <CardContent className="py-4 space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label htmlFor="preview-date">対象日</Label>
              <Input id="preview-date" type="date" value={date}
                onChange={(e) => { setDate(e.target.value); setPreview(null); }} className="w-44" />
            </div>
            <Button onClick={loadPreview} disabled={loading} size="lg">
              {loading ? "取得中..." : "プレビューを表示"}
            </Button>
          </div>
          <div>
            <Label className="mb-2 block">対象サイト</Label>
            <div className="flex flex-wrap gap-3">
              {SITE_NAMES.map((site) => (
                <div key={site} className="flex items-center gap-2">
                  <Toggle checked={selectedSites[site]}
                    onChange={(v) => { setSelectedSites((prev) => ({ ...prev, [site]: v })); setPreview(null); }} />
                  <span className="text-sm text-gray-700">{SITE_LABELS[site]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

      {results && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>更新結果 {dryRun && <Badge variant="secondary" className="ml-2">DryRun</Badge>}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{result.castName}</span>
                      <span className="text-gray-500 text-sm">{SITE_LABELS[result.site as SiteName] ?? result.site}</span>
                    </div>
                    {!result.success && <p className="text-red-600 text-xs mt-1">{result.message}</p>}
                  </div>
                  {result.success ? <Badge variant="success">成功</Badge> : <Badge variant="destructive">失敗</Badge>}
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-500">
              成功: {results.filter((r) => r.success).length} / 失敗: {results.filter((r) => !r.success).length}
            </div>
          </CardContent>
        </Card>
      )}

      {preview && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {formatDate(preview.date)}（{getDayOfWeek(preview.date)}）の更新対象:
              <span className="font-bold text-blue-600 ml-1">{willUpdateCount}件</span>
            </p>
          </div>

          {preview.previewItems.length === 0 ? (
            <Alert><AlertDescription>この日の出勤情報が登録されていません。先に出勤表入力で登録してください。</AlertDescription></Alert>
          ) : (
            <div className="space-y-3 mb-6">
              {preview.previewItems.map((item) => (
                <Card key={item.record.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="font-semibold text-gray-900">{item.cast.displayName}</span>
                        <span className="text-gray-400 text-xs ml-2">({item.cast.name})</span>
                      </div>
                      <Badge variant={STATUS_LABELS[item.record.status]?.badge ?? "unknown"}>
                        {STATUS_LABELS[item.record.status]?.label ?? item.record.status}
                        {item.record.status === "working" && item.record.startTime && ` ${item.record.startTime}`}
                        {item.record.status === "working" && item.record.endTime && `〜${item.record.endTime}`}
                      </Badge>
                    </div>
                    {item.record.comment && (
                      <p className="text-sm text-gray-600 mb-3">💬 {item.record.comment}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {SITE_NAMES.filter((s) => selectedSites[s]).map((site) => {
                        const target = item.siteTargets[site];
                        if (!target) return null;
                        return (
                          <div key={site} className={`rounded-lg p-2 text-center text-xs ${
                            target.willUpdate ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"
                          }`}>
                            <div className="font-medium mb-1">{SITE_LABELS[site]}</div>
                            {target.willUpdate ? (
                              <span className="text-green-600">✓ 更新予定</span>
                            ) : (
                              <span className="text-gray-400">{target.reason}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="sticky bottom-20 md:bottom-4 bg-white/95 backdrop-blur py-3 border-t border-gray-200 -mx-4 px-4 md:mx-0 md:px-0 md:border-0 md:bg-transparent md:static">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Toggle checked={dryRun} onChange={setDryRun} />
                    <span className="text-sm font-medium">DryRunモード（実際には更新しない）</span>
                  </div>
                </div>
                {dryRun ? (
                  <Alert className="mb-3">
                    <AlertTitle>DryRunモード</AlertTitle>
                    <AlertDescription>実際には各サイトへの更新を行いません。更新予定内容の確認のみ行います。</AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="warning" className="mb-3">
                    <AlertTitle>本番更新モード</AlertTitle>
                    <AlertDescription>
                      OFFにすると実際に各サイトへ更新が実行されます。更新内容をよく確認してから実行してください。
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={executeUpdate}
                  disabled={executing || willUpdateCount === 0}
                  size="xl"
                  variant={dryRun ? "secondary" : "default"}
                  className="w-full"
                >
                  {executing ? "実行中..." : dryRun ? `DryRunを実行 (${willUpdateCount}件)` : `🚀 更新を実行 (${willUpdateCount}件)`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
