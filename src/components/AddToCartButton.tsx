"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  slug: string;
  title: string;
  price: string;
  imageUrl: string;
  isOutOfStock?: boolean;
  lengthOptions?: string[];
}

export function AddToCartButton({
  slug,
  title,
  price,
  imageUrl,
  isOutOfStock,
  lengthOptions,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [selectedLength, setSelectedLength] = useState("");
  const [added, setAdded] = useState(false);

  const hasLengths = lengthOptions && lengthOptions.length > 0;
  const canAdd = !isOutOfStock && (!hasLengths || selectedLength !== "");

  const handleAddToCart = () => {
    if (!canAdd) return;
    addToCart({
      slug,
      title,
      price,
      imageUrl,
      selectedLength: selectedLength || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {/* Length Selector */}
      {hasLengths && (
        <div style={{ marginBottom: 24 }}>
          <label
            htmlFor="length-select"
            className="block"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#282828",
              marginBottom: 8,
            }}
          >
            Length
          </label>
          <select
            id="length-select"
            className="w-full"
            style={{
              fontSize: 14,
              padding: "10px 12px",
              border: "1px solid #ddd",
              color: "#282828",
              backgroundColor: "#fff",
              outline: "none",
            }}
            value={selectedLength}
            onChange={(e) => setSelectedLength(e.target.value)}
          >
            <option value="" disabled>
              Choose an option
            </option>
            {lengthOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add to Cart / Out of Stock */}
      {isOutOfStock ? (
        <button
          type="button"
          disabled
          className="w-full uppercase"
          style={{
            backgroundColor: "#ccc",
            color: "#666",
            padding: 14,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.2em",
            cursor: "not-allowed",
            border: "none",
          }}
        >
          Out of Stock
        </button>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="w-full uppercase transition-opacity hover:opacity-90"
          style={{
            backgroundColor: added ? "#8B5E3C" : "#282828",
            color: "#fff",
            padding: 14,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.2em",
            border: "none",
            cursor: canAdd ? "pointer" : "not-allowed",
            opacity: canAdd ? 1 : 0.6,
          }}
        >
          {added ? "✓ Added to Cart" : hasLengths && !selectedLength ? "Select a Length" : "Add to Cart"}
        </button>
      )}
    </>
  );
}
