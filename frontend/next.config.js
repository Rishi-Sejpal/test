/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async rewrites() {
    // In local dev, proxy /api to backend so same-domain fetch works
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
        {
          source: '/health',
          destination: 'http://localhost:8000/health',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
