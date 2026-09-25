"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropperProps {
  file: File;
  aspectRatio?: number;
  /** Largest side (px) of the exported image. Defaults to 1600. */
  maxOutputSize?: number;
  onCropComplete: (croppedFile: File, dataUrl: string) => void;
  onCancel: () => void;
}

type Point = { x: number; y: number };

const MAX_ZOOM = 5;
const DOUBLE_TAP_ZOOM = 2.5;
const STAGE_PADDING = 24;
const JPEG_QUALITY = 0.88;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Photos-app style editor: pinch or scroll to zoom, drag to move, double-tap to
 * zoom in/out, one-tap rotate. Full-screen on phones. Always exports a JPEG no
 * larger than `maxOutputSize` on its long side, so uploads stay small.
 */
export function ImageCropper({
  file,
  aspectRatio = 4 / 3,
  maxOutputSize = 1600,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loadError, setLoadError] = useState(false);

  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [zoom, setZoom] = useState(1); // 1 = photo just covers the frame
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 }); // px from stage centre
  const [interacting, setInteracting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live gesture bookkeeping (refs: updated on every pointer move).
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ zoom: number; pan: Point; mid: Point; dist: number } | null>(null);
  const lastTap = useRef<{ t: number; p: Point } | null>(null);
  const downAt = useRef<Point | null>(null);

  // ── Load the photo ──
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setLoadError(false);
    setImg(null);
    let live = true; // a superseded load (new file, remount) must not report
    const el = new Image();
    el.onload = () => live && setImg(el);
    el.onerror = () => live && setLoadError(true);
    el.src = url;
    return () => {
      live = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // ── Size the stage (re-measures on rotate-device / resize) ──
  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const measure = () => setStage({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Lock page scroll and wire Esc/Enter while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Geometry ──
  const availW = Math.max(0, stage.w - STAGE_PADDING * 2);
  const availH = Math.max(0, stage.h - STAGE_PADDING * 2);
  const frameW = Math.min(availW, availH * aspectRatio);
  const frameH = frameW / aspectRatio;

  const natW = img?.naturalWidth ?? 1;
  const natH = img?.naturalHeight ?? 1;
  const sideways = rotation % 180 !== 0;
  const rotW = sideways ? natH : natW; // on-screen width before scaling
  const rotH = sideways ? natW : natH;
  const cover = frameW > 0 ? Math.max(frameW / rotW, frameH / rotH) : 1;
  const scale = cover * zoom;

  const clampPan = useCallback(
    (p: Point, z: number): Point => {
      const s = cover * z;
      const maxX = Math.max(0, (rotW * s - frameW) / 2);
      const maxY = Math.max(0, (rotH * s - frameH) / 2);
      return { x: clamp(p.x, -maxX, maxX), y: clamp(p.y, -maxY, maxY) };
    },
    [cover, rotW, rotH, frameW, frameH],
  );

  // Recentre when the frame itself changes size (device rotated, window resized).
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [frameW]);

  /** Zoom to `next`, keeping the photo point under `focus` (stage-centre px) fixed. */
  const zoomAround = useCallback(
    (next: number, focus: Point = { x: 0, y: 0 }, from = { zoom, pan }) => {
      const z = clamp(next, 1, MAX_ZOOM);
      const k = z / from.zoom;
      setZoom(z);
      setPan(
        clampPan(
          { x: focus.x - (focus.x - from.pan.x) * k, y: focus.y - (focus.y - from.pan.y) * k },
          z,
        ),
      );
    },
    [zoom, pan, clampPan],
  );

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const rotate = () => {
    setRotation((r) => (r + 90) % 360);
    reset();
  };

  // ── Pointer gestures (mouse, touch and pen alike) ──
  const toStage = (e: { clientX: number; clientY: number }): Point => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
  };

  const beginGesture = () => {
    const pts = [...pointers.current.values()];
    if (pts.length === 0) {
      gesture.current = null;
      return;
    }
    const mid =
      pts.length === 1
        ? pts[0]
        : { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    const dist = pts.length === 1 ? 0 : Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    gesture.current = { zoom, pan, mid, dist };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!img) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = toStage(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 1) downAt.current = p;
    setInteracting(true);
    beginGesture();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, toStage(e));
    const pts = [...pointers.current.values()];
    const g = gesture.current;

    if (pts.length >= 2 && g.dist > 0) {
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const z = clamp(g.zoom * (dist / g.dist), 1, MAX_ZOOM);
      const k = z / g.zoom;
      // Pinch zooms around the fingers and follows them as they move.
      setZoom(z);
      setPan(
        clampPan(
          {
            x: mid.x - (g.mid.x - g.pan.x) * k,
            y: mid.y - (g.mid.y - g.pan.y) * k,
          },
          z,
        ),
      );
    } else if (pts.length === 1) {
      setPan(clampPan({ x: g.pan.x + pts[0].x - g.mid.x, y: g.pan.y + pts[0].y - g.mid.y }, g.zoom));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const p = toStage(e);
    pointers.current.delete(e.pointerId);

    // Double-tap / double-click: toggle between fitted and zoomed-in.
    const start = downAt.current;
    const wasTap = pointers.current.size === 0 && start && Math.hypot(p.x - start.x, p.y - start.y) < 10;
    if (wasTap) {
      const now = Date.now();
      const prev = lastTap.current;
      if (prev && now - prev.t < 300 && Math.hypot(p.x - prev.p.x, p.y - prev.p.y) < 30) {
        lastTap.current = null;
        if (zoom > 1.05) reset();
        else zoomAround(DOUBLE_TAP_ZOOM, p);
      } else {
        lastTap.current = { t: now, p };
      }
    }

    if (pointers.current.size === 0) {
      setInteracting(false);
      downAt.current = null;
    }
    beginGesture(); // remaining finger continues as a drag
  };

  // Wheel / trackpad pinch on desktop. Non-passive so we can stop page zoom.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = node.getBoundingClientRect();
      const focus = { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
      zoomAround(zoom * Math.exp(-e.deltaY * 0.0025), focus);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [zoom, zoomAround]);

  // ── Export ──
  const save = () => {
    if (!img || frameW === 0 || saving) return;
    setSaving(true);

    // Crop size in original photo pixels, capped so uploads stay small.
    const srcW = frameW / scale;
    const srcH = frameH / scale;
    const shrink = Math.min(1, maxOutputSize / Math.max(srcW, srcH));
    const outW = Math.max(1, Math.round(srcW * shrink));
    const outH = Math.max(1, Math.round(srcH * shrink));
    const k = outW / frameW; // screen px → output px

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setSaving(false);
      return;
    }
    ctx.fillStyle = "#fff"; // JPEG has no transparency
    ctx.fillRect(0, 0, outW, outH);
    ctx.imageSmoothingQuality = "high";
    ctx.translate(outW / 2 + pan.x * k, outH / 2 + pan.y * k);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * k, scale * k);
    ctx.drawImage(img, -natW / 2, -natH / 2);

    canvas.toBlob(
      (blob) => {
        setSaving(false);
        if (!blob) return;
        const base = file.name.replace(/\.[^.]+$/, "") || "photo";
        const out = new File([blob], `${base}.jpg`, { type: "image/jpeg" });
        onCropComplete(out, URL.createObjectURL(blob));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  };

  // Keyboard: Esc cancels, Enter saves.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const ready = !!img && frameW > 0;
  const zoomPct = Math.round(((zoom - 1) / (MAX_ZOOM - 1)) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Adjust photo"
    >
      <div
        className="flex w-full flex-col overflow-hidden sm:h-[min(760px,90vh)] sm:max-w-[720px] sm:rounded-2xl"
        style={{ backgroundColor: "#0f0f0f", color: "#fff" }}
      >
        {/* Top bar — Photos-style Cancel / Done */}
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 56, paddingTop: "env(safe-area-inset-top)" }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-2 text-[15px]"
            style={{ color: "#ddd" }}
          >
            Cancel
          </button>
          <span className="text-[15px] font-semibold">Adjust photo</span>
          <button
            type="button"
            onClick={save}
            disabled={!ready || saving}
            className="rounded-full px-4 py-2 text-[15px] font-semibold disabled:opacity-40"
            style={{ backgroundColor: "#c9a063", color: "#1a1a1a" }}
          >
            {saving ? "Saving…" : "Done"}
          </button>
        </div>

        {/* Stage — the whole area takes gestures, the frame is what gets saved */}
        <div
          ref={stageRef}
          className="relative flex-1 select-none overflow-hidden"
          style={{ touchAction: "none", cursor: interacting ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {ready && (
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2"
              style={{
                width: natW * scale,
                height: natH * scale,
                maxWidth: "none",
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg)`,
                transition: interacting ? "none" : "transform 180ms ease-out, width 180ms ease-out, height 180ms ease-out",
              }}
            />
          )}

          {ready && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2"
              style={{
                width: frameW,
                height: frameH,
                transform: "translate(-50%, -50%)",
                // Dim everything outside the crop, like the Photos app.
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
                border: "1.5px solid rgba(255,255,255,0.9)",
                borderRadius: 4,
              }}
            >
              {/* Rule-of-thirds grid, shown while adjusting */}
              <div
                className="absolute inset-0"
                style={{
                  opacity: interacting ? 1 : 0,
                  transition: "opacity 200ms",
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
                  backgroundSize: `${frameW / 3}px ${frameH / 3}px`,
                  backgroundPosition: "-1px -1px",
                }}
              />
            </div>
          )}

          {!img && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: "#aaa" }}>
              Opening photo…
            </div>
          )}

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <p className="text-base font-semibold">This photo can&apos;t be opened here</p>
              <p className="text-sm" style={{ color: "#aaa", maxWidth: 360 }}>
                Please choose a JPG, PNG or WebP photo. iPhone HEIC photos open in Safari; in other
                browsers, set Settings → Camera → Formats → Most Compatible, or send yourself the
                photo as a JPG.
              </p>
              <button
                type="button"
                onClick={onCancel}
                className="mt-2 rounded-full px-5 py-2 text-sm font-semibold"
                style={{ backgroundColor: "#fff", color: "#111" }}
              >
                Choose another photo
              </button>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="px-4 pb-4 pt-3" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
          <p className="mb-3 text-center text-xs" style={{ color: "#8a8a8a" }}>
            Pinch or scroll to zoom · Drag to move · Double-tap to zoom
          </p>
          <div className="mx-auto flex max-w-md items-center gap-3">
            <button
              type="button"
              onClick={rotate}
              disabled={!ready}
              aria-label="Rotate 90°"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
              style={{ backgroundColor: "#222" }}
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <ZoomOut className="h-4 w-4 shrink-0" style={{ color: "#8a8a8a" }} />
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              disabled={!ready}
              onChange={(e) => zoomAround(parseFloat(e.target.value))}
              aria-label={`Zoom ${zoomPct}%`}
              className="h-11 flex-1"
              style={{ accentColor: "#c9a063" }}
            />
            <ZoomIn className="h-4 w-4 shrink-0" style={{ color: "#8a8a8a" }} />
            <button
              type="button"
              onClick={() => {
                reset();
                setRotation(0);
              }}
              disabled={!ready}
              className="h-11 shrink-0 rounded-full px-4 text-sm disabled:opacity-40"
              style={{ backgroundColor: "#222" }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
