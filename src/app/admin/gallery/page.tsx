"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : "http://localhost:8000/api");

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

interface Photo {
  id: number;
  image_url: string;
  caption: string;
  is_active: boolean;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/gallery/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.results || data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    const token = getToken();
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("caption", caption);
        formData.append("is_active", "true");

        await fetch(`${API_BASE}/gallery/`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
      }

      // Reset
      setSelectedFiles([]);
      setPreviews([]);
      setCaption("");
      setShowUpload(false);
      fetchPhotos();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this photo?")) return;
    const token = getToken();
    try {
      await fetch(`${API_BASE}/gallery/${id}/`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchPhotos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: "#999" }}>
          {photos.length} photo{photos.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 uppercase transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#8B5E3C",
            color: "#fff",
            padding: "9px 20px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus className="h-4 w-4" />
          Upload Photo
        </button>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            border: "1px solid #eee",
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 500, color: "#282828", marginBottom: 16 }}>
            Upload Photos
          </h3>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50"
            style={{
              border: "2px dashed #ddd",
              borderRadius: 8,
              padding: "32px 20px",
              marginBottom: 16,
            }}
          >
            <Upload className="h-8 w-8 text-gray-300" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 14, color: "#686868", marginBottom: 4 }}>
              Click to select photos
            </p>
            <p style={{ fontSize: 12, color: "#bbb" }}>
              JPG, PNG up to 10MB each
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            style={{ display: "none" }}
          />

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3" style={{ marginBottom: 16 }}>
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt=""
                    className="w-full aspect-square object-cover"
                    style={{ borderRadius: 6 }}
                  />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Caption */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#282828", display: "block", marginBottom: 6 }}>
              Caption (optional — applies to all)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Knotless braids by Solita"
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: 14,
                border: "1px solid #ddd",
                borderRadius: 6,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Upload button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{
                backgroundColor: "#8B5E3C",
                color: "#fff",
                padding: "10px 28px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              {uploading
                ? `Uploading ${selectedFiles.length} photo${selectedFiles.length !== 1 ? "s" : ""}...`
                : `Upload ${selectedFiles.length} photo${selectedFiles.length !== 1 ? "s" : ""}`}
            </button>
            <button
              onClick={() => {
                setShowUpload(false);
                setSelectedFiles([]);
                setPreviews([]);
                setCaption("");
              }}
              style={{
                padding: "10px 20px",
                fontSize: 12,
                color: "#686868",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Photos Grid */}
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
        ) : photos.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <p style={{ color: "#ccc", fontSize: 14, marginBottom: 8 }}>
              No gallery photos yet
            </p>
            <p style={{ color: "#ddd", fontSize: 13 }}>
              Upload photos to showcase your work
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" style={{ padding: 20 }}>
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.image_url}
                  alt={photo.caption}
                  className="w-full aspect-square object-cover"
                  style={{ borderRadius: 8 }}
                />
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    border: "none",
                    borderRadius: 6,
                    padding: 6,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
                {photo.caption && (
                  <p style={{ fontSize: 12, color: "#999", marginTop: 6 }}>{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
