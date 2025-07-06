/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint configuration - now using warnings instead of strict errors
  eslint: {
    // Allow warnings during builds, only fail on errors
    ignoreDuringBuilds: false,
  },
  // Configure external packages for server components
  serverExternalPackages: ['bcryptjs', '@prisma/client'],
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXTAUTH_URL] 
        : ['localhost:3000', '172.18.0.2:3000', '0.0.0.0:3000', '192.168.0.227:3003'],
    },
  },
  // Make the server listen on all network interfaces
  async rewrites() {
    return [];
  },
  // Add cache control headers to prevent caching
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
