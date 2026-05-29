"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_LABELS, SITE_NAMES, type SiteName } from "@/lib/automation/types";

type CastFormData = {
  id?: string;
  name: string;
  displayName: string;
  active: boolean;
  memo: string;
  pokeparaUrl: string;
  chocolatUrl: string;
  nightstyleUrl: string;
  caba2Url: string;
  pokeparaEnabled: boolean;
  chocolatEnabled: boolean;
  nightstyleEnabled: boolean;
  caba2Enabled: boolean;
};

type CastFormProps = {
  initialData?: Partial<CastFormData>;
  mode: "create" | "edit";
};

const defaultData: CastFormData = {
  name: "", displayName: "", active: true, memo: "",
  pokeparaUrl: "", chocolatUrl: "", nightstyleUrl: "", caba2Url: "",
  pokeparaEnabled: true, chocolatEnabled: true, nightstyleEnabled: true, caba2Enabled: true,
};

const SITE_URL_PLACEHOLDERS: Record<SiteName, string> = {
  pokepara: "https://www.pokepara.jp/shopc_manage/gal/detail.html?gal_id=...",
  chocolat: "https://chocolat.jp/shop/cast/...",
  nightstyle: "https://nightstyle.jp/manage/cast/...",
  caba2: "https://caba2.jp/cast/...",
};

export function CastForm({ initialData, mode }: CastFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CastFormData>({ ...defaultData, ...initialData });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const set = (key: keyof CastFormData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/casts" : `/api/casts/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const body = {
        name: formData.name, displayName: formData.displayName, active: formData.active,
        memo: formData.memo || null,
        pokeparaUrl: formData.pokeparaUrl || null, chocolatUrl: formData.chocolatUrl || null,
        nightstyleUrl: formData.nightstyleUrl || null, caba2Url: formData.caba2Url || null,
        pokeparaEnabled: formData.pokeparaEnabled, chocolatEnabled: formData.chocolatEnabled,
        nightstyleEnabled: formData.nightstyleEnabled, caba2Enabled: formData.caba2Enabled,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存に失敗しました");
      }
      router.push("/casts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/casts/${initialData?.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      router.push("/casts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}

      <Card>
        <CardHeader><CardTitle>基本情報</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">キャスト名（本名・管理用）*</Label>
            <Input id="name" value={formData.name} onChange={(e) => set("name", e.target.value)}
              placeholder="例: 山田花子" required />
          </div>
          <div>
            <Label htmlFor="displayName">表示名（源氏名）*</Label>
            <Input id="displayName" value={formData.displayName} onChange={(e) => set("displayName", e.target.value)}
              placeholder="例: はな" required />
          </div>
          <div className="flex items-center gap-3">
            <Label>在籍状態</Label>
            <div className="flex items-center gap-2">
              <Toggle checked={formData.active} onChange={(v) => set("active", v)} />
              <span className="text-sm text-gray-600">{formData.active ? "在籍中" : "退職済み"}</span>
            </div>
          </div>
          <div>
            <Label htmlFor="memo">メモ</Label>
            <Textarea id="memo" value={formData.memo} onChange={(e) => set("memo", e.target.value)}
              placeholder="自由メモ欄" rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>サイト別設定</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-gray-500">
            各サイトのキャスト管理ページURLを入力してください。URLが未設定のサイトは自動更新の対象外になります。
          </p>
          {SITE_NAMES.map((site) => {
            const urlKey = `${site}Url` as keyof CastFormData;
            const enabledKey = `${site}Enabled` as keyof CastFormData;
            return (
              <div key={site} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{SITE_LABELS[site]}</span>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={formData[enabledKey] as boolean}
                      onChange={(v) => set(enabledKey, v)}
                    />
                    <span className="text-sm text-gray-500">
                      {formData[enabledKey] ? "更新ON" : "更新OFF"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`${site}-url`}>管理URL / 識別子</Label>
                  <Input
                    id={`${site}-url`}
                    value={formData[urlKey] as string}
                    onChange={(e) => set(urlKey, e.target.value)}
                    placeholder={SITE_URL_PLACEHOLDERS[site]}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" disabled={loading} size="lg" className="flex-1">
          {loading ? "保存中..." : mode === "create" ? "登録する" : "変更を保存"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={loading}>
          キャンセル
        </Button>
        {mode === "edit" && (
          <Button type="button" variant="destructive" size="lg"
            onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
            削除
          </Button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">本当に削除しますか？</h3>
            <p className="text-gray-500 text-sm mb-4">この操作は取り消せません。出勤情報も一緒に削除されます。</p>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex-1">
                {loading ? "削除中..." : "削除する"}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
