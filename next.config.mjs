/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  async rewrites() {
    return [
      {
        source: "/flask/:path*",
        destination: "http://localhost:5000/:path*"
      }
    ];
  }
};

export default nextConfig;
