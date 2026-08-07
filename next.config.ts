import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["drizzle-orm", "@libsql/client"],
  images: {
    unoptimized: true,
  },
  env: {
    APP_VERSION: pkg.version,
  },
  async rewrites() {
    return [
      {
        source: '/api-bot/:path*',
        destination: 'http://195.88.211.117:8080/:path*'
      }
    ];
  },
};

export default nextConfig;
