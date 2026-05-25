"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { getProduct, updateProduct, getCategories } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compare_at_price: "",
    category: "",
    is_active: true,
    is_featured: false,
    in_stock: true,
    stock_quantity: "0",
  });

  useEffect(() => {
    Promise.all([
      getProduct(slug).catch(() => null),
      getCategories().then((data) => data.results || data).catch(() => []),
    ]).then(([product, cats]) => {
      setCategories(cats);
      if (product) {
        setForm({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          price: product.price || "",
          compare_at_price: product.compare_at_price || "",
          category: product.category?.id ? String(product.category.id) : "",
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
          in_stock: product.in_stock ?? true,
          stock_quantity: String(product.stock_quantity ?? 0),
        });
        if (product.image_url) {
          setPreview(product.image_url);
        }
      } else {
        setError("Product not found");
      }
      setLoading(false);
    });
  }, [slug]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("price", form.price);
      if (form.compare_at_price) formData.append("compare_at_price", form.compare_at_price);
      if (form.category) formData.append("category", form.category);
      formData.append("is_active", String(form.is_active));
      formData.append("is_featured", String(form.is_featured));
      formData.append("in_stock", String(form.in_stock));
      formData.append("stock_quantity", form.stock_quantity);
      if (selectedFile) formData.append("image", selectedFile);

      await updateProduct(slug, formData);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 6,
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 500 as const,
    color: "#282828",
    display: "block" as const,
    marginBottom: 6,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[700px]" style={{ padding: 40, textAlign: "center", color: "#999" }}>
        Loading product...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[700px]">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 transition-colors hover:text-[#8B5E3C]"
        style={{ fontSize: 14, color: "#686868", marginBottom: 20, display: "inline-flex" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          border: "1px solid #eee",
          padding: 32,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 500, color: "#282828", marginBottom: 24 }}>
          Edit Product
        </h2>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Image */}
          <div>
            <label style={labelStyle}>Product Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              style={{
                border: "2px dashed #ddd",
                borderRadius: 8,
                padding: preview ? 0 : "24px 20px",
                overflow: "hidden",
                aspectRatio: preview ? "4/3" : undefined,
                position: "relative",
              }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      border: "none",
                      borderRadius: "50%",
                      padding: 4,
                      cursor: "pointer",
                    }}
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 text-gray-300 mx-auto" style={{ marginBottom: 6 }} />
                  <p style={{ fontSize: 13, color: "#999" }}>Click to upload new image</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelected} style={{ display: "none" }} />
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Name *</label>
            <input type="text" required value={form.name} onChange={(e) => handleChange("name", e.target.value)} style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => handleChange("description", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {/* Price & Compare */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Price (TSh) *</label>
              <input type="number" step="1" required value={form.price} onChange={(e) => handleChange("price", e.target.value)} style={inputStyle} placeholder="e.g. 45000" />
            </div>
            <div>
              <label style={labelStyle}>Compare at Price (TSh)</label>
              <input type="number" step="1" value={form.compare_at_price} onChange={(e) => handleChange("compare_at_price", e.target.value)} style={inputStyle} placeholder="Original price in TSh" />
            </div>
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={(e) => handleChange("category", e.target.value)} style={inputStyle}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stock Quantity</label>
              <input type="number" value={form.stock_quantity} onChange={(e) => handleChange("stock_quantity", e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            {[
              { key: "is_active", label: "Active" },
              { key: "is_featured", label: "Featured" },
              { key: "in_stock", label: "In Stock" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  style={{ accentColor: "#8B5E3C", width: 16, height: 16 }}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "#8B5E3C",
              color: "#fff",
              padding: "13px 20px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            {saving ? "Saving..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
