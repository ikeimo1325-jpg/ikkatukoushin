"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_LABELS, SITE_NAMES, type SiteName } from "@/lib/automation/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<SiteName, boolean>>(
    Object.fromEntries(SITE_NAMES.map((s) => [s, true])) as Record<SiteName, boolean>
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      if (data && typeof data === "object") {
        setSettings(data as Record<SiteName, boolean>);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ text: "設定を保存しました", type: "success" });
      } else {
        setMessage({ text: "保存に失敗しました", type: "error" });
      }
    } catch {
      setMessage({ text: "通信エラーが発生しました", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">設定</h2>
        <p className="text-gray-500 text-sm mt-1">サイト別のグローバル更新設定</p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "destructive"} className="mb-4">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>サイト別更新ON/OFF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            OFFにすると、キャスト個別設定に関わらずそのサイトへの更新が全てスキップされます。
          </p>
          {SITE_NAMES.map((site) => (
            <div key={site} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="font-medium text-gray-800">{SITE_LABELS[site]}</span>
              <div className="flex items-center gap-2">
                <Toggle
                  checked={settings[site]}
                  onChange={(v) => setSettings((prev) => ({ ...prev, [site]: v }))}
                />
                <span className="text-sm text-gray-500 w-8">
                  {settings[site] ? "ON" : "OFF"}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
        {saving ? "保存中..." : "設定を保存"}
      </Button>
    </div>
  );
}
