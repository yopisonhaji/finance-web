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
};

export default nextConfig;
