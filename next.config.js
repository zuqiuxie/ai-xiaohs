/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  images: {
    domains: [],
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer }) => {
    return config;
  },
  poweredByHeader: false,
}

module.exports = nextConfig