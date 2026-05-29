import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_LABELS, SITE_NAMES } from "@/lib/automation/types";

export const dynamic = "force-dynamic";

export default async function CastsPage() {
  const casts = await prisma.cast.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">キャスト一覧</h2>
          <p className="text-gray-500 text-sm mt-1">{casts.length}名登録済み</p>
        </div>
        <Link href="/casts/new">
          <Button size="lg">➕ 新規登録</Button>
        </Link>
      </div>

      {casts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">キャストが登録されていません</p>
            <Link href="/casts/new">
              <Button>最初のキャストを登録する</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {casts.map((cast) => {
            const siteUrls = {
              pokepara: cast.pokeparaUrl,
              chocolat: cast.chocolatUrl,
              nightstyle: cast.nightstyleUrl,
              caba2: cast.caba2Url,
            };

            return (
              <Card key={cast.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{cast.displayName}</span>
                        {cast.name !== cast.displayName && (
                          <span className="text-gray-400 text-sm">({cast.name})</span>
                        )}
                        {cast.active ? (
                          <Badge variant="success">在籍</Badge>
                        ) : (
                          <Badge variant="secondary">退職</Badge>
                        )}
                      </div>
                      {cast.memo && (
                        <p className="text-gray-500 text-sm mt-1 truncate">{cast.memo}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {SITE_NAMES.map((site) => {
                          const hasUrl = Boolean(siteUrls[site]);
                          const enabled = cast[`${site}Enabled` as keyof typeof cast] as boolean;
                          return (
                            <span
                              key={site}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                hasUrl && enabled
                                  ? "bg-blue-100 text-blue-700"
                                  : hasUrl && !enabled
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-gray-50 text-gray-300"
                              }`}
                            >
                              {SITE_LABELS[site]}
                              {!hasUrl ? " (未設定)" : !enabled ? " (OFF)" : ""}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <Link href={`/casts/${cast.id}/edit`}>
                      <Button variant="outline" size="sm">編集</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
