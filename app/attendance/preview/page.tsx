import { Suspense } from "react";
import { PreviewPanel } from "@/components/update/preview-panel";

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">読み込み中...</div>}>
      <PreviewPanel />
    </Suspense>
  );
}
