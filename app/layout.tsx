import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '小红书AI卡片生成器',
  description: '3分钟快速生成精美图文内容，一键导出分享',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
