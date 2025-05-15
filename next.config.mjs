/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '172.18.0.2:3000', '0.0.0.0:3000', '192.168.0.227:3003'],
    },
  },
  // Make the server listen on all network interfaces
  async rewrites() {
    return [];
  },
};

export default nextConfig;
