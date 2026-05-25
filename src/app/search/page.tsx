"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { allProducts } from "@/data/products";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = query.trim().length > 0
    ? allProducts.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.some((c) => c.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{
          paddingTop: 150,
          paddingBottom: 80,
          fontFamily: "var(--font-jost), Jost, sans-serif",
          backgroundColor: "#FDFAF6",
        }}
      >
        <div className="mx-auto max-w-[1340px] px-[15px]">
          <h1
            className="text-center"
            style={{ fontSize: 48, fontWeight: 400, color: "#5C3D28", marginBottom: 40, fontFamily: "var(--font-playfair), Playfair Display, serif" }}
          >
            Search
          </h1>

          {/* Search input */}
          <div className="mx-auto" style={{ maxWidth: 600, marginBottom: 40 }}>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full outline-none"
                style={{
                  fontSize: 16,
                  padding: "14px 50px 14px 20px",
                  border: "1px solid #ddd",
                  color: "#282828",
                }}
              />
              <SearchIcon
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
                style={{ width: 20, height: 20 }}
              />
            </div>
          </div>

          {/* Results */}
          {query.trim().length > 0 && (
            <p
              className="text-center"
              style={{ fontSize: 14, color: "#686868", marginBottom: 30 }}
            >
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8">
              {results.map((product) => (
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

          {query.trim().length > 0 && results.length === 0 && (
            <p className="text-center" style={{ fontSize: 15, color: "#686868", padding: "40px 0" }}>
              No products found matching your search.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
