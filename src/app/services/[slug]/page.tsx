import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StylesGrid } from "@/components/StylesGrid";
import { allServices, getServiceBySlug } from "@/data/services";
import { getAPIService, getAPIServices } from "@/lib/server-api";

export function generateStaticParams() {
  return allServices.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try API first
  const apiService = await getAPIService(slug);
  const apiAllServices = await getAPIServices();

  // Map API data to match the shape the template expects
  const service = apiService
    ? {
        slug: apiService.slug,
        name: apiService.name,
        description: apiService.description,
        imageUrl: apiService.image_url || "/images/products/french-curls-honey-cocoa.jpg",
        styles: apiService.styles.map((s) => ({
          slug: s.slug,
          name: s.name,
          description: s.description,
          price: `${s.price_from}`,
          vipPrice: s.vip_price ? `${s.vip_price}` : undefined,
          duration: s.duration,
          imageUrl: s.image_url || "/images/products/french-curls-honey-cocoa.jpg",
          images: (s.images ?? []).map((img) => img.image_url).filter(Boolean),
          options: {
            lengths: s.lengths.length > 0 ? s.lengths : undefined,
            colors: s.colors.length > 0 ? s.colors : undefined,
            types: s.types.length > 0 ? s.types : undefined,
          },
        })),
      }
    : getServiceBySlug(slug);

  const otherServices = apiAllServices.length > 0
    ? apiAllServices
        .filter((s) => s.slug !== slug)
        .map((s) => ({
          slug: s.slug,
          name: s.name,
          imageUrl: s.image_url || "/images/products/french-curls-honey-cocoa.jpg",
        }))
    : allServices.filter((s) => s.slug !== slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{
          paddingTop: 120,
          paddingBottom: 80,
          fontFamily: "var(--font-jost), Jost, sans-serif",
          backgroundColor: "#FDFAF6",
        }}
      >
        {/* Breadcrumb */}
        <nav
          className="mx-auto max-w-[1200px] px-4 pt-6 pb-2"
          style={{ fontSize: 13, color: "#686868" }}
        >
          <Link href="/" className="transition-colors hover:text-[#8B5E3C]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/services"
            className="transition-colors hover:text-[#8B5E3C]"
          >
            Services
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: "#282828" }}>{service.name}</span>
        </nav>

        {/* Service Header */}
        <div
          className="mx-auto max-w-[1200px] px-4"
          style={{ paddingTop: 32, paddingBottom: 48 }}
        >
          <h1
            className="text-center"
            style={{
              fontSize: 40,
              fontWeight: 400,
              color: "#5C3D28",
              marginBottom: 16,
              fontFamily: "var(--font-playfair), Playfair Display, serif",
            }}
          >
            {service.name}
          </h1>
          <p
            className="mx-auto text-center"
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "#686868",
              maxWidth: 650,
            }}
          >
            {service.description}
          </p>
        </div>

        {/* Styles Grid */}
        <div className="mx-auto max-w-[1200px] px-4">
          <StylesGrid styles={service.styles} serviceSlug={service.slug} />
        </div>

        {/* Other Services */}
        <div
          className="mx-auto max-w-[1200px] px-4"
          style={{ paddingTop: 80, paddingBottom: 40 }}
        >
          <h2
            className="text-center uppercase"
            style={{
              fontSize: 20,
              letterSpacing: "0.15em",
              color: "#282828",
              fontWeight: 400,
              marginBottom: 40,
            }}
          >
            Other Services
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {otherServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group block"
                >
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "1/1", borderRadius: 10 }}
                  >
                    <Image
                      src={s.imageUrl}
                      alt={s.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                      }}
                    >
                      <span
                        className="text-white"
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {s.name}
                      </span>
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
