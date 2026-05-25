import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CurrencySelector } from "@/components/CurrencySelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solita Beauty Bar",
  description: "Luxury beauty salon — hair, braids, lashes & more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <CurrencyProvider>
          <CartProvider>
            {children}
            <CurrencySelector />
            <LanguageSelector />
            <GoogleTranslate />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
