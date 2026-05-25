import Image from "next/image";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { getFeaturedProducts, getCatalogProducts } from "@/data/products";
import { getAPIFeaturedProducts, getAPIProducts, getAPIGalleryPhotos } from "@/lib/server-api";
import Link from "next/link";

const fallbackGalleryImages = [
  { src: "/images/products/french-curls-honey-cocoa.jpg", alt: "French Curls Style" },
  { src: "/images/products/boho-beach-wave-hazel-brownie.jpg", alt: "Boho Beach Wave" },
  { src: "/images/products/cambodian-wavy-custom-burgundy.jpg", alt: "Cambodian Wavy" },
  { src: "/images/products/bone-straight-platinum-barbie.jpg", alt: "Bone Straight Style" },
  { src: "/images/products/deep-wave-cinnamon-mocha-darker-shade.jpg", alt: "Deep Wave Style" },
  { src: "/images/products/french-curls-ginger-spice.jpg", alt: "Ginger Spice Curls" },
  { src: "/images/products/kinky-curly-honey-maple.jpg", alt: "Kinky Curly Style" },
  { src: "/images/products/boho-beach-wave-caramel.jpg", alt: "Caramel Beach Wave" },
];

export default async function Home() {
  // Try API first, fall back to static data
  const apiFeatured = await getAPIFeaturedProducts();
  const apiCatalog = await getAPIProducts();
  const apiGallery = await getAPIGalleryPhotos();

  const staticFeatured = getFeaturedProducts();
  const staticCatalog = getCatalogProducts();

  // Combine API + static, API products shown first
  const apiFeaturedMapped = apiFeatured.map((p) => ({
    slug: p.slug,
    title: p.name,
    price: `$${p.price}`,
    imageUrl: p.image_url || "/images/products/french-curls-honey-cocoa.jpg",
    productUrl: `/product/${p.slug}`,
    isOutOfStock: !p.in_stock,
  }));
  const featuredSlugs = new Set(apiFeaturedMapped.map((p) => p.slug));
  const featuredProducts = [
    ...apiFeaturedMapped,
    ...staticFeatured.filter((p) => !featuredSlugs.has(p.slug)),
  ];

  const apiCatalogMapped = apiCatalog.map((p) => ({
    slug: p.slug,
    title: p.name,
    price: `$${p.price}`,
    imageUrl: p.image_url || "/images/products/french-curls-honey-cocoa.jpg",
    productUrl: `/product/${p.slug}`,
    isOutOfStock: !p.in_stock,
  }));
  const catalogSlugs = new Set(apiCatalogMapped.map((p) => p.slug));
  const catalogProducts = [
    ...apiCatalogMapped,
    ...staticCatalog.filter((p) => !catalogSlugs.has(p.slug)),
  ].slice(0, 8);

  const galleryImages = apiGallery.length > 0
    ? apiGallery.slice(0, 8).map((p) => ({
        src: p.image_url,
        alt: p.caption || "Client Photo",
      }))
    : fallbackGalleryImages;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFAF6" }}>
      <Header />

      <main>
        <HeroSection />

        {/* Featured Hair Section */}
        <section style={{ padding: "60px 0" }}>
          <div className="mx-auto max-w-[1340px] px-[15px]">
            <h2
              className="text-center font-normal"
              style={{
                fontSize: "30px",
                color: "#8B5E3C",
                fontFamily: "var(--font-playfair), Playfair Display, serif",
                marginBottom: "30px",
              }}
            >
              FEATURED HAIR
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  title={product.title}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  productUrl={product.productUrl}
                  isOutOfStock={product.isOutOfStock}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Shop Our Catalog Section */}
        <section style={{ padding: "60px 0" }}>
          <div className="mx-auto max-w-[1340px] px-[15px]">
            <h2
              className="text-center font-normal"
              style={{
                fontSize: "30px",
                color: "#8B5E3C",
                fontFamily: "var(--font-playfair), Playfair Display, serif",
                marginBottom: "30px",
              }}
            >
              SHOP OUR CATALOG
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8">
              {catalogProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  title={product.title}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  productUrl={product.productUrl}
                  isOutOfStock={product.isOutOfStock}
                />
              ))}
            </div>
            <div className="text-center" style={{ marginTop: "40px" }}>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center text-white font-normal transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#8B5E3C",
                  padding: "12px 84px",
                  fontSize: "16px",
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                  border: "2px solid transparent",
                }}
              >
                SHOP ALL
              </Link>
            </div>
          </div>
        </section>

        {/* Client Gallery Section */}
        <section
          style={{
            padding: "70px 0",
            backgroundColor: "#FAF0E8",
          }}
        >
          <div className="mx-auto max-w-[1340px] px-[15px]">
            <h2
              className="text-center font-normal"
              style={{
                fontSize: "30px",
                color: "#8B5E3C",
                fontFamily: "var(--font-playfair), Playfair Display, serif",
                marginBottom: "10px",
              }}
            >
              OUR WORK
            </h2>
            <p
              className="text-center"
              style={{
                fontSize: "15px",
                color: "#686868",
                fontFamily: "var(--font-jost), Jost, sans-serif",
                marginBottom: "40px",
              }}
            >
              Beautiful styles crafted by our talented team
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden"
                  style={{
                    borderRadius: 10,
                    aspectRatio: i % 3 === 0 ? "3/4" : "1/1",
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
                    }}
                  >
                    <span
                      className="text-white"
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        fontFamily: "var(--font-jost), Jost, sans-serif",
                      }}
                    >
                      {img.alt}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center" style={{ marginTop: "40px" }}>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center font-normal transition-all hover:bg-[#8B5E3C] hover:text-white"
                style={{
                  color: "#8B5E3C",
                  padding: "12px 60px",
                  fontSize: "14px",
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                  border: "1.5px solid #8B5E3C",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
