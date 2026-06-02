import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Carousel } from "@/components/Carousel";
import { Price } from "@/components/Price";

export interface GridStyle {
  slug: string;
  name: string;
  description: string;
  price: string;
  vipPrice?: string;
  duration: string;
  imageUrl: string;
  images?: string[];
  options?: {
    lengths?: string[];
    colors?: string[];
    types?: string[];
  };
}

export function StylesGrid({
  styles,
  serviceSlug,
  tier,
}: {
  styles: GridStyle[];
  serviceSlug: string;
  tier?: "vip";
}) {
  const isVip = tier === "vip";
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {styles.map((style) => {
        const displayPrice = isVip && style.vipPrice ? style.vipPrice : style.price;
        const bookHref = isVip
          ? `/book/${serviceSlug}/${style.slug}?tier=vip`
          : `/book/${serviceSlug}/${style.slug}`;
        return (
          <div
            key={`${tier ?? "regular"}-${style.slug}`}
            className="group flex flex-col overflow-hidden"
            style={{
              borderRadius: 12,
              border: isVip ? "1px solid #d8c4ad" : "1px solid #eee",
              backgroundColor: "#fff",
              boxShadow: isVip ? "0 6px 24px rgba(139, 94, 60, 0.08)" : undefined,
              position: "relative",
            }}
          >
            {isVip && (
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  zIndex: 2,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#fff",
                  backgroundColor: "#8B5E3C",
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                VIP
              </span>
            )}
            <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
              {style.images && style.images.length > 0 ? (
                <Carousel
                  images={[
                    { src: style.imageUrl, alt: style.name },
                    ...style.images
                      .filter((src) => src !== style.imageUrl)
                      .map((src) => ({ src, alt: style.name })),
                  ]}
                  aspectRatio="3/4"
                />
              ) : (
                <Image
                  src={style.imageUrl}
                  alt={style.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <div className="flex items-start justify-between" style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 500, color: "#282828" }}>{style.name}</h3>
                <Price
                  value={displayPrice}
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#8B5E3C",
                    whiteSpace: "nowrap",
                    marginLeft: 12,
                  }}
                  prefix="From "
                />
              </div>
              <div
                className="flex items-center gap-1.5"
                style={{ fontSize: 13, color: "#999", marginBottom: 12 }}
              >
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                {style.duration}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#686868", marginBottom: 20 }}>
                {style.description}
              </p>
              {style.options && (
                <div style={{ marginBottom: 20 }}>
                  {style.options.lengths && (
                    <div style={{ marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#282828",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Lengths:
                      </span>
                      <span style={{ fontSize: 13, color: "#686868", marginLeft: 6 }}>
                        {style.options.lengths.join(", ")}
                      </span>
                    </div>
                  )}
                  {style.options.colors && (
                    <div style={{ marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#282828",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Colors:
                      </span>
                      <span style={{ fontSize: 13, color: "#686868", marginLeft: 6 }}>
                        {style.options.colors.join(", ")}
                      </span>
                    </div>
                  )}
                  {style.options.types && (
                    <div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#282828",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Types:
                      </span>
                      <span style={{ fontSize: 13, color: "#686868", marginLeft: 6 }}>
                        {style.options.types.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Link
                href={bookHref}
                className="flex w-full items-center justify-center uppercase transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#8B5E3C",
                  color: "#fff",
                  padding: "12px 20px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  borderRadius: 0,
                }}
              >
                {isVip ? "Book VIP" : "Book Now"}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
