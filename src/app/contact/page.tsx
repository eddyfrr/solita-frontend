import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="bg-white" style={{ paddingTop: 150, paddingBottom: 80 }}>
        <div className="mx-auto max-w-[600px] px-4 text-center">
          <h1
            className="text-center"
            style={{
              fontSize: 48,
              fontWeight: 400,
              color: "#5C3D28",
              marginBottom: 40,
              fontFamily: "var(--font-playfair), Playfair Display, serif",
            }}
          >
            Contact Us
          </h1>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#8B5E3C",
              fontFamily: "var(--font-jost), sans-serif",
              marginBottom: 16,
            }}
          >
            hello@solitabeautybar.com
          </h2>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#8B5E3C",
              fontFamily: "var(--font-jost), sans-serif",
              marginBottom: 16,
            }}
          >
            +255 XXX XXX XXX
          </h2>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#282828",
              fontFamily: "var(--font-jost), sans-serif",
              marginBottom: 32,
            }}
          >
            Solita Beauty Bar, Dar es Salaam, Tanzania
          </h2>

          {/* CTA heading */}
          <h2
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#282828",
              fontFamily: "var(--font-jost), sans-serif",
              marginBottom: 40,
            }}
          >
            We would love to hear from you. Do drop us a line
          </h2>

          {/* Contact form */}
          <form>
            <input
              type="text"
              placeholder="Fullname"
              className="w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: 14,
                marginBottom: 16,
                borderRadius: 0,
              }}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: 14,
                marginBottom: 16,
                borderRadius: 0,
              }}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: 14,
                marginBottom: 16,
                borderRadius: 0,
              }}
            />
            <textarea
              placeholder="Message"
              className="w-full resize-none outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: 14,
                marginBottom: 16,
                borderRadius: 0,
                height: 150,
              }}
            />
            <div>
              <button
                type="submit"
                className="uppercase transition-opacity duration-300 hover:opacity-90"
                style={{
                  backgroundColor: "#8B5E3C",
                  color: "white",
                  padding: "14px 40px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
