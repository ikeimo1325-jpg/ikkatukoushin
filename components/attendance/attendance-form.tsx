"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_LABELS, SITE_NAMES, type SiteName } from "@/lib/automation/types";
import { getToday, addDays, formatDate, getDayOfWeek } from "@/lib/utils";

type AttendanceStatus = "working" | "off" | "unknown";

type CastRecord = {
  castId: string;
  castName: string;
  castDisplayName: string;
  status: AttendanceStatus;
  startTime: string;
  endTime: string;
  comment: string;
  updatePokepara: boolean;
  updateChocolat: boolean;
  updateNightstyle: boolean;
  updateCaba2: boolean;
  recordId?: string;
};

type Cast = {
  id: string;
  name: string;
  displayName: string;
  active: boolean;
  pokeparaEnabled: boolean;
  chocolatEnabled: boolean;
  nightstyleEnabled: boolean;
  caba2Enabled: boolean;
  pokeparaUrl: string | null;
  chocolatUrl: string | null;
  nightstyleUrl: string | null;
  caba2Url: string | null;
};

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  working: { label: "出勤", color: "text-green-700", bg: "bg-green-100 border-green-300" },
  off: { label: "休み", color: "text-red-700", bg: "bg-red-100 border-red-300" },
  unknown: { label: "未定", color: "text-gray-600", bg: "bg-gray-100 border-gray-300" },
};

