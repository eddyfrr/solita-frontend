"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  images: { src: string; alt?: string }[];
  aspectRatio?: string;
  priority?: boolean;
}

/** Instagram-style image carousel: snap-scroll, arrows, dot indicators. */
export function Carousel({ images, aspectRatio = "3/4", priority = false }: CarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      if (idx !== active) setActive(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [active]);

  if (images.length === 0) return null;

  const goTo = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  const next = () => goTo(Math.min(active + 1, images.length - 1));
  const prev = () => goTo(Math.max(active - 1, 0));

  return (
    <div className="relative w-full" style={{ aspectRatio }}>
      <div
        ref={scrollerRef}
        className="flex h-full w-full overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {images.map((img, i) => (
          <div
            key={i}
            className="relative shrink-0"
            style={{ width: "100%", height: "100%", scrollSnapAlign: "start" }}
          >
            <Image
              src={img.src}
              alt={img.alt ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={priority && i === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          {active > 0 && (
            <button
              type="button"
              onClick={prev}
              className="absolute top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
              aria-label="Previous image"
              style={{
                left: 12,
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: 0.85,
              }}
            >
              <ChevronLeft className="h-5 w-5 text-[#5C3D28]" />
            </button>
          )}
          {active < images.length - 1 && (
            <button
              type="button"
              onClick={next}
              className="absolute top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
              aria-label="Next image"
              style={{
                right: 12,
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: 0.85,
              }}
            >
              <ChevronRight className="h-5 w-5 text-[#5C3D28]" />
            </button>
          )}

          {/* Dot indicators */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex gap-1.5"
            style={{ bottom: 14 }}
          >
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                style={{
                  width: i === active ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: i === active ? "#fff" : "rgba(255,255,255,0.55)",
                  transition: "width 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
