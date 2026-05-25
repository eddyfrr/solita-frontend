"use client";

import { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";

interface ImageCropperProps {
  file: File;
  aspectRatio?: number;
  /** Largest side (px) of the exported image. Defaults to 1600. */
  maxOutputSize?: number;
  onCropComplete: (croppedFile: File, dataUrl: string) => void;
  onCancel: () => void;
}

const FRAME_WIDTH = 480;

export function ImageCropper({
  file,
  aspectRatio = 4 / 3,
  maxOutputSize = 1600,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const frameWidth = FRAME_WIDTH;
  const frameHeight = Math.round(FRAME_WIDTH / aspectRatio);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Load file → image element
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      const min = Math.max(frameWidth / img.naturalWidth, frameHeight / img.naturalHeight);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImgEl(img);
      setMinScale(min);
      setScale(min);
      // Center the image
      setOffset({
        x: (frameWidth - img.naturalWidth * min) / 2,
        y: (frameHeight - img.naturalHeight * min) / 2,
      });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, frameWidth, frameHeight]);

  // Clamp offset so the image always covers the frame.
  const clampOffset = (ox: number, oy: number, s: number) => {
    if (!naturalSize) return { x: ox, y: oy };
    const dispW = naturalSize.w * s;
    const dispH = naturalSize.h * s;
    const minX = frameWidth - dispW; // ≤ 0
    const minY = frameHeight - dispH;
    return {
      x: Math.min(0, Math.max(minX, ox)),
      y: Math.min(0, Math.max(minY, oy)),
    };
  };

  const handleScaleChange = (next: number) => {
    if (!naturalSize) return;
    const clamped = Math.min(minScale * 4, Math.max(minScale, next));
    // Keep the frame center stable when zooming
    const cx = frameWidth / 2;
    const cy = frameHeight / 2;
    const imgX = (cx - offset.x) / scale;
    const imgY = (cy - offset.y) / scale;
    const newOx = cx - imgX * clamped;
    const newOy = cy - imgY * clamped;
    setScale(clamped);
    setOffset(clampOffset(newOx, newOy, clamped));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy, scale));
  };
  const stopDrag = () => {
    setDragging(false);
    dragStart.current = null;
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { x: t.clientX, y: t.clientY, ox: offset.x, oy: offset.y };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !dragStart.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    setOffset(clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy, scale));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    handleScaleChange(scale * (1 + delta));
  };

  const reset = () => {
    if (!naturalSize) return;
    setScale(minScale);
    setOffset({
      x: (frameWidth - naturalSize.w * minScale) / 2,
      y: (frameHeight - naturalSize.h * minScale) / 2,
    });
  };

  const handleSave = () => {
    if (!imgEl || !naturalSize) return;

    // Source rect on the original image (in original pixels):
    // The frame's top-left in image space is (-offset.x / scale, -offset.y / scale).
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sw = frameWidth / scale;
    const sh = frameHeight / scale;

    // Output canvas — keep aspect, cap max edge.
    const longSide = Math.max(frameWidth, frameHeight);
    const outScale = Math.min(1, maxOutputSize / longSide) * (sw / frameWidth);
    const outW = Math.round(frameWidth * outScale);
    const outH = Math.round(frameHeight * outScale);

    // We actually want the output canvas at *source* resolution (or capped).
    const finalW = Math.min(Math.round(sw), maxOutputSize);
    const finalH = Math.round(finalW / aspectRatio);

    const canvas = document.createElement("canvas");
    canvas.width = finalW;
    canvas.height = finalH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, finalW, finalH);

    const ext = file.name.match(/\.[^.]+$/)?.[0] ?? ".jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const mime = ext.toLowerCase() === ".png" ? "image/png" : "image/jpeg";
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const newFile = new File([blob], `${baseName}-cropped${ext}`, { type: mime });
        onCropComplete(newFile, canvas.toDataURL(mime, 0.92));
      },
      mime,
      0.92,
    );
    // Avoid unused var warning
    void outW; void outH;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: 16 }}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          maxWidth: 560,
          width: "100%",
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#282828" }}>
            Crop & Zoom Image
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Crop viewport */}
        <div
          className="mx-auto"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDrag}
          onWheel={handleWheel}
          style={{
            position: "relative",
            width: frameWidth,
            maxWidth: "100%",
            height: frameHeight,
            backgroundColor: "#1a1a1a",
            overflow: "hidden",
            cursor: dragging ? "grabbing" : "grab",
            borderRadius: 8,
            touchAction: "none",
            userSelect: "none",
          }}
        >
          {imageUrl && naturalSize && (
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: offset.x,
                top: offset.y,
                width: naturalSize.w * scale,
                height: naturalSize.h * scale,
                maxWidth: "none",
                pointerEvents: "none",
              }}
            />
          )}
          {/* Aspect-ratio outline overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={() => handleScaleChange(scale * 0.85)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4 text-gray-500" />
          </button>
          <input
            type="range"
            min={minScale}
            max={minScale * 4}
            step={0.001}
            value={scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: "#8B5E3C" }}
          />
          <button
            type="button"
            onClick={() => handleScaleChange(scale * 1.15)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4 text-gray-500" />
          </button>
          <button
            type="button"
            onClick={reset}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Reset"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
          Drag to pan, scroll or use the slider to zoom. Output aspect: {aspectRatio.toFixed(2)}:1.
        </p>

        {/* Actions */}
        <div className="flex gap-3" style={{ marginTop: 18 }}>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 uppercase"
            style={{
              padding: "12px 20px",
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
          <button
            type="button"
            onClick={handleSave}
            disabled={!imgEl}
            className="flex-1 uppercase flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#8B5E3C",
              color: "#fff",
              padding: "12px 20px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              border: "none",
              borderRadius: 6,
              cursor: imgEl ? "pointer" : "wait",
              opacity: imgEl ? 1 : 0.6,
            }}
          >
            <Check className="h-4 w-4" />
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
