import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function InfoPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 170, paddingBottom: 80, backgroundColor: "#FDFAF6" }}>
        <div className="mx-auto max-w-[800px] px-4">
          {/* Page heading */}
          <h1
            className="mb-12 text-center uppercase"
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: "#5C3D28",
              fontFamily: "var(--font-playfair), Playfair Display, serif",
            }}
          >
            Information
          </h1>

          {/* Section 1: Delivery */}
          <section
            id="delivery"
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: 40,
            }}
          >
            <h2
              className="uppercase"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#282828",
                letterSpacing: "0.1em",
                marginTop: 48,
              }}
            >
              Delivery
            </h2>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#686868", marginTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                Lagos Deliveries
              </h3>
              <p>
                We fulfil lagos deliveries the next business day after the order is placed.
              </p>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                Abuja
              </h3>
              <p>
                We offer same-day delivery in Abuja for purchases made before 12 pm. Orders made
                after the cut off time are delivered the next business day.
              </p>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                Other Nigerian States
              </h3>
              <p>
                Orders to other states in Nigeria are fulfilled within 2-4 business days.
              </p>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                International Orders
              </h3>
              <p>
                International orders are fulfilled by DHL, Shipping time is determined by the
                shipping speed chosen.
              </p>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                Please Note
              </h3>
              <ul className="ml-5 list-disc" style={{ marginTop: 8 }}>
                <li>
                  The company is not responsible for delays caused by adverse weather conditions,
                  incomplete delivery addresses, or any other circumstances beyond our reasonable
                  control.
                </li>
                <li>
                  Same-day delivery is subject to call confirmation to verify courier availability.
                </li>
                <li>
                  Prices exclude import fees and taxes that may be imposed by the customer&apos;s
                  country.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Payment Method */}
          <section
            id="payment"
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: 40,
            }}
          >
            <h2
              className="uppercase"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#282828",
                letterSpacing: "0.1em",
                marginTop: 48,
              }}
            >
              Payment Method
            </h2>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#686868", marginTop: 16 }}>
              <p>
                To ensure that we offer our customers a safe and easy transaction platform,
                we&apos;ve chosen gateways that suit our customers from all over the world.
              </p>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                We Accept
              </h3>
              <ul className="ml-5 list-disc" style={{ marginTop: 8 }}>
                <li>MasterCard</li>
                <li>VISA NAIRA Card</li>
                <li>Verve Card</li>
                <li>PayPal Payment</li>
                <li>Direct Bank Transfer</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Shipping Policy */}
          <section
            id="shipping"
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: 40,
            }}
          >
            <h2
              className="uppercase"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#282828",
                letterSpacing: "0.1em",
                marginTop: 48,
              }}
            >
              Shipping Policy
            </h2>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#686868", marginTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                Local Delivery (Abuja)
              </h3>
              <p>
                Same day delivery for orders placed before 1pm. Orders placed after the cut off
                time will be delivered the next business day.
              </p>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                Delivery Within Nigeria
              </h3>
              <p>Delivery within Nigeria is via DHL.</p>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                International Delivery
              </h3>
              <p>International delivery is via DHL.</p>
            </div>
          </section>

          {/* Section 4: Return & Exchange Policy */}
          <section
            id="return"
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: 40,
            }}
          >
            <h2
              className="uppercase"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#282828",
                letterSpacing: "0.1em",
                marginTop: 48,
              }}
            >
              Return &amp; Exchange Policy
            </h2>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#686868", marginTop: 16 }}>
              <p>
                We do not offer exchanges or refunds. However if you receive a faulty package we
                will exchange the item. The item must be reported faulty within 24 hours after
                receipt.
              </p>
            </div>
          </section>

          {/* Section 5: Hair Care */}
          <section id="care">
            <h2
              className="uppercase"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#282828",
                letterSpacing: "0.1em",
                marginTop: 48,
              }}
            >
              Hair Care
            </h2>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#686868", marginTop: 16 }}>
              {/* Human Hair Care */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                Human Hair Care
              </h3>
              <ul className="ml-5 list-disc" style={{ marginTop: 8 }}>
                <li>
                  Our hair requires a technical and professional braider for the best results.
                </li>
                <li>
                  After braiding, no mousse or hot water is needed. Simply spray with water and
                  leave-in conditioner, then air dry.
                </li>
                <li>
                  For maintenance, use a spray bottle with a mix of water and leave-in conditioner.
                </li>
                <li>Professional loosening is required when removing the braids.</li>
                <li>With proper care, our hair is durable and long-lasting.</li>
              </ul>

              {/* How to Braid Solita Curl */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                How to Braid Solita Curl
              </h3>
              <ul className="ml-5 list-disc" style={{ marginTop: 8 }}>
                <li>Use a professional braider for best results.</li>
                <li>Bundles come ready to braid — no additional preparation needed.</li>
                <li>Blow-dry your own hair before braiding.</li>
                <li>
                  Braid and tie the tips. If you plan to reuse, leave out 10-12cm at the ends.
                </li>
                <li>Apply mousse and Solita Braid cream after braiding.</li>
                <li>Do not use hot water or heat on the hair.</li>
              </ul>

              {/* How to Braid Solita Deep Wave */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                How to Braid Solita Deep Wave
              </h3>
              <ul className="ml-5 list-disc" style={{ marginTop: 8 }}>
                <li>Use a professional braider for best results.</li>
                <li>Bundles come ready to braid.</li>
                <li>Blow-dry your own hair before braiding.</li>
                <li>Braid and tie tips; leave out 3-7cm at the ends if reusing.</li>
                <li>Apply mousse and Solita Braid cream after braiding.</li>
                <li>Do not use hot water or heat on the hair.</li>
              </ul>

              {/* How to Braid Solita Bone Straight */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                How to Braid Solita Bone Straight
              </h3>
              <ul className="ml-5 list-disc" style={{ marginTop: 8 }}>
                <li>Braid to the tips — no leave-out required.</li>
                <li>Apply mousse and Solita Braid cream after braiding.</li>
                <li>Do not use hot water or heat on the hair.</li>
              </ul>

              {/* After Braiding */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                After Braiding
              </h3>
              <p>
                Apply Solita Braid cream daily — use a pea-size amount per section. Apply mousse
                every 5-7 days to maintain definition and shine.
              </p>

              {/* How to Reuse */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                How to Reuse
              </h3>
              <ul className="ml-5 list-disc" style={{ marginTop: 8 }}>
                <li>Have the hair professionally removed.</li>
                <li>Wash thoroughly and air dry.</li>
                <li>Solita Curl can be reused 1-2 times.</li>
                <li>Solita Bone Straight can be reused 1-4 times.</li>
              </ul>

              {/* Contact */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282828", marginTop: 24 }}>
                Contact Us
              </h3>
              <p>
                For further inquiries, reach us at:
              </p>
              <ul className="ml-5 list-disc" style={{ marginTop: 8 }}>
                <li>Phone: +234 908 200 0069</li>
                <li>Instagram: @solitabeautybar</li>
                <li>
                  Email:{" "}
                  <a
                    href="mailto:hello@solitabeautybar.com"
                    className="underline hover:text-[#8B5E3C]"
                  >
                    hello@solitabeautybar.com
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
