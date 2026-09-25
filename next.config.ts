import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// The browser talks to the Django API directly (admin, checkout), so its
// origin has to be allowed in connect-src. Derived from the same env var the
// client uses, so moving the backend doesn't silently break the policy.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").origin;
  } catch {
    return "";
  }
})();

// Google Translate (loaded only for non-English visitors) pulls scripts,
// styles and an iframe from Google. Next's own inline bootstrap scripts need
// 'unsafe-inline' until we move to nonces.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://translate.google.com https://translate.googleapis.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://www.gstatic.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.gstatic.com https://*.google.com https://translate.googleapis.com",
  "font-src 'self' data:",
  // translate-pa.googleapis.com serves the translated text; Translate also
  // creates a same-origin frame (both seen in report-only on Swahili pages).
  `connect-src 'self' ${apiOrigin} https://open.er-api.com https://api.exchangerate.host https://translate.googleapis.com https://translate-pa.googleapis.com`,
  "frame-src 'self' https://translate.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  // Enforced since 2026-09-25, after report-only crawls of the live site
  // (desktop, phone, Swahili) came back clean. Adding a new third-party
  // script, API or iframe? Allow its origin above or the browser blocks it.
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
