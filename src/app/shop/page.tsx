import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { allProducts } from "@/data/products";
import { getAPIProducts, getAPICategories } from "@/lib/server-api";

export default async function ShopPage() {
  const [apiProducts, apiCategories] = await Promise.all([
    getAPIProducts(),
    getAPICategories(),
  ]);

  const apiMapped = apiProducts.map((p) => ({
    slug: p.slug,
    title: p.name,
    price: `TSh${p.price}`,
    imageUrl: p.image_url || "/images/products/french-curls-honey-cocoa.jpg",
    productUrl: `/product/${p.slug}`,
    isOutOfStock: !p.in_stock,
  }));

  // Combine API products (first) with static products, avoiding duplicates
  const apiSlugs = new Set(apiMapped.map((p) => p.slug));
  const staticFiltered = allProducts.filter((p) => !apiSlugs.has(p.slug));
  const products = [...apiMapped, ...staticFiltered];

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#FDFAF6" }}>
      <Header />

      <main className="flex-1" style={{ marginTop: "90px" }}>
        <div className="mx-auto max-w-[1340px] px-[15px] py-10">
          {/* Breadcrumb */}
          <nav
            className="mb-6 text-center"
            style={{ fontSize: "13px", color: "#686868" }}
          >
            <Link
              href="/"
              className="transition-colors hover:text-[#8B5E3C]"
              style={{ color: "#686868" }}
            >
              Home
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: "#282828" }}>Products</span>
          </nav>

          {/* Page Heading */}
          <h1
            className="mb-8 text-center"
            style={{
              fontSize: "32px",
              fontWeight: 400,
              color: "#5C3D28",
              fontFamily: "var(--font-playfair), Playfair Display, serif",
            }}
          >
            Products
          </h1>

          {/* Category Filters — driven by the admin DB */}
          <nav
            className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            style={{ fontSize: "14px" }}
          >
            <Link
              href="/shop"
              style={{ color: "#8B5E3C", fontWeight: 600 }}
              className="transition-colors hover:text-[#8B5E3C]"
            >
              All Products
            </Link>
            {apiCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/product-category/${cat.slug}`}
                style={{ color: "#686868" }}
                className="transition-colors hover:text-[#8B5E3C]"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Sort & Count Bar */}
          <div className="mb-8 flex items-center justify-between">
            <span style={{ fontSize: "14px", color: "#686868" }}>
              {products.length} Products
            </span>
            <select
              defaultValue="popularity"
              style={{
                border: "1px solid #ddd",
                fontSize: "14px",
                padding: "8px 16px",
                color: "#282828",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="popularity">Sort by popularity</option>
              <option value="rating">Sort by average rating</option>
              <option value="latest">Sort by latest</option>
              <option value="price-low">Sort by price: low to high</option>
              <option value="price-high">Sort by price: high to low</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {products.map((product) => (
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
      </main>

      <Footer />
    </div>
  );
}
