"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: "🏠" },
  { href: "/casts", label: "キャスト一覧", icon: "👥" },
  { href: "/casts/new", label: "キャスト登録", icon: "➕" },
  { href: "/attendance", label: "出勤表入力", icon: "📅" },
  { href: "/attendance/preview", label: "更新プレビュー", icon: "👁" },
  { href: "/sessions", label: "セッション管理", icon: "🔐" },
  { href: "/logs", label: "更新ログ", icon: "📋" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
