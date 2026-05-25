import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProductsByCategory } from "@/data/products";

const categoryMap: Record<string, { display: string; filter: string }> = {
  bundles: { display: "Bundles", filter: "Bundles" },
  "crochet-braids": { display: "Crochet Braids", filter: "Crochet Braids" },
  "human-hair": { display: "Human Hair", filter: "Human Hair" },
  "french-curls": { display: "French Curls", filter: "French Curls" },
  "bone-straight": { display: "Bone Straight", filter: "Bone Straight" },
  "deep-wave": { display: "Deep Wave", filter: "Deep Wave" },
  "textured-straight": {
    display: "Textured Straight",
    filter: "Textured Straight",
  },
};

export function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({ slug }));
}

export default async function ProductCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryMap[slug];

  if (!category) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-20 text-center" style={{ paddingTop: 110 }}>
          <h1 className="text-[28px] font-normal uppercase tracking-[0.2em]">
            Category Not Found
          </h1>
        </main>
        <Footer />
      </>
    );
  }

  const products = getProductsByCategory(category.filter);

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
          <span className="text-[#282828]">{category.display}</span>
        </nav>

        {/* Heading */}
        <h1
          className="mb-4 text-center text-[32px] font-normal"
          style={{ color: "#5C3D28", fontFamily: "var(--font-playfair), Playfair Display, serif" }}
        >
          {category.display}
        </h1>

        {/* Product count */}
        <p className="mb-8 text-center text-[15px] text-[#686868]">
          Showing {products.length} result{products.length !== 1 ? "s" : ""}
        </p>

        {/* Product grid */}
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
      </main>
      <Footer />
    </>
  );
}
