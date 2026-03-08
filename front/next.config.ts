import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output для Docker
  output: "standalone",

  // Разрешить загрузку изображений с внешних источников
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // API proxy в dev (в prod через Nginx)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
