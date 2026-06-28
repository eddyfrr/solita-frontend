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

const SITE_URL = "https://solitabeautybar.me";
const DESCRIPTION =
  "Solita Beauty Bar is a luxury beauty salon in Dar es Salaam, Tanzania — specialising in premium braids, wigs, lashes, makeup, nails and styling. Book your appointment online.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Solita Beauty Bar | Luxury Hair, Braids & Beauty Salon in Dar es Salaam",
    template: "%s | Solita Beauty Bar",
  },
  description: DESCRIPTION,
  applicationName: "Solita Beauty Bar",
  keywords: [
    "Solita Beauty Bar",
    "beauty salon Dar es Salaam",
    "hair salon Tanzania",
    "braids Dar es Salaam",
    "Spanish braids",
    "wigs Tanzania",
    "lashes",
    "makeup artist Dar es Salaam",
    "nails",
  ],
  authors: [{ name: "Solita Beauty Bar" }],
  creator: "Solita Beauty Bar",
  publisher: "Solita Beauty Bar",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Solita Beauty Bar",
    title: "Solita Beauty Bar | Luxury Hair, Braids & Beauty Salon",
    description: DESCRIPTION,
    images: [{ url: "/images/hero-banner.jpg", alt: "Solita Beauty Bar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solita Beauty Bar | Luxury Hair, Braids & Beauty Salon",
    description: DESCRIPTION,
    images: ["/images/hero-banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/images/solita-logo.png",
    apple: "/images/solita-logo.png",
  },
};

// Structured data — helps Google show a rich business result / knowledge panel
// for "Solita Beauty Bar" searches.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Solita Beauty Bar",
  description: DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/images/hero-banner.jpg`,
  logo: `${SITE_URL}/images/solita-logo.png`,
  email: "hello@solitabeautybar.com",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dar es Salaam",
    addressCountry: "TZ",
  },
  areaServed: "Dar es Salaam, Tanzania",
  sameAs: [
    "https://facebook.com/solitabeautybar",
    "https://www.instagram.com/solita_beautybar/",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
