import './globals.css';
import type { Metadata } from 'next';
import { AnalyticsWrapper } from './components/analytics';

export const metadata: Metadata = {
  title: '小红书图文生成器 - AI文案助手 | 一键生成精美卡片',
  description:
    '专业的小红书图文生成工具,支持AI文案创作、精美排版、一键导出。3分钟快速生成吸睛好文,助你轻松涨粉。支持多种模板、字体、背景,打造爆款笔记。',
  keywords: '小红书图文生成器,小红书文案助手,小红书排版工具,小红书卡片制作,图文排版,AI文案,小红书笔记,爆款文案',
  authors: [{ name: '小红书图文助手' }],
  openGraph: {
    title: '小红书图文生成器 - AI文案助手 | 一键生成精美卡片',
    description: '专业的小红书图文生成工具,支持AI文案创作、精美排版、一键导出。3分钟快速生成吸睛好文,助你轻松涨粉。',
    url: 'https://www.xhscard.top/',
    siteName: '小红书图文生成器',
    images: [
      {
        url: 'https://your-domain.com/og-image.jpg', // 需要添加一张预览图
        width: 1200,
        height: 630,
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // 需要添加Google站长验证码
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log('RootLayout rendering, environment:', process.env.NODE_ENV);

  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '小红书图文生成器',
              description: '专业的小红书图文生成工具,支持AI文案创作、精美排版、一键导出。',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'CNY',
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <div id="analytics-container">
          <AnalyticsWrapper />
        </div>
      </body>
    </html>
  );
}
