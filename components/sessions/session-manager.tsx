"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_LABELS, SITE_NAMES, type SiteName } from "@/lib/automation/types";

type SessionStatus = {
  site: string;
  exists: boolean;
  ageMs: number | null;
  ageDays: number | null;
};

export function SessionManager() {
  const [statuses, setStatuses] = useState<Record<SiteName, SessionStatus | null>>(
    Object.fromEntries(SITE_NAMES.map((s) => [s, null])) as Record<SiteName, SessionStatus | null>
  );
  const [loading, setLoading] = useState<Record<SiteName, boolean>>(
    Object.fromEntries(SITE_NAMES.map((s) => [s, false])) as Record<SiteName, boolean>
  );
  const [messages, setMessages] = useState<Record<SiteName, { text: string; type: "success" | "error" } | null>>(
    Object.fromEntries(SITE_NAMES.map((s) => [s, null])) as Record<SiteName, { text: string; type: "success" | "error" } | null>
  );

  const loadStatus = async (site: SiteName) => {
    const res = await fetch(`/api/sessions/${site}/status`);
    if (res.ok) {
      const data = await res.json();
      setStatuses((prev) => ({ ...prev, [site]: data }));
    }
  };

  useEffect(() => { SITE_NAMES.forEach(loadStatus); }, []);

  const setMsg = (site: SiteName, text: string, type: "success" | "error") => {
    setMessages((prev) => ({ ...prev, [site]: { text, type } }));
    setTimeout(() => setMessages((prev) => ({ ...prev, [site]: null })), 5000);
  };

  const handleLogin = async (site: SiteName) => {
    setLoading((prev) => ({ ...prev, [site]: true }));
    setMessages((prev) => ({ ...prev, [site]: null }));
    try {
      const res = await fetch(`/api/sessions/${site}/start-login`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMsg(site, "セッションを保存しました。次回から自動ログインできます。", "success");
        await loadStatus(site);
      } else {
        setMsg(site, data.error ?? "ログインに失敗しました", "error");
      }
    } catch {
      setMsg(site, "通信エラーが発生しました", "error");
    } finally {
      setLoading((prev) => ({ ...prev, [site]: false }));
    }
  };

  const handleDelete = async (site: SiteName) => {
    if (!confirm(`${SITE_LABELS[site]}のセッションを削除しますか？`)) return;
    setLoading((prev) => ({ ...prev, [site]: true }));
    try {
      const res = await fetch(`/api/sessions/${site}/save`, { method: "DELETE" });
      if (res.ok) {
        setMsg(site, "セッションを削除しました", "success");
        await loadStatus(site);
      } else {
        setMsg(site, "削除に失敗しました", "error");
      }
    } finally {
      setLoading((prev) => ({ ...prev, [site]: false }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">セッション管理</h2>
        <p className="text-gray-500 text-sm mt-1">各サイトへのログイン状態を管理します</p>
      </div>

      <Alert className="mb-6">
        <AlertDescription>
          <strong>使い方:</strong> 「ログイン」ボタンを押すとブラウザが起動します。
          表示されたページで手動でログインすると、セッションが自動保存されます。
          次回以降はパスワード入力なしで自動操作できます。
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {SITE_NAMES.map((site) => {
          const status = statuses[site];
          const isLoading = loading[site];
          const msg = messages[site];

          return (
            <Card key={site}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{SITE_LABELS[site]}</CardTitle>
                  {status === null ? (
                    <Badge variant="secondary">確認中...</Badge>
                  ) : status.exists ? (
                    <Badge variant="success">✓ ログイン済み</Badge>
                  ) : (
                    <Badge variant="warning">未ログイン</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {status?.exists && status.ageDays !== null && (
                  <p className="text-sm text-gray-500 mb-3">
                    セッション保存日: {status.ageDays === 0 ? "今日" : `${status.ageDays}日前`}
                    {status.ageDays >= 7 && " ⚠️ セッションが古くなっています。再ログインを検討してください。"}
                  </p>
                )}
                {msg && (
                  <Alert variant={msg.type === "success" ? "success" : "destructive"} className="mb-3">
                    <AlertDescription>{msg.text}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button onClick={() => handleLogin(site)} disabled={isLoading} size="lg" className="flex-1">
                    {isLoading ? "処理中（ブラウザを操作してください）..." : status?.exists ? "再ログイン" : "🔐 ログイン"}
                  </Button>
                  {status?.exists && (
                    <Button onClick={() => handleDelete(site)} disabled={isLoading} variant="destructive" size="lg">
                      削除
                    </Button>
                  )}
                </div>
                {isLoading && (
                  <p className="text-sm text-blue-600 mt-2">
                    ブラウザが起動します。ログインが完了するまでこのまましばらくお待ちください...
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
