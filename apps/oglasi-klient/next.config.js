/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@oglasi/database', '@oglasi/auth'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
