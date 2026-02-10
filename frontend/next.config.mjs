/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // --- ADD THIS SECTION ---
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://3.68.108.28:8000/:path*', // Proxy to your EC2 Backend
      },
    ];
  },
};

export default nextConfig;
