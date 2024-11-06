import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小红书图文卡片生成器",
  description: "生成小红书风格的图文卡片",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
