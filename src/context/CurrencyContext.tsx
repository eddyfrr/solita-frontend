"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";

export type CurrencyCode = "USD" | "TZS" | "KES" | "GBP" | "EUR" | "NGN" | "ZAR";

const SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  TZS: "TSh",
  KES: "KSh",
  GBP: "£",
  EUR: "€",
  NGN: "₦",
  ZAR: "R",
};

// Initial rates — only used for display before live rates load.
// These are NEVER used for actual payment conversion (backend handles that with live rates).
const INITIAL_DISPLAY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  TZS: 2650,
  KES: 129,
  GBP: 0.79,
  EUR: 0.92,
  NGN: 1550,
  ZAR: 18.5,
};

const CURRENCY_LIST: CurrencyCode[] = ["TZS", "USD", "KES", "GBP", "EUR", "NGN", "ZAR"];

// Refresh rates every 2 minutes for accuracy
const REFRESH_INTERVAL = 2 * 60 * 1000;
// Cache for 2 minutes
const CACHE_TTL = 2 * 60 * 1000;
const CACHE_KEY = "solita-exchange-rates";
// Retry delay when fetch fails (starts at 5s, backs off)
const INITIAL_RETRY_DELAY = 5_000;
const MAX_RETRY_DELAY = 60_000;

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (price: string) => string;
  convertTZS: (tzsAmount: number) => { amount: number; currency: CurrencyCode };
  currencies: CurrencyCode[];
  ratesLoaded: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function extractAmount(price: string): number {
  const match = price.match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
}

function isUsdPrice(price: string): boolean {
  return price.includes("$");
}

type RatesMap = Record<CurrencyCode, number>;

async function fetchRates(): Promise<RatesMap | null> {
  // Try primary API
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.result === "success" && data.rates) {
        const newRates: RatesMap = { USD: 1 } as RatesMap;
        for (const code of CURRENCY_LIST) {
          if (code === "USD") continue;
          newRates[code] = data.rates[code] ?? INITIAL_DISPLAY_RATES[code];
        }
        return newRates;
      }
    }
  } catch {
    // primary failed — try secondary
  }

  // Try secondary API
  try {
    const targets = CURRENCY_LIST.filter((c) => c !== "USD").join(",");
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=USD&symbols=${targets}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.rates) {
        const newRates: RatesMap = { USD: 1 } as RatesMap;
        for (const code of CURRENCY_LIST) {
          if (code === "USD") continue;
          newRates[code] = data.rates[code] ?? INITIAL_DISPLAY_RATES[code];
        }
        return newRates;
      }
    }
  } catch {
    // secondary failed too
  }

  // Both APIs failed — try to use stale cache (better than nothing for display)
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rates } = JSON.parse(cached);
      if (rates) return rates; // stale but real rates from a previous successful fetch
    }
  } catch {
    // no cache at all
  }

  return null;
}

function getCachedRates(): RatesMap | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return rates;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveCachedRates(rates: RatesMap) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }));
  } catch {
    // storage full
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("TZS");
  const [rates, setRates] = useState<RatesMap>(INITIAL_DISPLAY_RATES);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);

  const loadRates = useCallback(async (isRetry = false) => {
    // Check short-lived cache first (skip on retry — we want fresh)
    if (!isRetry) {
      const cached = getCachedRates();
      if (cached) {
        setRates(cached);
        setRatesLoaded(true);
        retryDelayRef.current = INITIAL_RETRY_DELAY; // reset backoff
        return;
      }
    }

    // Fetch fresh rates
    const freshRates = await fetchRates();
    if (freshRates) {
      setRates(freshRates);
      setRatesLoaded(true);
      saveCachedRates(freshRates);
      retryDelayRef.current = INITIAL_RETRY_DELAY; // reset backoff on success
    } else {
      // All APIs failed — keep whatever rates we have (display stays smooth)
      // but schedule a retry with exponential backoff so we keep trying
      setRatesLoaded(true);
      const delay = retryDelayRef.current;
      retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);
      retryRef.current = setTimeout(() => loadRates(true), delay);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately on mount
    loadRates();

    // Auto-refresh every 2 minutes
    intervalRef.current = setInterval(() => {
      try { localStorage.removeItem(CACHE_KEY); } catch { /* */ }
      loadRates();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [loadRates]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
  }, []);

  // Convert TZS amount to the user's selected currency (numeric)
  // ClickPesa only supports TZS and USD, so unsupported currencies fall back to USD
  const convertTZS = useCallback(
    (tzsAmount: number): { amount: number; currency: CurrencyCode } => {
      if (currency === "TZS") {
        return { amount: tzsAmount, currency: "TZS" };
      }
      // All non-TZS currencies go to ClickPesa as USD
      const usdAmount = tzsAmount / rates["TZS"];
      return { amount: Math.round(usdAmount * 100) / 100, currency: "USD" };
    },
    [currency, rates]
  );

  const formatPrice = useCallback(
    (price: string): string => {
      const amount = extractAmount(price);
      const symbol = SYMBOLS[currency];

      let converted: number;
      if (isUsdPrice(price)) {
        // USD → target: multiply by target rate
        converted = amount * rates[currency];
      } else {
        // TZS → target: divide by TZS rate, then multiply by target rate
        const tzsRate = rates["TZS"];
        converted = (amount / tzsRate) * rates[currency];
      }

      if (converted >= 1000) {
        return `${symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
      return `${symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertTZS,
        currencies: CURRENCY_LIST,
        ratesLoaded,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
