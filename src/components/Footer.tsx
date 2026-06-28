import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { name: "Contact Us", href: "/contact" },
  { name: "Terms and Conditions", href: "/info/#terms" },
  { name: "Payment Method", href: "/info/#payment" },
  { name: "Delivery Policy", href: "/info/#delivery" },
  { name: "Return Policy", href: "/info/#return" },
  { name: "Hair Care", href: "/info/#care" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/solitabeautybar",
    icon: "/images/icons/fb-icon@2x.png",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/solita_beautybar/",
    icon: "/images/icons/ig-icon@2x.png",
  },
  {
    name: "Pinterest",
    href: "https://www.pinterest.com/solitabeautybar/",
    icon: "/images/icons/pnt-icon@2x.png",
  },
];

export function Footer() {
  return (
    <footer>
      {/* Main footer section */}
      <div
        className="w-full text-white"
        style={{ backgroundColor: "#8B5E3C", padding: "50px 0" }}
      >
        <div className="mx-auto max-w-[1340px] px-[15px]">
          <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left">
            {/* LEFT column */}
            <div className="mb-10 w-full lg:mb-0 lg:w-[60%]">
              <div className="mx-auto mb-8 flex flex-col items-center lg:mx-0 lg:items-start">
                <Image
                  src="/images/solita-logo.png"
                  alt="Solita Beauty Bar"
                  width={120}
                  height={120}
                  className="object-contain"
                  style={{
                    mixBlendMode: "lighten",
                    filter: "invert(1) brightness(1.8)",
                    opacity: 0.95,
                  }}
                />
              </div>

              <h3
                className="mb-4 font-normal"
                style={{
                  fontSize: "20px",
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                }}
              >
                ABOUT US
              </h3>
              <p
                className="mx-auto max-w-[400px] lg:mx-0"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.7,
                  opacity: 0.9,
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                }}
              >
                Solita Beauty Bar is a luxury beauty salon specializing in premium
                braiding hair, wigs, lashes, and styling services. We are dedicated
                to making every woman feel confident and beautiful. Visit us or
                shop online for the finest quality hair products.
              </p>

              <h3
                className="mb-4 mt-6 font-normal"
                style={{
                  fontSize: "16px",
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                }}
              >
                FOLLOW US
              </h3>
              <div className="mx-auto flex justify-center gap-3 lg:mx-0 lg:justify-start">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <Image
                      src={social.icon}
                      alt={social.name}
                      width={35}
                      height={35}
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* RIGHT column - Newsletter */}
            <div className="w-full lg:w-[40%]">
              <h3
                className="mb-1 font-normal"
                style={{
                  fontSize: "20px",
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                }}
              >
                Be The First To Know
              </h3>
              <p
                className="mb-5"
                style={{
                  fontSize: "14px",
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                }}
              >
                Subscribe to our mailing list
              </p>

              <div className="mx-auto max-w-[400px] lg:mx-0">
                <input
                  type="text"
                  placeholder="First Name"
                  className="mb-3 w-full bg-transparent px-4 py-[10px] text-[14px] text-white outline-none placeholder:text-white/60"
                  style={{
                    border: "1px solid rgba(255,255,255,0.5)",
                  }}
                />
                <input
                  type="email"
                  placeholder="Please enter your email address..."
                  className="w-full bg-transparent px-4 py-[10px] text-[14px] text-white outline-none placeholder:text-white/60"
                  style={{
                    border: "1px solid rgba(255,255,255,0.5)",
                  }}
                />
                <button
                  type="button"
                  className="mt-2 w-full py-3 text-[14px] font-bold uppercase text-white cursor-pointer"
                  style={{
                    backgroundColor: "#5C3D28",
                    letterSpacing: "0.1em",
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="w-full py-5" style={{ backgroundColor: "#FAF0E8" }}>
        <div className="mx-auto max-w-[1340px] px-[15px] text-center">
          <nav className="mb-[10px] flex flex-wrap items-center justify-center gap-5">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="transition-opacity hover:opacity-70"
                style={{
                  color: "#8B5E3C",
                  fontSize: "20px",
                  fontFamily: "var(--font-jost), Jost, sans-serif",
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <p
            style={{
              color: "#8B5E3C",
              fontSize: "14px",
              fontFamily: "var(--font-jost), Jost, sans-serif",
            }}
          >
            Copyright 2024 &copy; Solita Beauty Bar
            <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
            <Link
              href="/admin"
              className="transition-opacity hover:opacity-70"
              style={{ color: "#8B5E3C", opacity: 0.4 }}
            >
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
