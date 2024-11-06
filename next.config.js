/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用所有开发模式指示器
  devIndicators: {
    buildActivity: false,
  },
  // 禁用 React 严格模式
  reactStrictMode: false,
  // 实验性功能配置
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },
};

module.exports = nextConfig;
