"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { getProducts, deleteProduct } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  category: { name: string; slug: string } | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  in_stock: boolean;
  stock_quantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(slug);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: "#999" }}>
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
        <a
          href="/admin/products/new"
          className="flex items-center gap-2 uppercase transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#8B5E3C",
            color: "#fff",
            padding: "9px 20px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            borderRadius: 6,
          }}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </a>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          border: "1px solid #eee",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#ccc", fontSize: 14 }}>
            No products yet. Add your first product!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee", backgroundColor: "#fafafa" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Product</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Category</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Stock</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#686868", fontSize: 12 }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 500, color: "#686868", fontSize: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: "#f0f0f0" }} />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span style={{ fontWeight: 500, color: "#282828" }}>{p.name}</span>
                            {p.is_featured && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", color: "#686868" }}>
                      {p.category?.name || "—"}
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 500, color: "#282828" }}>
                      ${p.price}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ color: p.in_stock ? "#059669" : "#dc2626", fontSize: 13 }}>
                        {p.in_stock ? `${p.stock_quantity} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "3px 8px",
                          borderRadius: 4,
                          backgroundColor: p.is_active ? "#d1fae5" : "#fee2e2",
                          color: p.is_active ? "#065f46" : "#991b1b",
                        }}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/admin/products/${p.slug}`}
                          className="hover:bg-gray-50 transition-colors"
                          style={{ padding: 6, borderRadius: 4, display: "inline-flex" }}
                        >
                          <Pencil className="h-4 w-4 text-gray-400" />
                        </a>
                        <button
                          onClick={() => handleDelete(p.slug, p.name)}
                          className="hover:bg-red-50 transition-colors"
                          style={{ padding: 6, borderRadius: 4, border: "none", cursor: "pointer", background: "none" }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
