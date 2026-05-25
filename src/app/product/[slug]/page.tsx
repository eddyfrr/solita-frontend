import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Carousel } from "@/components/Carousel";
import { getProductBySlug, allProducts } from "@/data/products";
import type { Product } from "@/data/products";
import { getAPIProduct } from "@/lib/server-api";
import { Price } from "@/components/Price";

export const dynamicParams = true;

export function generateStaticParams() {
  return allProducts.map((product) => ({
    slug: product.slug,
  }));
}

function getRelatedProducts(product: Product): Product[] {
  const sameCategoryProducts = allProducts.filter(
    (p) =>
      p.slug !== product.slug &&
      p.category.some((cat) => product.category.includes(cat)),
  );

  // Shuffle and take up to 4
  const shuffled = sameCategoryProducts.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product = getProductBySlug(slug);
  let extraImageUrls: string[] = [];

  // If not in static data, try the API
  if (!product) {
    const apiProduct = await getAPIProduct(slug);
    if (apiProduct) {
      product = {
        slug: apiProduct.slug,
        title: apiProduct.name,
        price: `TSh${apiProduct.price}`,
        imageUrl: apiProduct.image_url || "/images/products/french-curls-honey-cocoa.jpg",
        productUrl: `/product/${apiProduct.slug}`,
        isOutOfStock: !apiProduct.in_stock,
        description: apiProduct.description || "",
        category: apiProduct.category ? [apiProduct.category.name] : [],
        lengthOptions: [],
      };
      extraImageUrls = (apiProduct.images ?? [])
        .filter((img) => img.image_url && img.image_url !== apiProduct.image_url)
        .map((img) => img.image_url);
    }
  }

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);

  // Build the carousel image list — primary first, then any extras (and
  // fall back to secondaryImageUrl from the local mock if present).
  const carouselImages = [
    { src: product.imageUrl, alt: product.title },
    ...(product.secondaryImageUrl
      ? [{ src: product.secondaryImageUrl, alt: product.title }]
      : []),
    ...extraImageUrls.map((src) => ({ src, alt: product.title })),
  ];

  return (
    <>
      <Header />
      <main
        className="mx-auto w-full"
        style={{ maxWidth: 1200, fontFamily: "var(--font-jost), Jost, sans-serif", paddingTop: 90, backgroundColor: "#FDFAF6" }}
      >
        {/* Breadcrumb */}
        <nav
          className="px-4 pt-6 pb-2"
          style={{ fontSize: 13, color: "#686868" }}
        >
          <Link href="/" className="transition-colors hover:text-[#8B5E3C]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/shop"
            className="transition-colors hover:text-[#8B5E3C]"
          >
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: "#282828" }}>{product.title}</span>
        </nav>

        {/* Product Section */}
        <div
          className="flex flex-col px-4 lg:flex-row"
          style={{ paddingTop: 60, paddingBottom: 60, gap: 60 }}
        >
          {/* LEFT — Product Image carousel */}
          <div className="w-full lg:w-1/2">
            <Carousel images={carouselImages} aspectRatio="3/4" priority />
          </div>

          {/* RIGHT — Product Info */}
          <div className="w-full lg:w-1/2">
            <h1
              style={{
                fontSize: 26,
                fontWeight: 400,
                color: "#5C3D28",
                marginBottom: 8,
                fontFamily: "var(--font-playfair), Playfair Display, serif",
              }}
            >
              {product.title}
            </h1>

            <Price
              value={product.price}
              style={{
                fontSize: 18,
                color: "#8B5E3C",
                fontWeight: 500,
                marginBottom: 24,
                display: "block",
              }}
            />

            {product.description && (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "#686868",
                  marginBottom: 24,
                }}
              >
                {product.description}
              </p>
            )}

            {/* Length Selector + Add to Cart */}
            <AddToCartButton
              slug={product.slug}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              isOutOfStock={product.isOutOfStock}
              lengthOptions={product.lengthOptions}
            />

            {/* SKU */}
            {product.sku && (
              <p style={{ fontSize: 13, color: "#999", marginTop: 16 }}>
                SKU: {product.sku}
              </p>
            )}

            {/* Categories */}
            {product.category.length > 0 && (
              <p style={{ fontSize: 13, color: "#999", marginTop: 8 }}>
                Categories:{" "}
                {product.category.map((cat, i) => (
                  <span key={cat}>
                    {i > 0 && ", "}
                    <span
                      className="transition-colors hover:text-[#282828]"
                      style={{ color: "#8B5E3C", cursor: "pointer" }}
                    >
                      {cat}
                    </span>
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        {/* Description / Reviews Tabs */}
        <div className="px-4" style={{ paddingBottom: 60 }}>
          <div
            style={{
              borderBottom: "1px solid #ddd",
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              className="relative"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#282828",
                paddingBottom: 12,
                borderBottom: "2px solid #282828",
                background: "none",
                border: "none",
                borderBottomWidth: 2,
                borderBottomStyle: "solid",
                borderBottomColor: "#282828",
                cursor: "pointer",
                marginRight: 24,
              }}
            >
              Description
            </button>
            <button
              type="button"
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: "#999",
                paddingBottom: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reviews (0)
            </button>
          </div>

          <div
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: "#686868",
            }}
          >
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>No description available for this product.</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="px-4" style={{ paddingBottom: 60 }}>
            <h2
              className="text-center uppercase"
              style={{
                fontSize: 20,
                letterSpacing: "0.15em",
                color: "#282828",
                fontWeight: 400,
                marginBottom: 40,
              }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {relatedProducts.map((rp) => (
                <ProductCard
                  key={rp.slug}
                  title={rp.title}
                  price={rp.price}
                  imageUrl={rp.imageUrl}
                  productUrl={rp.productUrl}
                  isOutOfStock={rp.isOutOfStock}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
