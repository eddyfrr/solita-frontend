"use client";

import { useEffect, useState } from "react";

const LANGS = [
  { code: "EN", googCode: "en", label: "English" },
  { code: "SW", googCode: "sw", label: "Kiswahili" },
] as const;

type LangCode = (typeof LANGS)[number]["code"];

function readCookieLang(): LangCode {
  if (typeof document === "undefined") return "EN";
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!match) return "EN";
  const decoded = decodeURIComponent(match[1]);
  // Cookie format is "/<src>/<dst>" e.g. "/en/sw"
  const dst = decoded.split("/").pop();
  return dst === "sw" ? "SW" : "EN";
}

function writeCookieLang(googCode: string) {
  const value = `/en/${googCode}`;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `googtrans=${value}; path=/; expires=${expires}`;
  // Set on parent domain too so iframes the widget creates can read it.
  const host = window.location.hostname;
  if (host.includes(".") && host !== "localhost") {
    const parent = host.startsWith("www.") ? host.slice(4) : host;
    document.cookie = `googtrans=${value}; path=/; domain=.${parent}; expires=${expires}`;
  }
}

export function LanguageSelector() {
  const [active, setActive] = useState<LangCode>("EN");

  useEffect(() => {
    setActive(readCookieLang());
  }, []);

  const onPick = (lang: typeof LANGS[number]) => {
    if (lang.code === active) return;
    writeCookieLang(lang.googCode);
    // Google Translate reads the cookie on page load — reload to apply.
    window.location.reload();
  };

  return (
    <div
      className="fixed left-0 z-[2147483647] hidden lg:flex flex-col"
      style={{ top: "50%", transform: "translateY(-50%)" }}
    >
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onPick(lang)}
          title={lang.label}
          className="text-white text-[13px] font-medium cursor-pointer transition-all hover:opacity-80 notranslate"
          style={{
            backgroundColor: active === lang.code ? "#8B5E3C" : "#282828",
            padding: "10px 8px",
            width: 48,
            border: "none",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--font-jost), Jost, sans-serif",
          }}
        >
          {lang.code}
        </button>
      ))}
    </div>
  );
}
