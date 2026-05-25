"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { formatPrice } = useCurrency();

  const getNumericPrice = (price: string): number => {
    const match = price.match(/[\d,.]+/);
    return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + getNumericPrice(item.price) * item.quantity,
    0
  );

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
        <div className="mx-auto max-w-[900px] px-4">
          <h1
            className="text-center"
            style={{ fontSize: 48, fontWeight: 400, color: "#5C3D28", marginBottom: 40, fontFamily: "var(--font-playfair), Playfair Display, serif" }}
          >
            Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center" style={{ padding: "60px 0" }}>
              <p style={{ fontSize: 16, color: "#686868", marginBottom: 24 }}>
                Your cart is currently empty.
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
                Return to Shop
              </Link>
            </div>
          ) : (
            <>
              {/* Cart table header - desktop */}
              <div
                className="hidden md:grid"
                style={{
                  gridTemplateColumns: "80px 1fr 120px 100px 80px",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom: "1px solid #ddd",
                  fontSize: 13,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span />
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
              </div>

              {/* Cart items */}
              {items.map((item) => (
                <div
                  key={`${item.slug}-${item.selectedLength}`}
                  className="flex flex-col md:grid items-center gap-4"
                  style={{
                    gridTemplateColumns: "80px 1fr 120px 100px 80px",
                    padding: "20px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {/* Image */}
                  <div className="relative w-[80px] h-[100px] shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-[14px] text-[#282828] hover:text-[#8B5E3C] transition-colors"
                    >
                      {item.title}
                    </Link>
                    {item.selectedLength && (
                      <p className="text-[12px] text-[#999] mt-1">
                        Length: {item.selectedLength}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <span style={{ fontSize: 14, color: "#686868" }}>
                    {formatPrice(`TSh${(getNumericPrice(item.price) * item.quantity).toFixed(0)}`)}
                  </span>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.slug, item.quantity - 1, item.selectedLength)
                      }
                      className="p-1 text-[#686868] hover:text-[#282828]"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span
                      className="flex items-center justify-center"
                      style={{
                        width: 36,
                        height: 30,
                        border: "1px solid #ddd",
                        fontSize: 14,
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.slug, item.quantity + 1, item.selectedLength)
                      }
                      className="p-1 text-[#686868] hover:text-[#282828]"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Subtotal + Remove */}
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 14, color: "#282828", fontWeight: 500 }}>
                      {formatPrice(`TSh${(getNumericPrice(item.price) * item.quantity).toFixed(0)}`)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.slug, item.selectedLength)}
                      className="text-[#ccc] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Cart totals */}
              <div
                className="ml-auto mt-8"
                style={{ maxWidth: 350, width: "100%" }}
              >
                <div
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: "12px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 16,
                  }}
                >
                  <span style={{ color: "#282828", fontWeight: 500 }}>Subtotal</span>
                  <span style={{ color: "#8B5E3C", fontWeight: 500 }}>
                    {formatPrice(`TSh${subtotal.toFixed(0)}`)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full uppercase transition-opacity hover:opacity-90 mt-6 flex items-center justify-center"
                  style={{
                    backgroundColor: "#8B5E3C",
                    color: "#fff",
                    padding: 14,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                  }}
                >
                  Proceed to Checkout
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full mt-3 text-center transition-colors hover:text-[#282828]"
                  style={{ fontSize: 13, color: "#999", cursor: "pointer", background: "none", border: "none" }}
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
