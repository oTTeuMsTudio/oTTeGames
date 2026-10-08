import type { NextConfig } from "next";

const legacyPaths = [
  "/book",
  "/community",
  "/downloads",
  "/games",
  "/library",
  "/news",
  "/settings",
  "/support",
  "/tutorial",
  "/wishlist",
  "/api/chat",
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyPaths.flatMap((path) => [
      { source: path, destination: "/", permanent: false },
      { source: `${path}/:path*`, destination: "/", permanent: false },
    ]);
  },
};

export default nextConfig;
