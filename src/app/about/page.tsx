import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main style={{ paddingTop: 150, paddingBottom: 80, paddingLeft: 20, paddingRight: 20, backgroundColor: "#FDFAF6" }}>
        <div className="mx-auto" style={{ maxWidth: 750 }}>
          <h1
            className="text-center"
            style={{
              fontSize: 48,
              fontWeight: 400,
              color: "#5C3D28",
              marginBottom: 50,
              fontFamily: "var(--font-playfair), Playfair Display, serif",
            }}
          >
            About
          </h1>

          <div
            className="text-center"
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "#686868",
              fontFamily: "var(--font-jost), Jost, sans-serif",
            }}
          >
            <p style={{ marginBottom: 30 }}>
              Solita Beauty Bar was founded with the mission of providing the
              highest quality beauty services and premium hair products. We are
              dedicated to redefining elegance and empowering women to feel
              their most confident. Our product line features carefully curated
              braiding hair extensions, luxury wigs, and professional lash
              services — all crafted to meet our uncompromising standards.
            </p>

            <p style={{ marginBottom: 30 }}>
              At Solita, we understand that beauty is personal. Whether
              you&apos;re looking for a bold new look or subtle enhancement,
              our team of expert stylists is here to bring your vision to life.
              From premium synthetic and human hair extensions to professional
              braiding and lash services, every detail matters to us.
            </p>

            <p>
              We invite you to experience the Solita difference — where luxury
              meets artistry. Visit our salon or shop online and discover why
              our clients keep coming back.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
