import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProductsByCategory } from "@/data/products";
import { getAPICategories, getAPIProducts } from "@/lib/server-api";

// Static catalog categories (fallback only — API drives everything when reachable)
const staticCategoryMap: Record<string, { display: string; filter: string }> = {
  bundles: { display: "Bundles", filter: "Bundles" },
  "crochet-braids": { display: "Crochet Braids", filter: "Crochet Braids" },
  "human-hair": { display: "Human Hair", filter: "Human Hair" },
  "french-curls": { display: "French Curls", filter: "French Curls" },
  "bone-straight": { display: "Bone Straight", filter: "Bone Straight" },
  "deep-wave": { display: "Deep Wave", filter: "Deep Wave" },
  "textured-straight": { display: "Textured Straight", filter: "Textured Straight" },
};

export async function generateStaticParams() {
  const apiCategories = await getAPICategories();
  const apiSlugs = apiCategories.map((c) => c.slug);
  const staticSlugs = Object.keys(staticCategoryMap);
  return Array.from(new Set([...apiSlugs, ...staticSlugs])).map((slug) => ({ slug }));
}

const formatTsh = (price: string) =>
  `TSh${Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const FALLBACK_IMG = "/images/products/french-curls-honey-cocoa.jpg";

export default async function ProductCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try the API first — admin DB is the source of truth.
  const [apiCategories, apiProducts] = await Promise.all([
    getAPICategories(),
    getAPIProducts({ category: slug }),
  ]);
  const apiCategory = apiCategories.find((c) => c.slug === slug);
  const staticCategory = staticCategoryMap[slug];

  if (!apiCategory && !staticCategory) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-20 text-center" style={{ paddingTop: 110 }}>
          <h1 className="text-[28px] font-normal uppercase tracking-[0.2em]">
            Category Not Found
          </h1>
          <Link
            href="/shop"
            className="mt-6 inline-block underline transition-colors hover:text-[#8B5E3C]"
          >
            Back to Products
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const display = apiCategory?.name ?? staticCategory?.display ?? slug;

  const apiMapped = apiProducts.map((p) => ({
    slug: p.slug,
    title: p.name,
    price: formatTsh(p.price),
    imageUrl: p.image_url || FALLBACK_IMG,
    productUrl: `/product/${p.slug}`,
    isOutOfStock: !p.in_stock,
  }));

  // Static fallback: if static category is also defined, merge any extras that
  // aren't already in the API result (lets old static-only products still appear).
  const staticProducts = staticCategory
    ? getProductsByCategory(staticCategory.filter)
    : [];
  const apiSlugs = new Set(apiMapped.map((p) => p.slug));
  const products = [
    ...apiMapped,
    ...staticProducts.filter((p) => !apiSlugs.has(p.slug)),
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10" style={{ paddingTop: 100, backgroundColor: "#FDFAF6" }}>
        {/* Breadcrumb */}
        <nav className="mb-8 text-[13px] text-[#686868]">
          <Link
            href="/"
            className="transition-colors hover:text-[#8B5E3C]"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/shop"
            className="transition-colors hover:text-[#8B5E3C]"
          >
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#282828]">{display}</span>
        </nav>

        {/* Heading */}
        <h1
          className="mb-4 text-center text-[32px] font-normal"
          style={{ color: "#5C3D28", fontFamily: "var(--font-playfair), Playfair Display, serif" }}
        >
          {display}
        </h1>

        {/* Product count */}
        <p className="mb-8 text-center text-[15px] text-[#686868]">
          Showing {products.length} result{products.length !== 1 ? "s" : ""}
        </p>

        {/* Product grid */}
        {products.length === 0 ? (
          <p className="text-center text-[15px] text-[#999]">
            No products in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
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
        )}
      </main>
      <Footer />
    </>
  );
}
