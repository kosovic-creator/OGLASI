const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  dynamicStartUrlRedirect: '/login',
  fallbacks: {
    document: '/offline',
  },
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@oglasi/database', '@oglasi/auth'],
};

module.exports = withPWA(nextConfig);
