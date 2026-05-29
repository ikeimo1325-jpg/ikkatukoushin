import { CastForm } from "@/components/casts/cast-form";

export default function NewCastPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">キャスト登録</h2>
        <p className="text-gray-500 text-sm mt-1">新しいキャストを登録します</p>
      </div>
      <CastForm mode="create" />
    </div>
  );
}
