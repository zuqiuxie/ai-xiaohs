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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/style.css"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
