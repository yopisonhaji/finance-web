import type { NextConfig } from "next";
import pkg from "./package.json";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["drizzle-orm", "@libsql/client"],
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  
  // Image optimization (tetap unoptimized untuk standalone mode)
  images: {
    unoptimized: true,
    minimumCacheTTL: 86400, // 24 jam cache
  },
  
  // Cache static assets lebih lama  
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 jam
    pagesBufferLength: 5,
  },
  
  // Optimize package imports untuk tree-shaking
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
    ],
  },
  
  // Bundle analysis tersedia via ANALYZE=true
  env: {
    APP_VERSION: pkg.version,
  },
  
  // Security & perf headers
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
