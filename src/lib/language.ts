// Shared Google Translate language helpers.
// Language is driven by the `googtrans` cookie that the Google Translate widget
// reads on page load. Both the desktop side-rail (<LanguageSelector />) and the
// mobile menu use these so the cookie logic lives in one place.

export const LANGS = [
  { code: "EN", googCode: "en", label: "English" },
  { code: "SW", googCode: "sw", label: "Kiswahili" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

export function readCookieLang(): LangCode {
  if (typeof document === "undefined") return "EN";
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!match) return "EN";
  const decoded = decodeURIComponent(match[1]);
  // Cookie format is "/<src>/<dst>" e.g. "/en/sw"
  const dst = decoded.split("/").pop();
  return dst === "sw" ? "SW" : "EN";
}

function writeCookieLang(googCode: string) {
  const value = `/en/${googCode}`;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `googtrans=${value}; path=/; expires=${expires}`;
  // Set on parent domain too so iframes the widget creates can read it.
  const host = window.location.hostname;
  if (host.includes(".") && host !== "localhost") {
    const parent = host.startsWith("www.") ? host.slice(4) : host;
    document.cookie = `googtrans=${value}; path=/; domain=.${parent}; expires=${expires}`;
  }
}

/** Persist the chosen language and reload so Google Translate applies it. */
export function applySiteLang(googCode: string) {
  writeCookieLang(googCode);
  window.location.reload();
}
