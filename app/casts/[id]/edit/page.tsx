import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CastForm } from "@/components/casts/cast-form";

export const dynamic = "force-dynamic";

export default async function EditCastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cast = await prisma.cast.findUnique({ where: { id } });
  if (!cast) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">キャスト編集</h2>
        <p className="text-gray-500 text-sm mt-1">{cast.displayName} の情報を編集します</p>
      </div>
      <CastForm
        mode="edit"
        initialData={{
          id: cast.id,
          name: cast.name,
          displayName: cast.displayName,
          active: cast.active,
          memo: cast.memo ?? "",
          pokeparaUrl: cast.pokeparaUrl ?? "",
          chocolatUrl: cast.chocolatUrl ?? "",
          nightstyleUrl: cast.nightstyleUrl ?? "",
          caba2Url: cast.caba2Url ?? "",
          pokeparaEnabled: cast.pokeparaEnabled,
          chocolatEnabled: cast.chocolatEnabled,
          nightstyleEnabled: cast.nightstyleEnabled,
          caba2Enabled: cast.caba2Enabled,
        }}
      />
    </div>
  );
}
