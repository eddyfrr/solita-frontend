"use client";

import { useRef, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { ImageCropper } from "@/components/ImageCropper";

export interface ExtraPhoto {
  id: number;
  image_url: string | null;
  sort_order: number;
}

interface ExtraPhotosManagerProps {
  photos: ExtraPhoto[];
  onChange: React.Dispatch<React.SetStateAction<ExtraPhoto[]>>;
  upload: (data: FormData) => Promise<ExtraPhoto>;
  remove: (id: number) => Promise<void>;
  aspectRatio?: number;
}

/**
 * Carousel photos on an existing item. Each photo is cropped, then uploaded
 * straight away, so a failure is reported against the photo that caused it
 * instead of disappearing when the main form is saved.
 */
export function ExtraPhotosManager({
  photos,
  onChange,
  upload,
  remove,
  aspectRatio = 4 / 3,
}: ExtraPhotosManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queue = useRef<File[]>([]);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(0);
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError] = useState("");

  const nextFromQueue = () => {
    const [next, ...rest] = queue.current;
    queue.current = rest;
    setCropFile(next ?? null);
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    queue.current = Array.from(e.target.files ?? []);
    e.target.value = "";
    setError("");
    nextFromQueue();
  };

  const handleCropped = async (file: File) => {
    nextFromQueue();
    setUploading((n) => n + 1);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const maxOrder = photos.reduce((m, p) => Math.max(m, p.sort_order), 0);
      fd.append("sort_order", String(maxOrder + 1));
      const created = await upload(fd);
      onChange((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A photo failed to upload");
    } finally {
      setUploading((n) => n - 1);
    }
  };

  const handleRemove = async (id: number) => {
    setRemoving(id);
    setError("");
    try {
      await remove(id);
      onChange((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove that photo");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-md border border-[#eee]" style={{ aspectRatio }}>
            {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
            <button
              type="button"
              onClick={() => handleRemove(p.id)}
              disabled={removing === p.id}
              aria-label="Remove photo"
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-60"
            >
              {removing === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </button>
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div
            key={`up-${i}`}
            className="flex items-center justify-center rounded-md border border-dashed border-[#d8c4ad] bg-[#faf6f1]"
            style={{ aspectRatio }}
          >
            <Loader2 className="h-5 w-5 animate-spin text-[#8B5E3C]" />
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#ddd] text-[#999] transition-colors hover:bg-gray-50"
          style={{ aspectRatio }}
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">Add photos</span>
        </button>
      </div>

      {error && <p className="mt-2 rounded-md bg-[#fef2f2] px-3 py-2 text-[13px] text-[#dc2626]">{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handlePick} className="hidden" />

      {cropFile && (
        <ImageCropper
          file={cropFile}
          aspectRatio={aspectRatio}
          onCancel={() => {
            queue.current = [];
            setCropFile(null);
          }}
          onCropComplete={handleCropped}
        />
      )}
    </div>
  );
}
