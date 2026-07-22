"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies";

type GoogleTranslationConfig = {
  defaultLanguage: string;
  languages: { name: string; title: string }[];
};

declare global {
  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__?: GoogleTranslationConfig;
  }
}

const COOKIE_NAME = "googtrans";

const LanguageSwitcherComponent = () => {
  const [currentLang, setCurrentLang] = useState("nl");
  const [config, setConfig] = useState<GoogleTranslationConfig | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleConfig = () => {
      const translationConfig = window.__GOOGLE_TRANSLATION_CONFIG__;
      if (!translationConfig) return;
      setConfig(translationConfig);
      const cookie = parseCookies()[COOKIE_NAME];
      const lang = cookie?.split("/")?.[2] || translationConfig.defaultLanguage;
      setCurrentLang(lang);
    };

    if (window.__GOOGLE_TRANSLATION_CONFIG__) {
      handleConfig();
    }

    window.addEventListener("translationConfigReady", handleConfig);
    return () => window.removeEventListener("translationConfigReady", handleConfig);
  }, []);

  const switchLang = (lang: string) => {
    setCookie(undefined, COOKIE_NAME, `/auto/${lang}`, { path: "/" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  if (!config) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {config.languages.map((l) => (
        <button
          key={l.name}
          onClick={() => switchLang(l.name)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            currentLang === l.name
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {l.title}
        </button>
      ))}
    </div>
  );
};

const LanguageSwitcher = dynamic(() => Promise.resolve(LanguageSwitcherComponent), { ssr: false });

export default LanguageSwitcher;
