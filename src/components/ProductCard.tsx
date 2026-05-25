import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/Price";

interface ProductCardProps {
  title: string;
  price: string;
  imageUrl: string;
  productUrl: string;
  isOutOfStock?: boolean;
}

export function ProductCard({
  title,
  price,
  imageUrl,
  productUrl,
  isOutOfStock,
}: ProductCardProps) {
  return (
    <div className="group flex flex-col" style={{ padding: "5px 15px 0" }}>
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50" style={{ borderRadius: 10 }}>
        <Link href={productUrl}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {isOutOfStock && (
          <div
            className="absolute text-[12px]"
            style={{
              top: "10px",
              left: "10px",
              color: "rgb(88, 88, 88)",
              backgroundColor: "rgb(255, 255, 255)",
              padding: "1px 8px",
            }}
          >
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="pt-3 text-left">
        <h3
          className="font-normal leading-snug mb-1"
          style={{
            fontSize: "16px",
            color: "rgb(40, 40, 40)",
            fontFamily: "var(--font-jost), Jost, sans-serif",
          }}
        >
          <Link href={productUrl} className="hover:text-[#8B5E3C] transition-colors">
            {title}
          </Link>
        </h3>
        <Price
          value={price}
          className="font-normal"
          style={{
            fontSize: "16px",
            color: "rgb(119, 119, 119)",
            fontFamily: "var(--font-jost), Jost, sans-serif",
          }}
        />
      </div>
    </div>
  );
}
