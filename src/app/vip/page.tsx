import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StylesGrid, type GridStyle } from "@/components/StylesGrid";
import { getServiceBySlug } from "@/data/services";
import { getAPIService } from "@/lib/server-api";

export const metadata = {
  title: "VIP — Solita Beauty Bar",
  description:
    "Solita VIP braiding: priority slot, dedicated braider, premium hair package — same signature styles, VIP experience.",
};

export default async function VIPPage() {
  // VIP is currently braiding-only. Pull braiding from the API first; fall back
  // to static data if the API is unavailable.
  const apiBraiding = await getAPIService("braiding");

  const styles: GridStyle[] = apiBraiding
    ? apiBraiding.styles
        .filter((s) => s.vip_price)
        .map((s) => ({
          slug: s.slug,
          name: s.name,
          description: s.description,
          price: `${s.price_from}`,
          vipPrice: s.vip_price ? `${s.vip_price}` : undefined,
          duration: s.duration,
          imageUrl: s.image_url || "/images/products/french-curls-honey-cocoa.jpg",
          images: (s.images ?? []).map((img) => img.image_url).filter(Boolean),
          options: {
            lengths: s.lengths.length > 0 ? s.lengths : undefined,
            colors: s.colors.length > 0 ? s.colors : undefined,
            types: s.types.length > 0 ? s.types : undefined,
          },
        }))
    : (getServiceBySlug("braiding")?.styles ?? [])
        .filter((s) => s.vipPrice)
        .map((s) => ({
          slug: s.slug,
          name: s.name,
          description: s.description,
          price: s.price,
          vipPrice: s.vipPrice,
          duration: s.duration,
          imageUrl: s.imageUrl,
          images: s.images,
          options: s.options,
        }));

  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{
          paddingTop: 120,
          paddingBottom: 80,
          fontFamily: "var(--font-jost), Jost, sans-serif",
          backgroundColor: "#FDFAF6",
        }}
      >
        {/* Breadcrumb */}
        <nav
          className="mx-auto max-w-[1200px] px-4 pt-6 pb-2"
          style={{ fontSize: 13, color: "#686868" }}
        >
          <Link href="/" className="transition-colors hover:text-[#8B5E3C]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: "#282828" }}>VIP</span>
        </nav>

        {/* Header */}
        <div
          className="mx-auto max-w-[1200px] px-4 text-center"
          style={{ paddingTop: 32, paddingBottom: 48 }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#fff",
              backgroundColor: "#8B5E3C",
              padding: "6px 16px",
              borderRadius: 999,
              marginBottom: 16,
            }}
          >
            VIP
          </span>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 400,
              color: "#5C3D28",
              marginBottom: 16,
              fontFamily: "var(--font-playfair), Playfair Display, serif",
            }}
          >
            Solita VIP Braiding
          </h1>
          <p
            className="mx-auto"
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "#686868",
              maxWidth: 650,
            }}
          >
            Same signature braiding styles, VIP experience: priority slot,
            dedicated braider, premium hair package. Booking is identical — only
            the price differs.
          </p>
        </div>

        {/* VIP Styles Grid */}
        <div className="mx-auto max-w-[1200px] px-4">
          {styles.length > 0 ? (
            <StylesGrid styles={styles} serviceSlug="braiding" tier="vip" />
          ) : (
            <div
              className="text-center"
              style={{
                fontSize: 14,
                color: "#999",
                padding: "60px 20px",
                backgroundColor: "#fff",
                borderRadius: 12,
                border: "1px solid #eee",
              }}
            >
              <p style={{ marginBottom: 8 }}>VIP styles coming soon.</p>
              <p style={{ fontSize: 13 }}>
                In the meantime, browse our{" "}
                <Link href="/services/braiding" className="text-[#8B5E3C] hover:underline">
                  regular braiding services
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
