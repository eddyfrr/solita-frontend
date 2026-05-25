"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Upload, X, Plus, Clock, Banknote, Tag, Crop,
} from "lucide-react";
import Link from "next/link";
import {
  getServiceStyle, updateServiceStyle, uploadServiceStyleImage,
  deleteServiceStyleImage,
} from "@/lib/api";
import { ImageCropper } from "@/components/ImageCropper";

interface ExistingImage {
  id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export default function EditStylePage() {
  const router = useRouter();
  const { slug: serviceSlug, styleSlug } = useParams<{
    slug: string;
    styleSlug: string;
  }>();

  const fileRef = useRef<HTMLInputElement>(null);
  const extraFileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cover image
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  // Carousel images — both existing (server-side) and pending (newly cropped, not yet uploaded)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [extraCropFile, setExtraCropFile] = useState<File | null>(null);
  const pendingExtras = useRef<File[]>([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price_from: "",
    vip_price: "",
    duration: "",
    is_active: true,
    sort_order: "0",
  });

  const [lengths, setLengths] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [lengthInput, setLengthInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [typeInput, setTypeInput] = useState("");

  // Load existing style
  useEffect(() => {
    getServiceStyle(serviceSlug, styleSlug)
      .then((s) => {
        setForm({
          name: s.name || "",
          slug: s.slug || "",
          description: s.description || "",
          price_from: s.price_from != null ? String(s.price_from) : "",
          vip_price: s.vip_price != null ? String(s.vip_price) : "",
          duration: s.duration || "",
          is_active: s.is_active ?? true,
          sort_order: String(s.sort_order ?? 0),
        });
        setLengths(s.lengths || []);
        setColors(s.colors || []);
        setTypes(s.types || []);
        if (s.image_url) setPreview(s.image_url);
        setExistingImages(s.images || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load style"))
      .finally(() => setLoading(false));
  }, [serviceSlug, styleSlug]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  const removePendingExtra = (index: number) => {
    setExtraFiles((prev) => prev.filter((_, i) => i !== index));
    setExtraPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (id: number) => {
    if (!confirm("Delete this image from the carousel?")) return;
    try {
      await deleteServiceStyleImage(serviceSlug, styleSlug, id);
      setExistingImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  const addTag = useCallback(
    (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
      const trimmed = input.trim();
      if (trimmed && !list.includes(trimmed)) setList([...list, trimmed]);
      setInput("");
    },
    [],
  );

  const removeTag = (list: string[], setList: (v: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    list: string[],
    setList: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(list, setList, input, setInput);
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
      formData.append("price_from", form.price_from);
      formData.append("vip_price", form.vip_price || "");
      formData.append("duration", form.duration);
      formData.append("is_active", String(form.is_active));
      formData.append("sort_order", form.sort_order);
      formData.append("lengths", JSON.stringify(lengths));
      formData.append("colors", JSON.stringify(colors));
      formData.append("types", JSON.stringify(types));
      if (selectedFile) formData.append("image", selectedFile);

      const updated = await updateServiceStyle(serviceSlug, styleSlug, formData);

      // Upload any newly cropped carousel images
      if (extraFiles.length > 0) {
        const targetSlug = updated?.slug || styleSlug;
        await Promise.all(
          extraFiles.map((f, idx) => {
            const fd = new FormData();
            fd.append("image", f);
            fd.append("sort_order", String(existingImages.length + idx + 1));
            return uploadServiceStyleImage(serviceSlug, targetSlug, fd).catch(() => null);
          }),
        );
      }

      router.push("/admin/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  const lengthSuggestions = ["Waist Length", "Mid-Back", "Hip Length", "Knee Length", "Shoulder Length", "Bra Strap"];
  const colorSuggestions = ["Black", "Brown", "Blonde", "Burgundy", "Ombre", "Honey", "Red", "Auburn"];
  const typeSuggestions = ["Small", "Medium", "Large", "Jumbo", "Micro", "Knotless"];

  const TagInput = ({
    label, icon, tags, setTags, input, setInput, suggestions, placeholder,
  }: {
    label: string;
    icon: React.ReactNode;
    tags: string[];
    setTags: (v: string[]) => void;
    input: string;
    setInput: (v: string) => void;
    suggestions: string[];
    placeholder: string;
  }) => (
    <div>
      <label style={labelStyle} className="flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div
        className="flex flex-wrap items-center gap-1.5"
        style={{
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: "6px 10px",
          minHeight: 42,
        }}
      >
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="flex items-center gap-1"
            style={{
              backgroundColor: "#FDF5ED",
              border: "1px solid #E8D5C4",
              borderRadius: 4,
              padding: "3px 8px",
              fontSize: 12,
              color: "#5C3D28",
              fontWeight: 500,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tags, setTags, i)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}
            >
              <X className="h-3 w-3 text-[#8B5E3C]" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, tags, setTags, input, setInput)}
          onBlur={() => { if (input.trim()) addTag(tags, setTags, input, setInput); }}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[80px]"
          style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", padding: "2px 0" }}
        />
      </div>
      <div className="flex flex-wrap gap-1 mt-1.5">
        {suggestions
          .filter((s) => !tags.includes(s))
          .slice(0, 6)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { if (!tags.includes(s)) setTags([...tags, s]); }}
              className="transition-colors hover:bg-[#f0e0d0]"
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 3,
                border: "1px solid #e8e8e8",
                backgroundColor: "#fafafa",
                color: "#888",
                cursor: "pointer",
              }}
            >
              + {s}
            </button>
          ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-[700px]" style={{ padding: 40, textAlign: "center", color: "#999" }}>
        Loading style...
      </div>
    );
  }

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
        <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: "#282828" }}>Edit Style</h2>
          {form.vip_price && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                padding: "3px 10px",
                borderRadius: 999,
                backgroundColor: "#8B5E3C",
                color: "#fff",
              }}
            >
              VIP
            </span>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Cover image */}
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
                  {selectedFile && (
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
                  )}
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
                  <p style={{ fontSize: 13, color: "#999" }}>Click to replace cover image</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelected} style={{ display: "none" }} />
          </div>

          {/* Carousel images */}
          <div>
            <label style={labelStyle}>Carousel Images</label>
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "4/3", borderRadius: 6, border: "1px solid #eee" }}
                >
                  <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-1 right-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.65)", border: "none", borderRadius: "50%", padding: 3, cursor: "pointer" }}
                    aria-label="Delete carousel image"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {extraPreviews.map((src, i) => (
                <div
                  key={`new-${i}`}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "4/3", borderRadius: 6, border: "1px dashed #d8c4ad" }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <span
                    className="absolute bottom-1 left-1"
                    style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                      backgroundColor: "rgba(255,255,255,0.95)", color: "#5C3D28",
                      borderRadius: 4, padding: "2px 6px",
                    }}
                  >
                    NEW
                  </span>
                  <button
                    type="button"
                    onClick={() => removePendingExtra(i)}
                    className="absolute top-1 right-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.65)", border: "none", borderRadius: "50%", padding: 3, cursor: "pointer" }}
                    aria-label="Remove pending image"
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
              Existing images are saved on the server. New ones (marked NEW) upload when you press Save Changes.
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
            <label style={labelStyle}>Style Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Slug (read-only — changing it would break URLs) */}
          <div>
            <label style={labelStyle}>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              style={{ ...inputStyle, backgroundColor: "#f9f9f9", color: "#888" }}
              readOnly
            />
            <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
              Slug is locked once a style exists — changing it would break booking links.
            </p>
          </div>

          {/* Prices & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label style={labelStyle} className="flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5" />
                Starting Price (TSh) *
              </label>
              <input
                type="number"
                step="1"
                required
                value={form.price_from}
                onChange={(e) => handleChange("price_from", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} className="flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5" />
                VIP Price (TSh)
              </label>
              <input
                type="number"
                step="1"
                value={form.vip_price}
                onChange={(e) => handleChange("vip_price", e.target.value)}
                style={inputStyle}
                placeholder="Optional — appears on /vip"
              />
            </div>
            <div>
              <label style={labelStyle} className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Duration *
              </label>
              <input
                type="text"
                required
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Tag inputs */}
          <TagInput
            label="Available Lengths"
            icon={<Tag className="h-3.5 w-3.5" />}
            tags={lengths}
            setTags={setLengths}
            input={lengthInput}
            setInput={setLengthInput}
            suggestions={lengthSuggestions}
            placeholder="e.g. Waist Length..."
          />
          <TagInput
            label="Available Colors"
            icon={<Tag className="h-3.5 w-3.5" />}
            tags={colors}
            setTags={setColors}
            input={colorInput}
            setInput={setColorInput}
            suggestions={colorSuggestions}
            placeholder="e.g. Black..."
          />
          <TagInput
            label="Types / Sizes"
            icon={<Tag className="h-3.5 w-3.5" />}
            tags={types}
            setTags={setTypes}
            input={typeInput}
            setInput={setTypeInput}
            suggestions={typeSuggestions}
            placeholder="e.g. Small..."
          />

          {/* Sort & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => handleChange("sort_order", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 14, paddingBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                  style={{ accentColor: "#8B5E3C", width: 16, height: 16 }}
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex gap-3" style={{ marginTop: 8 }}>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
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
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/services")}
              className="uppercase transition-colors hover:text-[#8B5E3C]"
              style={{
                padding: "13px 20px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "#686868",
                background: "none",
                border: "1px solid #ddd",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
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
