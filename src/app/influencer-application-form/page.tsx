import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const collaborationOptions = [
  "Gifting",
  "Paid Collabs",
  "Affiliate",
  "Ambassador Programs",
  "Sponsored Post",
];

export default function InfluencerApplicationPage() {
  return (
    <>
      <Header />

      <main className="w-full bg-white" style={{ paddingTop: 170, paddingBottom: 80 }}>
        <div className="mx-auto max-w-7xl px-4">
          {/* Page heading */}
          <h1
            className="text-center uppercase"
            style={{
              fontSize: "28px",
              fontWeight: 400,
              letterSpacing: "0.2em",
              color: "#282828",
            }}
          >
            Influencers
          </h1>
          <p
            className="text-center"
            style={{
              fontSize: "16px",
              color: "#686868",
              marginBottom: "40px",
            }}
          >
            Application Form
          </p>

          {/* Form */}
          <form
            className="mx-auto w-full"
            style={{ maxWidth: "600px" }}
            action="#"
          >
            {/* Contact Information */}
            <h2
              className="uppercase"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#282828",
                marginTop: "32px",
                marginBottom: "16px",
              }}
            >
              Contact Information
            </h2>

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              Full Name <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              required
              className="block w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
              }}
            />

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              Email Address <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="email"
              required
              className="block w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
              }}
            />

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              className="block w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
              }}
            />

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              Location: City, Country <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              required
              className="block w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
              }}
            />

            {/* Social Media */}
            <h2
              className="uppercase"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#282828",
                marginTop: "32px",
                marginBottom: "16px",
              }}
            >
              Social Media
            </h2>

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              Instagram Handle
            </label>
            <input
              type="text"
              className="block w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
              }}
            />

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              TikTok Handle
            </label>
            <input
              type="text"
              className="block w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
              }}
            />

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              YouTube Handle
            </label>
            <input
              type="text"
              className="block w-full outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
              }}
            />

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              Other Platforms (Twitter, Pinterest, Blog, etc.)
            </label>
            <textarea
              className="block w-full resize-none outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
                height: "100px",
              }}
            />

            {/* Collaboration Preferences */}
            <h2
              className="uppercase"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#282828",
                marginTop: "32px",
                marginBottom: "16px",
              }}
            >
              Collaboration Preferences
            </h2>

            <div
              className="flex flex-wrap items-center"
              style={{ gap: "24px", marginBottom: "12px" }}
            >
              {collaborationOptions.map((option) => (
                <label
                  key={option}
                  className="inline-flex cursor-pointer items-center gap-2"
                  style={{ fontSize: "13px", color: "#686868" }}
                >
                  <input type="checkbox" />
                  {option}
                </label>
              ))}
            </div>

            {/* Rate Card / Pricing */}
            <h2
              className="uppercase"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#282828",
                marginTop: "32px",
                marginBottom: "16px",
              }}
            >
              Rate Card / Pricing
            </h2>

            <label
              className="block"
              style={{ fontSize: "13px", color: "#686868", marginBottom: "4px" }}
            >
              Share your rates (optional)
            </label>
            <textarea
              className="block w-full resize-none outline-none"
              style={{
                border: "1px solid #ddd",
                padding: "12px 16px",
                fontSize: "14px",
                marginBottom: "12px",
                borderRadius: 0,
                height: "100px",
              }}
            />

            {/* Submit */}
            <button
              type="button"
              className="w-full cursor-pointer uppercase"
              style={{
                backgroundColor: "#282828",
                color: "white",
                padding: "14px 40px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                marginTop: "24px",
                border: "none",
              }}
            >
              Submit Application
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
