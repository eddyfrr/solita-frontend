"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ArrowLeft, Check } from "lucide-react";

type Step = "details" | "payment" | "confirmed";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { formatPrice, convertTZS, currency } = useCurrency();
  const [step, setStep] = useState<Step>("details");

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getNumericPrice = (price: string): number => {
    const match = price.match(/[\d,.]+/);
    return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + getNumericPrice(item.price) * item.quantity,
    0
  );
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const canProceed = fullName.trim() && email.trim() && phone.trim() && address.trim() && city.trim();

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api`;

      const orderData = {
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        shipping_address: `${address}, ${city}`,
        notes,
        payment_method: paymentMethod,
        subtotal: subtotal.toFixed(2),
        shipping_cost: shipping.toFixed(2),
        total: total.toFixed(2),
        items: items.map((item) => ({
          product_slug: item.slug,
          quantity: item.quantity,
          price: getNumericPrice(item.price).toFixed(2),
        })),
      };

      // Create the order
      const orderRes = await fetch(`${API_BASE}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create order. Please try again.");
      }

      const order = await orderRes.json();

      // Initiate ClickPesa payment
      const paymentRes = await fetch(`${API_BASE}/payments/initiate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          id: order.id,
          ...convertTZS(total),
        }),
      });

      if (!paymentRes.ok) {
        throw new Error("Failed to initiate payment. Please try again.");
      }

      const paymentData = await paymentRes.json();

      if (paymentData.checkout_url) {
        // Redirect to ClickPesa checkout portal
        clearCart();
        window.location.href = paymentData.checkout_url;
      } else {
        throw new Error(paymentData.error || "Could not generate payment link.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Empty cart redirect
  if (items.length === 0 && step !== "confirmed") {
    return (
      <>
        <Header />
        <main
          className="flex-1 flex items-center justify-center"
          style={{ paddingTop: 150, paddingBottom: 80, fontFamily: "var(--font-jost), Jost, sans-serif", backgroundColor: "#FDFAF6" }}
        >
          <div className="text-center">
            <p style={{ fontSize: 16, color: "#686868", marginBottom: 20 }}>Your cart is empty</p>
            <Link href="/shop" className="text-[#8B5E3C] hover:underline" style={{ fontSize: 14 }}>
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{
          backgroundColor: "#FAF0E8",
          paddingTop: 120,
          paddingBottom: 80,
          fontFamily: "var(--font-jost), Jost, sans-serif",
        }}
      >
        <div className="mx-auto max-w-[1000px] px-4">
          {/* Confirmed */}
          {step === "confirmed" ? (
            <div
              className="text-center"
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: "60px 32px",
                border: "1px solid #eee",
              }}
            >
              <div
                className="mx-auto flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#e8f5e9",
                  marginBottom: 24,
                }}
              >
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 500, color: "#5C3D28", marginBottom: 12, fontFamily: "var(--font-playfair), Playfair Display, serif" }}>
                Order Placed!
              </h1>
              <p style={{ fontSize: 15, color: "#686868", lineHeight: 1.7, maxWidth: 450, margin: "0 auto 8px" }}>
                Thank you for your order. We&apos;ll send a confirmation to <strong>{email}</strong> with your order details.
              </p>
              <p style={{ fontSize: 13, color: "#999", marginBottom: 32 }}>
                You&apos;ll receive tracking information once your order ships.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center uppercase transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "#8B5E3C",
                    color: "#fff",
                    padding: "12px 32px",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                  }}
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center uppercase transition-colors hover:text-[#8B5E3C]"
                  style={{
                    border: "1px solid #ddd",
                    color: "#282828",
                    padding: "12px 32px",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                  }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 transition-colors hover:text-[#8B5E3C]"
                style={{ fontSize: 14, color: "#686868", marginBottom: 24, display: "inline-flex" }}
              >
                <ArrowLeft className="h-4 w-4" /> Back to Cart
              </Link>

              <h1 style={{ fontSize: 32, fontWeight: 400, color: "#5C3D28", marginBottom: 28, fontFamily: "var(--font-playfair), Playfair Display, serif" }}>
                Checkout
              </h1>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left — Form */}
                <div className="flex-1">
                  {step === "details" && (
                    <div
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        padding: 28,
                        border: "1px solid #eee",
                      }}
                    >
                      <h2 style={{ fontSize: 18, fontWeight: 500, color: "#282828", marginBottom: 20 }}>
                        Shipping Details
                      </h2>

                      <div className="flex flex-col gap-4">
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            style={{ width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid #ddd", borderRadius: 6, outline: "none", fontFamily: "inherit" }}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                              Email *
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              style={{ width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid #ddd", borderRadius: 6, outline: "none", fontFamily: "inherit" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                              Phone *
                            </label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+255 7XX XXX XXX"
                              style={{ width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid #ddd", borderRadius: 6, outline: "none", fontFamily: "inherit" }}
                            />
                            <p style={{ fontSize: 12, color: "#B8860B", marginTop: 6 }}>
                              Please enter a valid phone number with country code (e.g. +255 745 636 924) to ensure payment works correctly.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                            Shipping Address *
                          </label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Street address"
                            style={{ width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid #ddd", borderRadius: 6, outline: "none", fontFamily: "inherit" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                            City *
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Dar es Salaam"
                            style={{ width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid #ddd", borderRadius: 6, outline: "none", fontFamily: "inherit" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
                            Order Notes (optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Any special instructions..."
                            style={{ width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid #ddd", borderRadius: 6, outline: "none", fontFamily: "inherit", resize: "vertical" }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setStep("payment")}
                        disabled={!canProceed}
                        className="w-full uppercase transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed mt-6"
                        style={{
                          backgroundColor: "#8B5E3C",
                          color: "#fff",
                          padding: 14,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.2em",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: 6,
                        }}
                      >
                        Continue to Payment
                      </button>
                    </div>
                  )}

                  {step === "payment" && (
                    <div
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        padding: 28,
                        border: "1px solid #eee",
                      }}
                    >
                      <h2 style={{ fontSize: 18, fontWeight: 500, color: "#282828", marginBottom: 20 }}>
                        Payment Method
                      </h2>

                      <div className="flex flex-col gap-3" style={{ marginBottom: 24 }}>
                        {[
                          { key: "mpesa" as const, label: "M-Pesa / Mobile Money", desc: "Pay via mobile money" },
                          { key: "card" as const, label: "Card Payment", desc: "Debit or credit card" },
                        ].map((method) => (
                          <button
                            key={method.key}
                            onClick={() => setPaymentMethod(method.key)}
                            className="flex items-center gap-4 text-left"
                            style={{
                              padding: "16px 20px",
                              border: paymentMethod === method.key ? "2px solid #8B5E3C" : "1px solid #ddd",
                              borderRadius: 8,
                              backgroundColor: paymentMethod === method.key ? "#FDF5ED" : "#fff",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                border: paymentMethod === method.key ? "6px solid #8B5E3C" : "2px solid #ccc",
                                transition: "all 0.2s",
                              }}
                            />
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 500, color: "#282828" }}>{method.label}</div>
                              <div style={{ fontSize: 13, color: "#999" }}>{method.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {error && (
                        <div
                          style={{
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            fontSize: 13,
                            padding: "10px 14px",
                            borderRadius: 6,
                            marginBottom: 16,
                          }}
                        >
                          {error}
                        </div>
                      )}

                      <div className="flex items-center justify-between" style={{ paddingTop: 16, borderTop: "1px solid #eee" }}>
                        <button
                          onClick={() => setStep("details")}
                          disabled={loading}
                          className="uppercase transition-colors hover:text-[#8B5E3C]"
                          style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "#686868", background: "none", border: "none", cursor: "pointer" }}
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePlaceOrder}
                          disabled={loading}
                          className="uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{
                            backgroundColor: "#8B5E3C",
                            color: "#fff",
                            padding: "14px 40px",
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.2em",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: 6,
                          }}
                        >
                          {loading ? "Processing..." : `Place Order — ${formatPrice(`TSh${total.toFixed(0)}`)}`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right — Order Summary */}
                <div style={{ width: "100%", maxWidth: 340 }}>
                  <div
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 24,
                      border: "1px solid #eee",
                      position: "sticky",
                      top: 80,
                    }}
                  >
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#282828", marginBottom: 16 }}>
                      Order Summary
                    </h3>

                    <div className="flex flex-col gap-3" style={{ marginBottom: 16 }}>
                      {items.map((item) => (
                        <div key={`${item.slug}-${item.selectedLength}`} className="flex gap-3">
                          <div className="relative shrink-0" style={{ width: 48, height: 60, borderRadius: 6, overflow: "hidden" }}>
                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 13, color: "#282828", fontWeight: 500 }} className="truncate">
                              {item.title}
                            </p>
                            {item.selectedLength && (
                              <p style={{ fontSize: 11, color: "#999" }}>{item.selectedLength}</p>
                            )}
                            <p style={{ fontSize: 12, color: "#686868" }}>
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                      <div className="flex justify-between" style={{ fontSize: 14, marginBottom: 8 }}>
                        <span style={{ color: "#686868" }}>Subtotal</span>
                        <span style={{ color: "#282828" }}>{formatPrice(`TSh${subtotal.toFixed(0)}`)}</span>
                      </div>
                      <div className="flex justify-between" style={{ fontSize: 14, marginBottom: 8 }}>
                        <span style={{ color: "#686868" }}>Shipping</span>
                        <span style={{ color: "#282828" }}>{shipping === 0 ? "Free" : formatPrice(`TSh${shipping.toFixed(0)}`)}</span>
                      </div>
                      <div
                        className="flex justify-between"
                        style={{ fontSize: 16, fontWeight: 600, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}
                      >
                        <span style={{ color: "#282828" }}>Total</span>
                        <span style={{ color: "#8B5E3C" }}>{formatPrice(`TSh${total.toFixed(0)}`)}</span>
                      </div>
                      {currency !== "TZS" && (
                        <p style={{ fontSize: 12, color: "#B8860B", marginTop: 10, lineHeight: 1.5 }}>
                          You will be charged in <strong>{currency === "USD" ? "USD" : "USD (converted)"}</strong> via ClickPesa. The {currency} amount shown is an estimate based on current exchange rates.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
