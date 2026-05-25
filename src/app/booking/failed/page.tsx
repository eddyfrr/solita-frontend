"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { XCircle } from "lucide-react";

function FailedContent() {
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
          background: "#fef2f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <XCircle size={40} color="#ef4444" />
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
        Payment Failed
      </h1>

      <p style={{ fontSize: 15, color: "#686868", lineHeight: 1.7, marginBottom: 32 }}>
        {type === "booking"
          ? "Your booking has been saved but the payment was not completed. Please try again or contact us for assistance."
          : "Your order was not completed. Please try again or contact us for assistance."}
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
          Try Again
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

export default function PaymentFailedPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 120, paddingBottom: 80, backgroundColor: "#FDFAF6", minHeight: "60vh" }}>
        <Suspense>
          <FailedContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