export function AttendanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState(searchParams.get("date") ?? getToday());
  const [casts, setCasts] = useState<Cast[]>([]);
  const [records, setRecords] = useState<Record<string, CastRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCasts = useCallback(async () => {
    const res = await fetch("/api/casts");
    if (res.ok) {
      const data: Cast[] = await res.json();
      setCasts(data.filter((c) => c.active));
    }
  }, []);

  const loadAttendance = useCallback(async (targetDate: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${targetDate}`);
      if (!res.ok) return;
      const data = await res.json();
      const recordMap: Record<string, CastRecord> = {};
      for (const r of data) {
        recordMap[r.castId] = {
          castId: r.castId, castName: r.cast.name, castDisplayName: r.cast.displayName,
          status: r.status, startTime: r.startTime ?? "", endTime: r.endTime ?? "",
          comment: r.comment ?? "", updatePokepara: r.updatePokepara,
          updateChocolat: r.updateChocolat, updateNightstyle: r.updateNightstyle,
          updateCaba2: r.updateCaba2, recordId: r.id,
        };
      }
      setRecords(recordMap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCasts(); }, [loadCasts]);
  useEffect(() => { loadAttendance(date); }, [date, loadAttendance]);

  const getRecord = (cast: Cast): CastRecord =>
    records[cast.id] ?? {
      castId: cast.id, castName: cast.name, castDisplayName: cast.displayName,
      status: "unknown" as AttendanceStatus, startTime: "", endTime: "", comment: "",
      updatePokepara: cast.pokeparaEnabled, updateChocolat: cast.chocolatEnabled,
      updateNightstyle: cast.nightstyleEnabled, updateCaba2: cast.caba2Enabled,
    };

  const updateRecord = (castId: string, update: Partial<CastRecord>) => {
    setRecords((prev) => ({
      ...prev,
      [castId]: { ...getRecord(casts.find((c) => c.id === castId)!), ...prev[castId], ...update },
    }));
  };

  const handleBulkStatus = (status: AttendanceStatus) => {
    const updated: Record<string, CastRecord> = {};
    for (const cast of casts) updated[cast.id] = { ...getRecord(cast), status };
    setRecords((prev) => ({ ...prev, ...updated }));
  };

  const handleBulkTime = (startTime: string, endTime: string) => {
    const updated: Record<string, CastRecord> = {};
    for (const cast of casts) {
      const rec = getRecord(cast);
      if (rec.status === "working") updated[cast.id] = { ...rec, startTime, endTime };
    }
    setRecords((prev) => ({ ...prev, ...updated }));
  };

  const copyFromDate = async (fromDate: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${fromDate}`);
      if (!res.ok) return;
      const data = await res.json();
      const updated: Record<string, CastRecord> = {};
      for (const r of data) {
        updated[r.castId] = {
          castId: r.castId, castName: r.cast.name, castDisplayName: r.cast.displayName,
          status: r.status, startTime: r.startTime ?? "", endTime: r.endTime ?? "",
          comment: r.comment ?? "", updatePokepara: r.updatePokepara,
          updateChocolat: r.updateChocolat, updateNightstyle: r.updateNightstyle,
          updateCaba2: r.updateCaba2,
        };
      }
      setRecords((prev) => ({ ...prev, ...updated }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const toSave = casts.map((cast) => {
        const rec = getRecord(cast);
        return {
          castId: cast.id, date, status: rec.status,
          startTime: rec.startTime || null, endTime: rec.endTime || null,
          comment: rec.comment || null, updatePokepara: rec.updatePokepara,
          updateChocolat: rec.updateChocolat, updateNightstyle: rec.updateNightstyle,
          updateCaba2: rec.updateCaba2,
        };
      });
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "保存に失敗しました");
      }
      await loadAttendance(date);
      setSuccess("出勤情報を保存しました");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">出勤表入力</h2>
      </div>

      {/* 日付選択 */}
      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <Label htmlFor="date">対象日</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
            </div>
            <div className="flex gap-2 pt-5 flex-wrap">
              <Button type="button" variant="outline" size="sm" onClick={() => setDate(addDays(date, -1))}>← 前日</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setDate(getToday())}>今日</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setDate(addDays(date, 1))}>翌日 →</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => copyFromDate(addDays(date, -1))} disabled={loading}>前日をコピー</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => copyFromDate(addDays(date, -7))} disabled={loading}>前週をコピー</Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{formatDate(date)}（{getDayOfWeek(date)}）</p>
        </CardContent>
      </Card>

      {/* 一括操作 */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">一括設定:</span>
            <Button type="button" variant="success" size="sm" onClick={() => handleBulkStatus("working")}>全員出勤</Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => handleBulkStatus("off")}>全員休み</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => handleBulkStatus("unknown")}>全員未定</Button>
            <Button
              type="button" variant="outline" size="sm"
              onClick={() => {
                const t = prompt("出勤開始時間（例: 20:00）");
                const e = prompt("退勤時間（例: 02:00）");
                if (t !== null || e !== null) handleBulkTime(t ?? "", e ?? "");
              }}
            >
              時間を一括設定
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert variant="success" className="mb-4"><AlertDescription>{success}</AlertDescription></Alert>}

      {loading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : casts.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">キャストが登録されていません。先にキャストを登録してください。</CardContent></Card>
      ) : (
        <div className="space-y-3 mb-6">
          {casts.map((cast) => {
            const rec = getRecord(cast);
            const statusCfg = STATUS_CONFIG[rec.status];
            return (
              <Card key={cast.id} className={`border-2 transition-colors ${statusCfg.bg}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold text-gray-900">{cast.displayName}</span>
                      {cast.name !== cast.displayName && (
                        <span className="text-gray-400 text-xs ml-1">({cast.name})</span>
                      )}
                    </div>
                    <Badge variant={rec.status === "working" ? "working" : rec.status === "off" ? "off" : "unknown"}>
                      {statusCfg.label}
                    </Badge>
                  </div>

                  {/* ステータス選択 */}
                  <div className="flex gap-2 mb-3">
                    {(["working", "off", "unknown"] as AttendanceStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateRecord(cast.id, { status: s })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                          rec.status === s
                            ? s === "working" ? "bg-green-600 text-white border-green-600"
                              : s === "off" ? "bg-red-500 text-white border-red-500"
                              : "bg-gray-500 text-white border-gray-500"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>

                  {/* 出勤時間（出勤の場合のみ） */}
                  {rec.status === "working" && (
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <Label className="text-xs">出勤時間</Label>
                        <Input type="time" value={rec.startTime}
                          onChange={(e) => updateRecord(cast.id, { startTime: e.target.value })} className="h-9 text-sm" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">退勤時間</Label>
                        <Input type="time" value={rec.endTime}
                          onChange={(e) => updateRecord(cast.id, { endTime: e.target.value })} className="h-9 text-sm" />
                      </div>
                    </div>
                  )}

                  {/* コメント */}
                  <div className="mb-3">
                    <Textarea value={rec.comment}
                      onChange={(e) => updateRecord(cast.id, { comment: e.target.value })}
                      placeholder="一言コメント（任意）" rows={1} className="text-sm h-9 py-2" />
                  </div>

                  {/* サイト別ON/OFF */}
                  <div className="flex flex-wrap gap-3">
                    {SITE_NAMES.map((site) => {
                      const enabledKey = `update${site.charAt(0).toUpperCase() + site.slice(1)}` as keyof CastRecord;
                      const castHasUrl = Boolean(cast[`${site}Url` as keyof Cast]);
                      return (
                        <div key={site} className="flex items-center gap-1.5">
                          <Toggle
                            checked={(rec[enabledKey] as boolean) && castHasUrl}
                            onChange={(v) => updateRecord(cast.id, { [enabledKey]: v })}
                            disabled={!castHasUrl}
                          />
                          <span className={`text-xs ${castHasUrl ? "text-gray-600" : "text-gray-300"}`}>
                            {SITE_LABELS[site]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 保存・プレビューボタン */}
      <div className="flex gap-3 flex-col sm:flex-row sticky bottom-20 md:bottom-4 bg-white/95 backdrop-blur py-3 border-t border-gray-200 -mx-4 px-4 md:mx-0 md:px-0 md:border-0 md:bg-transparent md:static">
        <Button type="button" onClick={handleSave} disabled={saving || casts.length === 0} size="lg" className="flex-1">
          {saving ? "保存中..." : "💾 保存する"}
        </Button>
        <Button type="button" variant="outline" size="lg"
          onClick={() => router.push(`/attendance/preview?date=${date}`)} className="flex-1">
          👁 更新プレビューへ
        </Button>
      </div>
    </div>
  );
}
