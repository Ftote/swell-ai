import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    { source: "/(.*)", headers: [{ key: "x-build", value: "v3" }] },
  ],
};

export default nextConfig;
