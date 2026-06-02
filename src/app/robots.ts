import type { MetadataRoute } from "next";

const SITE_URL = "https://solitabeautybar.me";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep transactional / private areas out of search results.
      disallow: ["/admin", "/checkout", "/cart", "/wishlist", "/booking/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
