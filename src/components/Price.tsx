"use client";

import { useCurrency } from "@/context/CurrencyContext";

export function Price({ value, className, style, prefix }: { value: string; className?: string; style?: React.CSSProperties; prefix?: string }) {
  const { formatPrice } = useCurrency();
  return <span className={className} style={style}>{prefix}{formatPrice(value)}</span>;
}
