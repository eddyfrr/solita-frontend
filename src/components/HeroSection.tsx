import Image from "next/image";
import Link from "next/link";

export function HeroSection({ imageUrl }: { imageUrl?: string | null }) {
  // Admin-uploaded hero image (from the API) wins; otherwise fall back to the
  // bundled static banner so the homepage always has a hero.
  const src = imageUrl || "/images/hero-banner.jpg";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ marginTop: "90px", height: "85vh", minHeight: "550px" }}
    >
      {/* Background Image */}
      <Image
        src={src}
        alt="Solita Beauty Bar"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center 30%" }}
      />

      {/* Gradient overlay — darker at bottom for text, subtle warm tint */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(139,94,60,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Text at bottom — doesn't cover faces */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center"
        style={{ paddingBottom: "clamp(40px, 8vh, 80px)" }}
      >
        <h1
          className="text-white"
          style={{
            fontSize: "clamp(42px, 10vw, 72px)",
            letterSpacing: "0.12em",
            fontFamily: "var(--font-playfair), Playfair Display, serif",
            fontWeight: 400,
            marginBottom: "4px",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}
        >
          Solita
        </h1>
        <p
          className="text-white/90 uppercase"
          style={{
            fontSize: "clamp(10px, 2vw, 14px)",
            letterSpacing: "0.35em",
            fontFamily: "var(--font-jost), Jost, sans-serif",
            fontWeight: 300,
            marginBottom: "28px",
          }}
        >
          Beauty Bar
        </p>
        <Link
          href="/shop"
          className="inline-block uppercase transition-all duration-300 ease-in-out hover:bg-white hover:text-[#8B5E3C]"
          style={{
            padding: "14px 48px",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.25em",
            fontFamily: "var(--font-jost), Jost, sans-serif",
            border: "1.5px solid rgba(255,255,255,0.8)",
            color: "#fff",
            backdropFilter: "blur(2px)",
          }}
        >
          Shop All
        </Link>
      </div>
    </section>
  );
}
