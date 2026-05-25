import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function WishlistPage() {
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
        <div className="mx-auto max-w-[900px] px-4 text-center">
          <h1
            style={{ fontSize: 48, fontWeight: 400, color: "#5C3D28", marginBottom: 40, fontFamily: "var(--font-playfair), Playfair Display, serif" }}
          >
            Wishlist
          </h1>
          <p style={{ fontSize: 16, color: "#686868", marginBottom: 24 }}>
            Your wishlist is currently empty.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#8B5E3C",
              padding: "12px 40px",
              fontSize: 14,
            }}
          >
            Browse Products
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
