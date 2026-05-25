"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus, Crop } from "lucide-react";
import Link from "next/link";
import { createProduct, getCategories, uploadProductImage } from "@/lib/api";
import { useEffect } from "react";
import { ImageCropper } from "@/components/ImageCropper";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  // Carousel images
  const extraFileRef = useRef<HTMLInputElement>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [extraCropFile, setExtraCropFile] = useState<File | null>(null);
  const pendingExtras = useRef<File[]>([]);

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
    getCategories()
      .then((data) => setCategories(data.results || data))
      .catch(() => {});
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name") {
        updated.slug = (value as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      return updated;
    });
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCropFile(file);
    e.target.value = "";
  };

  const handleExtraFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      setExtraCropFile(files[0]);
      pendingExtras.current = files.slice(1);
    }
    e.target.value = "";
  };

  const handleExtraCropDone = (cropped: File, dataUrl: string) => {
    setExtraFiles((prev) => [...prev, cropped]);
    setExtraPreviews((prev) => [...prev, dataUrl]);
    const queue = pendingExtras.current;
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      pendingExtras.current = rest;
      setExtraCropFile(next);
    } else {
      setExtraCropFile(null);
    }
  };

  const handleExtraCropCancel = () => {
    pendingExtras.current = [];
    setExtraCropFile(null);
  };

  const removeExtraImage = (index: number) => {
    setExtraFiles((prev) => prev.filter((_, i) => i !== index));
    setExtraPreviews((prev) => prev.filter((_, i) => i !== index));
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

      const created = await createProduct(formData);
      if (extraFiles.length > 0 && created?.slug) {
        await Promise.all(
          extraFiles.map((f, idx) => {
            const fd = new FormData();
            fd.append("image", f);
            fd.append("sort_order", String(idx + 1));
            return uploadProductImage(created.slug, fd).catch(() => null);
          }),
        );
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
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
          Add New Product
        </h2>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Cover Image — opens crop+zoom modal after pick */}
          <div>
            <label style={labelStyle}>Cover Image (4:3)</label>
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
                    onClick={(e) => { e.stopPropagation(); setCropFile(selectedFile); }}
                    className="absolute top-2 left-2 flex items-center gap-1"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      color: "#5C3D28",
                      border: "none",
                      borderRadius: 999,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Crop className="h-3 w-3" /> Re-crop
                  </button>
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
                  <p style={{ fontSize: 13, color: "#999" }}>Click to upload — you&apos;ll crop &amp; zoom next</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelected} style={{ display: "none" }} />
          </div>

          {/* Additional Images — Instagram-style carousel */}
          <div>
            <label style={labelStyle}>Additional Images (carousel)</label>
            <div className="grid grid-cols-3 gap-2">
              {extraPreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "4/3", borderRadius: 6, border: "1px solid #eee" }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExtraImage(i)}
                    className="absolute top-1 right-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", padding: 3, cursor: "pointer" }}
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => extraFileRef.current?.click()}
                className="flex items-center justify-center transition-colors hover:bg-gray-50"
                style={{
                  aspectRatio: "4/3",
                  border: "2px dashed #ddd",
                  borderRadius: 6,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <div className="text-center">
                  <Plus className="h-5 w-5 text-gray-400 mx-auto" />
                  <p style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Add image</p>
                </div>
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
              Each image is cropped to 4:3 before upload. Pick multiple at once and crop them in turn.
            </p>
            <input
              ref={extraFileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleExtraFilesSelected}
              style={{ display: "none" }}
            />
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
            {saving ? "Saving..." : "Create Product"}
          </button>
        </form>
      </div>

      {cropFile && (
        <ImageCropper
          file={cropFile}
          aspectRatio={4 / 3}
          onCancel={() => setCropFile(null)}
          onCropComplete={(cropped, dataUrl) => {
            setSelectedFile(cropped);
            setPreview(dataUrl);
            setCropFile(null);
          }}
        />
      )}
      {extraCropFile && (
        <ImageCropper
          file={extraCropFile}
          aspectRatio={4 / 3}
          onCancel={handleExtraCropCancel}
          onCropComplete={handleExtraCropDone}
        />
      )}
    </div>
  );
}
