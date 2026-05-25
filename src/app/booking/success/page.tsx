"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const type = params.get("type") || "booking";
  const id = params.get("id");

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#f0fdf4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <CheckCircle size={40} color="#22c55e" />
      </div>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: "#282828",
          marginBottom: 12,
          fontFamily: "var(--font-playfair), Playfair Display, serif",
        }}
      >
        Payment Successful!
      </h1>

      <p style={{ fontSize: 15, color: "#686868", lineHeight: 1.7, marginBottom: 8 }}>
        {type === "booking"
          ? "Your booking has been confirmed and payment received."
          : "Your order has been placed and payment received."}
      </p>

      {id && (
        <p style={{ fontSize: 13, color: "#999", marginBottom: 32 }}>
          {type === "booking" ? "Booking" : "Order"} #{id}
        </p>
      )}

      <p style={{ fontSize: 14, color: "#686868", marginBottom: 32 }}>
        A confirmation email has been sent to your email address.
      </p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link
          href="/services"
          style={{
            backgroundColor: "#8B5E3C",
            color: "#fff",
            padding: "12px 28px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Browse Services
        </Link>
        <Link
          href="/"
          style={{
            border: "1px solid #8B5E3C",
            color: "#8B5E3C",
            padding: "12px 28px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 120, paddingBottom: 80, backgroundColor: "#FDFAF6", minHeight: "60vh" }}>
        <Suspense>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
