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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600&family=Montserrat:wght@400;500;600&family=Poppins:wght@400;500;600&family=Playfair+Display:wght@400;600&family=Merriweather:wght@400;700&family=Lora:wght@400;500&family=Crimson+Pro:wght@400;600&family=EB+Garamond:wght@400;500&family=Ma+Shan+Zheng&family=Liu+Jian+Mao+Cao&family=Zhi+Mang+Xing&family=Caveat:wght@400;600&family=Dancing+Script:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/alibaba-puhuiti-regular@1.0.0/index.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
