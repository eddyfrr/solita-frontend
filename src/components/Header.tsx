"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { LANGS, readCookieLang, applySiteLang } from "@/lib/language";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Products", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Gallery", href: "/gallery" },
  { name: "VIP", href: "/vip" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { totalItems } = useCart();
  const { currency, setCurrency, currencies } = useCurrency();
  const [activeLang, setActiveLang] = useState<"EN" | "SW">("EN");

  useEffect(() => {
    setActiveLang(readCookieLang());
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-[602]"
        style={{ backgroundColor: "#FAF0E8", borderBottom: "1px solid rgba(139,94,60,0.1)" }}
      >
        <div
          className="mx-auto flex max-w-[1340px] items-center justify-between px-[15px]"
          style={{ height: "90px" }}
        >
          {/* LEFT — Desktop: nav links / Mobile: hamburger */}
          <div className="flex flex-1 items-center">
            {/* Mobile hamburger */}
            <button
              className="text-[#8B5E3C] lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-[30px] lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[16px] font-normal text-[#8B5E3C] transition-colors duration-300 hover:opacity-70"
                  style={{ fontFamily: "var(--font-jost), Jost, sans-serif" }}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* CENTER — Logo */}
          <div className="flex shrink-0 justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/solita-logo.png"
                alt="Solita Beauty Bar"
                width={60}
                height={60}
                className="object-contain max-lg:h-[40px] max-lg:w-auto"
                style={{ width: "60px", height: "60px" }}
                priority
              />
              <div className="hidden sm:flex flex-col items-start">
                <span
                  className="text-[#8B5E3C] leading-tight"
                  style={{
                    fontFamily: "var(--font-playfair), Playfair Display, serif",
                    fontSize: "22px",
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  Solita
                </span>
                <span
                  className="text-[#8B5E3C] uppercase"
                  style={{
                    fontFamily: "var(--font-jost), Jost, sans-serif",
                    fontSize: "9px",
                    letterSpacing: "0.25em",
                    fontWeight: 400,
                  }}
                >
                  Beauty Bar
                </span>
              </div>
            </Link>
          </div>

          {/* RIGHT — Desktop: search + wishlist + cart / Mobile: currency + cart */}
          <div className="flex flex-1 items-center justify-end gap-5">
            {/* Currency + language — mobile only (desktop has the side-rails).
                Visible pill in the header so it's actually discoverable. */}
            <div className="relative lg:hidden">
              <button
                onClick={() => setPrefsOpen((v) => !v)}
                aria-label="Change currency or language"
                aria-expanded={prefsOpen}
                className="flex items-center gap-1 text-[#8B5E3C]"
                style={{
                  border: "1px solid rgba(139,94,60,0.35)",
                  borderRadius: 999,
                  padding: "5px 10px",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                }}
              >
                <span className="notranslate">{currency}</span>
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform"
                  style={{ transform: prefsOpen ? "rotate(180deg)" : "none" }}
                />
              </button>

              {prefsOpen && (
                <button
                  aria-label="Close"
                  tabIndex={-1}
                  onClick={() => setPrefsOpen(false)}
                  className="fixed inset-0 z-[602] cursor-default"
                  style={{ background: "transparent", border: "none" }}
                />
              )}

              {prefsOpen && (
                <div
                  className="absolute right-0 z-[603]"
                  style={{
                    top: "calc(100% + 10px)",
                    width: 230,
                    backgroundColor: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    padding: 14,
                    fontFamily: "var(--font-jost), Jost, sans-serif",
                  }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase text-[#8B5E3C]"
                    style={{ letterSpacing: "0.1em", marginBottom: 8 }}
                  >
                    Currency
                  </p>
                  <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 14 }}>
                    {currencies.map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrency(code);
                          setPrefsOpen(false);
                        }}
                        className="notranslate text-[12px] font-medium transition-colors"
                        style={{
                          backgroundColor: currency === code ? "#8B5E3C" : "#fff",
                          color: currency === code ? "#fff" : "#282828",
                          border: "1px solid #d9c7b8",
                          borderRadius: 6,
                          padding: "6px 10px",
                          minWidth: 48,
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>

                  <p
                    className="text-[11px] font-semibold uppercase text-[#8B5E3C]"
                    style={{ letterSpacing: "0.1em", marginBottom: 8 }}
                  >
                    Language
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          if (lang.code !== activeLang) applySiteLang(lang.googCode);
                        }}
                        className="notranslate text-[12px] font-medium transition-colors"
                        style={{
                          backgroundColor: activeLang === lang.code ? "#8B5E3C" : "#fff",
                          color: activeLang === lang.code ? "#fff" : "#282828",
                          border: "1px solid #d9c7b8",
                          borderRadius: 6,
                          padding: "6px 12px",
                        }}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search — desktop only */}
            <Link
              href="/search"
              className="hidden text-[#8B5E3C] transition-opacity duration-300 hover:opacity-70 lg:block"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            {/* Wishlist — desktop only */}
            <Link
              href="/wishlist"
              className="hidden text-[#8B5E3C] transition-opacity duration-300 hover:opacity-70 lg:block"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            {/* Cart — always visible */}
            <Link
              href="/cart"
              className="relative text-[#8B5E3C] transition-opacity duration-300 hover:opacity-70"
              aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B5E3C] text-[10px] leading-none text-white">
                {totalItems}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in drawer */}
          <div
            className="absolute top-0 left-0 h-full w-[300px] shadow-xl overflow-y-auto"
            style={{ backgroundColor: "#FAF0E8", fontFamily: "var(--font-jost), Jost, sans-serif" }}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-5" style={{ height: "90px" }}>
              <span className="text-[14px] font-medium text-[#282828] uppercase" style={{ letterSpacing: "0.1em" }}>
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#282828]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[16px] font-normal text-[#282828] transition-colors hover:text-[#8B5E3C]"
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile search, wishlist, login */}
            <div className="flex flex-col gap-0 border-t border-[#eee]">
              <Link
                href="/search"
                className="flex items-center gap-3 text-[14px] text-[#282828] hover:text-[#8B5E3C]"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: "14px 20px", borderBottom: "1px solid #eee" }}
              >
                <Search className="h-4 w-4" strokeWidth={1.5} />
                Search
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 text-[14px] text-[#282828] hover:text-[#8B5E3C]"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: "14px 20px", borderBottom: "1px solid #eee" }}
              >
                <Heart className="h-4 w-4" strokeWidth={1.5} />
                Wishlist
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
