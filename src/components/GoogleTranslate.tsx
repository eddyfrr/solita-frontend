"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { readCookieLang } from "@/lib/language";

// Google Translate widget — translates the entire visible page (including
// DB-driven content) in-place. We hide its default banner and drive language
// selection via the `googtrans` cookie from <LanguageSelector />.
//
// PERFORMANCE: the widget is only loaded for visitors actually reading in
// Swahili. It is expensive out of proportion to its job — it pulls in four
// extra origins (translate.google.com, translate.googleapis.com, gstatic.com,
// fonts.gstatic.com) and was still fetching ~15s into a page load, on every
// page, for every visitor. English is the default, so the large majority were
// paying that cost for a script whose output they never saw.
//
// `applySiteLang()` writes the googtrans cookie and reloads, so by the time a
// translation is actually needed the cookie is set and this mounts the script.

interface GoogleTranslateApi {
  translate: {
    TranslateElement: new (
      options: {
        pageLanguage: string;
        includedLanguages?: string;
        autoDisplay?: boolean;
      },
      elementId: string,
    ) => void;
  };
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: GoogleTranslateApi;
  }
}

export function GoogleTranslate() {
  // Undefined until we've read the cookie on the client. Rendering the script
  // is deliberately deferred past hydration so it can never block first paint.
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,sw",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    if (readCookieLang() !== "EN") setTranslating(true);
  }, []);

  return (
    <>
      {/* The widget mounts here. Hidden visually — we expose our own toggle. */}
      <div id="google_translate_element" aria-hidden="true" style={{ display: "none" }} />
      {translating && (
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
