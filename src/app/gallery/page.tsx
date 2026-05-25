import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAPIGalleryPhotos } from "@/lib/server-api";

const fallbackPhotos = [
  { src: "/images/products/french-curls-honey-cocoa.jpg", caption: "French Curls — Honey Cocoa" },
  { src: "/images/products/boho-beach-wave-hazel-brownie.jpg", caption: "Boho Beach Wave — Hazel Brownie" },
  { src: "/images/products/cambodian-wavy-custom-burgundy.jpg", caption: "Cambodian Wavy — Burgundy" },
  { src: "/images/products/bone-straight-platinum-barbie.jpg", caption: "Bone Straight — Platinum Barbie" },
  { src: "/images/products/deep-wave-cinnamon-mocha-darker-shade.jpg", caption: "Deep Wave — Cinnamon Mocha" },
  { src: "/images/products/french-curls-ginger-spice.jpg", caption: "French Curls — Ginger Spice" },
  { src: "/images/products/kinky-curly-honey-maple.jpg", caption: "Kinky Curly — Honey Maple" },
  { src: "/images/products/boho-beach-wave-caramel.jpg", caption: "Boho Beach Wave — Caramel" },
  { src: "/images/products/french-curls-platinum-barbie.jpg", caption: "French Curls — Platinum Barbie" },
  { src: "/images/products/bone-straight-honey-cocoa.jpg", caption: "Bone Straight — Honey Cocoa" },
  { src: "/images/products/deep-wave-ginger-ruby.jpg", caption: "Deep Wave — Ginger Ruby" },
  { src: "/images/products/boho-beach-wave-chocolate-mocha.jpg", caption: "Boho Beach Wave — Chocolate Mocha" },
  { src: "/images/products/french-curls-cinnamon-ombre.jpg", caption: "French Curls — Cinnamon Ombré" },
  { src: "/images/products/bone-straight-ginger-ruby.jpg", caption: "Bone Straight — Ginger Ruby" },
  { src: "/images/products/french-curls-amaka-blonde.jpg", caption: "French Curls — Amaka Blonde" },
  { src: "/images/products/deep-wave-cocoa-ginger.jpg", caption: "Deep Wave — Cocoa Ginger" },
  { src: "/images/products/boho-beach-wave-mocha.jpg", caption: "Boho Beach Wave — Mocha" },
  { src: "/images/products/french-curls-velvet.jpg", caption: "French Curls — Velvet" },
  { src: "/images/products/bone-straight-ayya-ombre.jpg", caption: "Bone Straight — Ombré" },
  { src: "/images/products/french-curls-ruby-merlot.jpg", caption: "French Curls — Ruby Merlot" },
  { src: "/images/products/raw-cambodian-curly-cocoa-mocha.jpg", caption: "Cambodian Curly — Cocoa Mocha" },
  { src: "/images/products/textured-straight-maple-mocha.jpg", caption: "Textured Straight — Maple Mocha" },
  { src: "/images/products/french-curls-cocoa-ginger.jpg", caption: "French Curls — Cocoa Ginger" },
  { src: "/images/products/boho-beach-wave-chocolate-caramel.jpg", caption: "Boho Beach Wave — Chocolate Caramel" },
];

export default async function GalleryPage() {
  const apiPhotos = await getAPIGalleryPhotos();
  const galleryPhotos = apiPhotos.length > 0
    ? apiPhotos.map((p) => ({ src: p.image_url, caption: p.caption || "Client Photo" }))
    : fallbackPhotos;

  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{
          paddingTop: 130,
          paddingBottom: 80,
          fontFamily: "var(--font-jost), Jost, sans-serif",
          backgroundColor: "#FDFAF6",
        }}
      >
        <div className="mx-auto max-w-[1340px] px-[15px]">
          <h1
            className="text-center"
            style={{
              fontSize: 44,
              fontWeight: 400,
              color: "#5C3D28",
              marginBottom: 12,
              fontFamily: "var(--font-playfair), Playfair Display, serif",
            }}
          >
            Our Gallery
          </h1>
          <p
            className="mx-auto text-center"
            style={{
              fontSize: 16,
              color: "#686868",
              maxWidth: 500,
              lineHeight: 1.7,
              marginBottom: 50,
            }}
          >
            A showcase of beautiful styles created by our talented stylists.
            Your next look is waiting.
          </p>

          {/* Gallery Grid */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3" style={{ columnFill: "balance" }}>
            {galleryPhotos.map((photo, i) => (
              <div
                key={i}
                className="group relative mb-3 overflow-hidden break-inside-avoid"
                style={{ borderRadius: 10 }}
              >
                <div
                  style={{
                    aspectRatio: i % 5 === 0 ? "3/4" : i % 3 === 0 ? "4/5" : "1/1",
                    position: "relative",
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)",
                  }}
                >
                  <div style={{ padding: "14px 16px", width: "100%" }}>
                    <p className="text-white" style={{ fontSize: 14, fontWeight: 500 }}>
                      {photo.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="text-center"
            style={{
              marginTop: 60,
              padding: "50px 20px",
              backgroundColor: "#FAF0E8",
              borderRadius: 12,
            }}
          >
            <h2
              style={{
                fontSize: 26,
                fontWeight: 400,
                color: "#282828",
                marginBottom: 12,
              }}
            >
              Love what you see?
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#686868",
                marginBottom: 28,
                maxWidth: 400,
                margin: "0 auto 28px",
              }}
            >
              Book your appointment today and let us create your perfect look
            </p>
            <Link
              href="/services"
              className="inline-flex items-center justify-center uppercase transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#8B5E3C",
                color: "#fff",
                padding: "14px 50px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.2em",
              }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
