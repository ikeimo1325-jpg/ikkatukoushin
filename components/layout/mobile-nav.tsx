"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/attendance", label: "出勤入力", icon: "📅" },
  { href: "/casts", label: "キャスト", icon: "👥" },
  { href: "/sessions", label: "セッション", icon: "🔐" },
  { href: "/logs", label: "ログ", icon: "📋" },
];

const allNavItems = [
  { href: "/", label: "ダッシュボード", icon: "🏠" },
  { href: "/casts", label: "キャスト一覧", icon: "👥" },
  { href: "/casts/new", label: "キャスト登録", icon: "➕" },
  { href: "/attendance", label: "出勤表入力", icon: "📅" },
  { href: "/attendance/preview", label: "更新プレビュー", icon: "👁" },
  { href: "/sessions", label: "セッション管理", icon: "🔐" },
  { href: "/logs", label: "更新ログ", icon: "📋" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        aria-label="メニュー"
      >
        <div className="w-5 h-0.5 bg-current mb-1" />
        <div className="w-5 h-0.5 bg-current mb-1" />
        <div className="w-5 h-0.5 bg-current" />
      </button>

      {/* ドロワーメニュー */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMenuOpen(false)} />
          <nav className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">メニュー</h2>
              <button onClick={() => setMenuOpen(false)} className="p-1 rounded text-gray-500 hover:bg-gray-100">✕</button>
            </div>
            {allNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-30">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center py-2 text-xs transition-colors",
              pathname === item.href ? "text-blue-600" : "text-gray-500"
            )}
          >
            <span className="text-xl leading-none mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
