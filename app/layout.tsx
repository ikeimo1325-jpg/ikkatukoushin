import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "キャスト出勤管理",
  description: "キャスト出勤情報一括更新アプリ",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full`}>
      <body className="h-full bg-gray-50 text-gray-900 antialiased">
        <div className="flex h-full">
          {/* PCサイドバー */}
          <aside className="hidden md:flex w-56 flex-shrink-0 flex-col bg-white border-r border-gray-200 h-full fixed top-0 left-0">
            <div className="px-4 py-4 border-b border-gray-200">
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                キャスト出勤
                <br />
                一括管理
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <Sidebar />
            </div>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 md:ml-56 pb-20 md:pb-0">
            {/* モバイルヘッダー */}
            <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
              <MobileNav />
              <h1 className="font-bold text-gray-900">キャスト出勤管理</h1>
            </header>
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
