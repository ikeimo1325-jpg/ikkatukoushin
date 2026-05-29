import { Suspense } from "react";
import { AttendanceForm } from "@/components/attendance/attendance-form";

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">読み込み中...</div>}>
      <AttendanceForm />
    </Suspense>
  );
}
