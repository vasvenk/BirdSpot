import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const pwa = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /\/api\/sightings(\?.*)?$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "sightings-feed",
          networkTimeoutSeconds: 4,
          expiration: {
            maxEntries: 24,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },
      {
        urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "osm-tiles",
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default pwa(nextConfig);
