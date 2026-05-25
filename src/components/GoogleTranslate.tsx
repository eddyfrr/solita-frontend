"use client";

import Script from "next/script";
import { useEffect } from "react";

// Google Translate widget — translates the entire visible page (including
// DB-driven content) in-place. We hide its default banner and drive language
// selection via the `googtrans` cookie from <LanguageSelector />.

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
  }, []);

  return (
    <>
      {/* The widget mounts here. Hidden visually — we expose our own toggle. */}
      <div id="google_translate_element" aria-hidden="true" style={{ display: "none" }} />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
