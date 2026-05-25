"use client";

import { useCurrency } from "@/context/CurrencyContext";

export function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <div
      className="fixed right-0 z-[2147483647] hidden lg:flex flex-col"
      style={{ top: "50%", transform: "translateY(-50%)" }}
    >
      {currencies.map((code) => (
        <button
          key={code}
          onClick={() => setCurrency(code)}
          className="text-white text-[13px] font-medium cursor-pointer transition-all hover:opacity-80"
          style={{
            backgroundColor: currency === code ? "#8B5E3C" : "#282828",
            padding: "10px 8px",
            width: "48px",
            border: "none",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--font-jost), Jost, sans-serif",
          }}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
