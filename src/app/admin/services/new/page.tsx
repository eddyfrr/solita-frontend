"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { createService, getServices } from "@/lib/api";
import { useEffect } from "react";

interface ExistingService {
  name: string;
  slug: string;
  style_count: number;
  is_active: boolean;
}

export default function NewServicePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingServices, setExistingServices] = useState<ExistingService[]>([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
    sort_order: "0",
  });

  useEffect(() => {
    getServices()
      .then((data) => setExistingServices(data.results || data))
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
      formData.append("is_active", String(form.is_active));
      formData.append("sort_order", form.sort_order);
      if (selectedFile) formData.append("image", selectedFile);

      await createService(formData);
      router.push("/admin/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create service");
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
        href="/admin/services"
        className="inline-flex items-center gap-2 transition-colors hover:text-[#8B5E3C]"
        style={{ fontSize: 14, color: "#686868", marginBottom: 20, display: "inline-flex" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Services
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
          Add New Service
        </h2>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Existing services reference */}
          <div
            style={{
              backgroundColor: "#FDF8F3",
              border: "1px solid #E8D5C4",
              borderRadius: 8,
              padding: "14px 18px",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: "#5C3D28", marginBottom: 8 }}>
              {existingServices.length > 0 ? "Existing service types:" : "Service types you can add:"}
            </p>
            {existingServices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {existingServices.map((s) => (
                  <span
                    key={s.slug}
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 4,
                      backgroundColor: s.is_active ? "#fff" : "#f5f5f5",
                      border: "1px solid #ddd",
                      color: s.is_active ? "#282828" : "#999",
                    }}
                  >
                    {s.name}
                    <span style={{ color: "#999", marginLeft: 4 }}>
                      ({s.style_count} style{s.style_count !== 1 ? "s" : ""})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {["Braiding", "Wigs", "Lashes", "Styling", "Nails", "Makeup"].map((name) => (
                  <span
                    key={name}
                    onClick={() => {
                      handleChange("name", name);
                    }}
                    className="cursor-pointer hover:bg-[#f0e0d0] transition-colors"
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 4,
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      color: "#282828",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
            <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
              {existingServices.length > 0
                ? "Make sure you\u2019re not duplicating an existing service type."
                : "Click a suggestion to auto-fill, or type your own below."}
            </p>
          </div>

          {/* Image */}
          <div>
            <label style={labelStyle}>Service Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              style={{
                border: "2px dashed #ddd",
                borderRadius: 8,
                padding: preview ? 0 : "24px 20px",
                overflow: "hidden",
                aspectRatio: preview ? "16/9" : undefined,
                position: "relative",
              }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setSelectedFile(null); }}
                    className="absolute top-2 right-2"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", padding: 4, cursor: "pointer" }}
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 text-gray-300 mx-auto" style={{ marginBottom: 6 }} />
                  <p style={{ fontSize: 13, color: "#999" }}>Click to upload image</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelected} style={{ display: "none" }} />
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Service Name *</label>
            <input type="text" required value={form.name} onChange={(e) => handleChange("name", e.target.value)} style={inputStyle} placeholder="e.g. Braiding" />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => handleChange("description", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Describe this service..." />
          </div>

          {/* Sort & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => handleChange("sort_order", e.target.value)} style={inputStyle} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 14, paddingBottom: 10 }}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => handleChange("is_active", e.target.checked)} style={{ accentColor: "#8B5E3C", width: 16, height: 16 }} />
                Active
              </label>
            </div>
          </div>

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
            {saving ? "Saving..." : "Create Service"}
          </button>
        </form>
      </div>
    </div>
  );
}
