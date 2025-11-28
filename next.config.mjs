/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize bundle
  swcMinify: true,

  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize images
  images: {
    domains: ['clerk.com'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
