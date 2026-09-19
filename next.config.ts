import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // AVIF first, WebP as the fallback. Next only served WebP before, and on a
    // product grid this is where nearly all the page weight is. Browsers that
    // don't accept AVIF are unaffected — they still get WebP.
    formats: ["image/avif", "image/webp"],
    // The shop grid is 2-up on phones and 4-up on desktop, so the huge default
    // breakpoints were never useful; trimming them avoids generating and
    // caching variants no layout ever requests.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
};

export default nextConfig;
