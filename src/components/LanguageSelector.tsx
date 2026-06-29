"use client";

import { useEffect, useState } from "react";
import { LANGS, type LangCode, readCookieLang, applySiteLang } from "@/lib/language";

export function LanguageSelector() {
  const [active, setActive] = useState<LangCode>("EN");

  useEffect(() => {
    setActive(readCookieLang());
  }, []);

  const onPick = (lang: typeof LANGS[number]) => {
    if (lang.code === active) return;
    applySiteLang(lang.googCode);
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
