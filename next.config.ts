import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the sandboxed live preview (proxied under *.e2b.app) load dev assets.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
    ],
  },
};

export default nextConfig;
