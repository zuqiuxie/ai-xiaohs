/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用所有开发模式指示器
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: false,
  },
  // 禁用 React 严格模式（这会禁用一些开发时的行为）
  reactStrictMode: false,
  // 禁用静态优化指示器
  experimental: {
    staticPageGenerationTimeout: 1000,
    webVitalsAttribution: ['CLS', 'LCP'],
  },
}

module.exports = nextConfig