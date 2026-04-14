import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      // Pages HTML — never cache in browser so users always get latest deploy
      source: "/((?!_next/static|_next/image|favicon).*)",
      headers: [
        { key: "Cache-Control", value: "no-store, must-revalidate" },
        { key: "x-build", value: "v6" },
      ],
    },
    {
      // Static assets — long-lived cache (they have content hashes in filenames)
      source: "/_next/static/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
};

export default nextConfig;
