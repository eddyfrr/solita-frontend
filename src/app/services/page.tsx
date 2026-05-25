import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { allServices } from "@/data/services";
import { getAPIServices } from "@/lib/server-api";

export default async function ServicesPage() {
  const apiServices = await getAPIServices();

  const services = apiServices.length > 0
    ? apiServices.map((s) => ({
        slug: s.slug,
        name: s.name,
        imageUrl: s.image_url || "/images/products/french-curls-honey-cocoa.jpg",
        styleCount: s.style_count,
      }))
    : allServices.map((s) => ({
        slug: s.slug,
        name: s.name,
        imageUrl: s.imageUrl,
        styleCount: s.styles.length,
      }));

  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{
          paddingTop: 150,
          paddingBottom: 80,
          fontFamily: "var(--font-jost), Jost, sans-serif",
          backgroundColor: "#FDFAF6",
        }}
      >
        <div className="mx-auto max-w-[1340px] px-[15px]">
          <h1
            className="text-center"
            style={{
              fontSize: 48,
              fontWeight: 400,
              color: "#5C3D28",
              marginBottom: 16,
              fontFamily: "var(--font-playfair), Playfair Display, serif",
            }}
          >
            Our Services
          </h1>
          <p
            className="mx-auto text-center"
            style={{
              fontSize: 16,
              color: "#686868",
              maxWidth: 550,
              lineHeight: 1.7,
              marginBottom: 60,
            }}
          >
            Premium beauty services delivered by skilled professionals. Book your
            appointment today.
          </p>

          {/* Services Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group block overflow-hidden"
                style={{ borderRadius: 12 }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "4/3", borderRadius: 12 }}
                >
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div
                    className="absolute inset-0 flex items-end transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                    }}
                  >
                    <div className="w-full p-6">
                      <h2
                        className="text-white"
                        style={{
                          fontSize: 24,
                          fontWeight: 500,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {service.name}
                      </h2>
                      <p
                        className="mt-1"
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.8)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        {service.styleCount} styles available
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
