"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X, Plus, Clock, Banknote, Tag, Crop } from "lucide-react";
import Link from "next/link";
import { createServiceStyle, uploadServiceStyleImage } from "@/lib/api";
import { ImageCropper } from "@/components/ImageCropper";

export default function AddStylePage() {
  const router = useRouter();
  const { slug: serviceSlug } = useParams<{ slug: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  // Cropper state — pick a file → open cropper → save → keep cropped File for upload
  const [cropFile, setCropFile] = useState<File | null>(null);
  // Additional images for the carousel
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const extraFileRef = useRef<HTMLInputElement>(null);
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

  // Tag-style inputs for lengths, colors, types
  const [lengths, setLengths] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [lengthInput, setLengthInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [typeInput, setTypeInput] = useState("");

  const serviceName = serviceSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
      setCropFile(file);
    }
    // Allow re-selecting the same file later
    e.target.value = "";
  };

  const handleExtraFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      // Crop them one at a time. Stash the rest in queue.
      setExtraCropFile(files[0]);
      // Queue any remaining files so they can be cropped sequentially.
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

  const addTag = useCallback(
    (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
      const trimmed = input.trim();
      if (trimmed && !list.includes(trimmed)) {
        setList([...list, trimmed]);
      }
      setInput("");
    },
    []
  );

  const removeTag = (list: string[], setList: (v: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    list: string[],
    setList: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void
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
      let body: FormData | Record<string, unknown>;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("slug", form.slug);
        formData.append("description", form.description);
        formData.append("price_from", form.price_from);
        if (form.vip_price) formData.append("vip_price", form.vip_price);
        formData.append("duration", form.duration);
        formData.append("is_active", String(form.is_active));
        formData.append("sort_order", form.sort_order);
        formData.append("lengths", JSON.stringify(lengths));
        formData.append("colors", JSON.stringify(colors));
        formData.append("types", JSON.stringify(types));
        formData.append("image", selectedFile);
        body = formData;
      } else {
        body = {
          name: form.name,
          slug: form.slug,
          description: form.description,
          price_from: form.price_from,
          vip_price: form.vip_price || null,
          duration: form.duration,
          is_active: form.is_active,
          sort_order: parseInt(form.sort_order) || 0,
          lengths,
          colors,
          types,
        };
      }

      const created = await createServiceStyle(serviceSlug, body);
      // Upload any additional carousel images
      if (extraFiles.length > 0 && created?.slug) {
        await Promise.all(
          extraFiles.map((f, idx) => {
            const fd = new FormData();
            fd.append("image", f);
            fd.append("sort_order", String(idx + 1));
            return uploadServiceStyleImage(serviceSlug, created.slug, fd).catch(() => null);
          }),
        );
      }
      setSuccess(true);
      // Reset form for adding another
      setTimeout(() => setSuccess(false), 3000);
      setForm({ name: "", slug: "", description: "", price_from: "", vip_price: "", duration: "", is_active: true, sort_order: "0" });
      setLengths([]);
      setColors([]);
      setTypes([]);
      setPreview(null);
      setSelectedFile(null);
      setExtraFiles([]);
      setExtraPreviews([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create style";
      setError(msg);
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

  // Suggested quick-fills
  const lengthSuggestions = ["Waist Length", "Mid-Back", "Hip Length", "Knee Length", "Shoulder Length", "Bra Strap"];
  const colorSuggestions = ["Black", "Brown", "Blonde", "Burgundy", "Ombre", "Honey", "Red", "Auburn"];
  const typeSuggestions = ["Small", "Medium", "Large", "Jumbo", "Micro", "Knotless"];

  const TagInput = ({
    label,
    icon,
    tags,
    setTags,
    input,
    setInput,
    suggestions,
    placeholder,
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

      {/* Tags */}
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

      {/* Quick suggestions */}
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
        {/* Header with service name badge */}
        <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: "#282828" }}>
            Add Style
          </h2>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: 20,
              backgroundColor: "#FDF5ED",
              border: "1px solid #E8D5C4",
              color: "#8B5E3C",
            }}
          >
            {serviceName}
          </span>
        </div>

        {/* Success message */}
        {success && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              color: "#15803d",
              fontSize: 13,
              padding: "12px 16px",
              borderRadius: 6,
              marginBottom: 20,
              border: "1px solid #bbf7d0",
            }}
          >
            Style added successfully! You can add another or go back to services.
          </div>
        )}

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
                  <p style={{ fontSize: 13, color: "#999" }}>Click to upload — you&apos;ll crop &amp; zoom next</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelected} style={{ display: "none" }} />
          </div>

          {/* Carousel — additional images. Each one passes through the cropper too. */}
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
              Shown after the cover, Instagram-style. Pick multiple files at once — you&apos;ll crop each one in turn.
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
              placeholder="e.g. Knotless Braids, Box Braids, Senegalese Twist"
            />
          </div>

          {/* Price & Duration */}
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
                placeholder="e.g. 150000"
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
                placeholder="Optional — shown on VIP section"
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
                placeholder="e.g. 3-5 hours"
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
              placeholder="Describe this style..."
            />
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#5C3D28", marginBottom: 4 }}>
              Options & Variants
            </p>
            <p style={{ fontSize: 12, color: "#999", marginBottom: 12 }}>
              Add available lengths, colors, and types. Press Enter or comma to add each tag.
            </p>
          </div>

          {/* Lengths */}
          <TagInput
            label="Available Lengths"
            icon={<Tag className="h-3.5 w-3.5" />}
            tags={lengths}
            setTags={setLengths}
            input={lengthInput}
            setInput={setLengthInput}
            suggestions={lengthSuggestions}
            placeholder="e.g. Waist Length, Hip Length..."
          />

          {/* Colors */}
          <TagInput
            label="Available Colors"
            icon={<Tag className="h-3.5 w-3.5" />}
            tags={colors}
            setTags={setColors}
            input={colorInput}
            setInput={setColorInput}
            suggestions={colorSuggestions}
            placeholder="e.g. Black, Brown, Blonde..."
          />

          {/* Types / Sizes */}
          <TagInput
            label="Types / Sizes"
            icon={<Tag className="h-3.5 w-3.5" />}
            tags={types}
            setTags={setTypes}
            input={typeInput}
            setInput={setTypeInput}
            suggestions={typeSuggestions}
            placeholder="e.g. Small, Medium, Large..."
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3" style={{ marginTop: 8 }}>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 uppercase transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
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
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Add Style"}
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
              Done
            </button>
          </div>
        </form>
      </div>

      {/* Cover-image cropper */}
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

      {/* Carousel-image cropper (one file at a time, queued) */}
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
