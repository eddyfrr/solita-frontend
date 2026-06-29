"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Check } from "lucide-react";
import { ImageCropper } from "@/components/ImageCropper";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : "http://localhost:8000/api");

// The homepage hero is a wide full-bleed banner.
const HERO_ASPECT = 16 / 9;
const STATIC_FALLBACK = "/images/hero-banner.jpg";

function getToken() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("admin-tokens");
  if (!raw) return null;
  try {
    return JSON.parse(raw).access;
  } catch {
    return null;
  }
}

export default function HomepageSettingsPage() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Crop flow
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/site-settings/`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUrl(data.hero_image_url || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileToCrop(file);
    // Allow re-selecting the same file later
    e.target.value = "";
  };

  const handleCropComplete = (file: File, dataUrl: string) => {
    setCroppedFile(file);
    setCroppedPreview(dataUrl);
    setFileToCrop(null);
  };

  const handleSave = async () => {
    if (!croppedFile) return;
    setSaving(true);
    setMessage(null);
    const token = getToken();
    try {
      const formData = new FormData();
      formData.append("hero_image", croppedFile);
      const res = await fetch(`${API_BASE}/site-settings/`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setCurrentUrl(data.hero_image_url || null);
      setCroppedFile(null);
      setCroppedPreview(null);
      setMessage("Hero image updated. It may take a moment to appear on the live site.");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = croppedPreview || currentUrl || STATIC_FALLBACK;

  return (
    <div className="mx-auto max-w-[800px]">
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          border: "1px solid #eee",
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 500, color: "#282828", marginBottom: 4 }}>
          Homepage Hero Image
        </h2>
        <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>
          This is the large banner shown at the top of the homepage when the website opens.
        </p>

        {/* Current / preview */}
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#8B5E3C",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          {croppedPreview ? "New image preview" : "Current image"}
        </p>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "#f0ece6",
            marginBottom: 20,
          }}
        >
          {loading ? (
            <div
              className="flex h-full items-center justify-center"
              style={{ color: "#bbb", fontSize: 13 }}
            >
              Loading...
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt="Hero preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>

        {!croppedFile && currentUrl === null && !loading && (
          <p style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>
            No custom image set yet — the default banner is shown. Upload one to replace it.
          </p>
        )}

        {/* Choose image */}
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50"
          style={{
            border: "2px dashed #ddd",
            borderRadius: 8,
            padding: "28px 20px",
            marginBottom: 16,
          }}
        >
          <Upload className="h-7 w-7 text-gray-300" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: "#686868", marginBottom: 4 }}>
            Click to choose a new hero image
          </p>
          <p style={{ fontSize: 12, color: "#bbb" }}>
            JPG or PNG. You&apos;ll crop it to a wide banner next.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          style={{ display: "none" }}
        />

        {/* Save / cancel */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!croppedFile || saving}
            className="flex items-center gap-2 uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{
              backgroundColor: "#8B5E3C",
              color: "#fff",
              padding: "11px 28px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.1em",
              borderRadius: 6,
              border: "none",
              cursor: croppedFile && !saving ? "pointer" : "not-allowed",
            }}
          >
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : "Save Hero Image"}
          </button>
          {croppedFile && (
            <button
              onClick={() => {
                setCroppedFile(null);
                setCroppedPreview(null);
              }}
              style={{
                padding: "11px 20px",
                fontSize: 12,
                color: "#686868",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Discard
            </button>
          )}
        </div>

        {message && (
          <p style={{ fontSize: 13, color: "#5C3D28", marginTop: 16 }}>{message}</p>
        )}
      </div>

      {/* Cropper modal */}
      {fileToCrop && (
        <ImageCropper
          file={fileToCrop}
          aspectRatio={HERO_ASPECT}
          maxOutputSize={2000}
          onCropComplete={handleCropComplete}
          onCancel={() => setFileToCrop(null)}
        />
      )}
    </div>
  );
}
