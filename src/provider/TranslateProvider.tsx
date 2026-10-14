"use client";

import Script from "next/script";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Language, readLanguage, saveLanguage, translationConfig } from "@/lib/translation";

type TranslateElementConstructor = new (
  options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean; multilanguagePage: boolean },
  elementId: string,
) => unknown;

declare global {
  interface Window {
    TranslateInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: TranslateElementConstructor;
      };
    };
    __GOOGLE_TRANSLATION_CONFIG__?: typeof translationConfig;
  }
}

type LanguageContextValue = {
  language: Language;
  changeLanguage: (language: Language) => void;
  isTranslating: boolean;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: translationConfig.defaultLanguage,
  changeLanguage: () => {},
  isTranslating: false,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function TranslateProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(translationConfig.defaultLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const initialized = useRef(false);
  const translateInstanceRef = useRef<any>(null);

  const triggerGoogleTranslation = useCallback((targetLang: Language): boolean => {
    if (typeof document === "undefined") return false;

    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");

    if (targetLang === translationConfig.defaultLanguage) {
      // Revert to default language (Nederlands)
      try {
        if (typeof translateInstanceRef.current?.restore === "function") {
          translateInstanceRef.current.restore();
        }
      } catch {
        // Ignore instance restore errors
      }

      try {
        const bannerFrame = document.querySelector<HTMLIFrameElement>("iframe.goog-te-banner-frame");
        if (bannerFrame?.contentDocument) {
          const restoreBtn = bannerFrame.contentDocument.querySelector<HTMLElement>(
            'button[id*="restore"], .goog-te-button button, a[id*="restore"]'
          );
          if (restoreBtn) {
            restoreBtn.click();
          }
        }
      } catch {
        // Ignore cross-origin frame access errors
      }

      if (select) {
        const EventCtor = select.ownerDocument.defaultView?.Event ?? Event;
        let restored = false;
        for (let i = 0; i < select.options.length; i++) {
          const opt = select.options[i];
          if (opt.value === "" || opt.value === targetLang) {
            select.selectedIndex = i;
            select.value = opt.value;
            select.dispatchEvent(new EventCtor("change", { bubbles: true }));
            restored = true;
            break;
          }
        }
        if (!restored) {
          select.selectedIndex = 0;
          select.value = select.options[0]?.value ?? "";
          select.dispatchEvent(new EventCtor("change", { bubbles: true }));
        }
      }

      document.documentElement.classList.remove("translated-ltr", "translated-rtl");
      return true;
    } else {
      // Translate to target language (e.g. English)
      // 1. Direct engine call with force flag to translate all dynamic nodes
      try {
        const elementInst = translateInstanceRef.current ?? (window as any).google?.translate?.TranslateElement?.getInstance?.();
        if (elementInst?.G && typeof elementInst.G.Ed === "function") {
          elementInst.G.Ed("auto", targetLang, () => {}, document.documentElement, true);
        }
      } catch {
        // Ignore internal engine errors
      }

      // 2. Drive the combo select
      if (!select) return false;

      const EventCtor = select.ownerDocument.defaultView?.Event ?? Event;

      // If already on targetLang and forced (e.g. new dynamic data arrived),
      // momentarily reset then re-set to force Google Translate to re-scan newly added nodes
      if (select.value === targetLang) {
        select.value = "";
        select.dispatchEvent(new EventCtor("change", { bubbles: true }));
      }

      for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        if (opt.value === targetLang) {
          select.selectedIndex = i;
          select.value = targetLang;
          select.dispatchEvent(new EventCtor("change", { bubbles: true }));
          return true;
        }
      }
      return false;
    }
  }, []);

  const initialize = useCallback(() => {
    const element = document.getElementById("google_translate_element");
    const TranslateElement = window.google?.translate?.TranslateElement;
    if (!element || !TranslateElement || initialized.current) return;

    // Reuse a widget across development effect replays and script callbacks.
    if (element.querySelector(".goog-te-combo")) {
      initialized.current = true;
      return;
    }

    initialized.current = true;
    try {
      translateInstanceRef.current = new TranslateElement({
        pageLanguage: translationConfig.defaultLanguage,
        includedLanguages: translationConfig.languages.map(({ name }) => name).join(","),
        autoDisplay: false,
        multilanguagePage: true,
      }, "google_translate_element");
    } catch {
      initialized.current = false;
      setScriptFailed(true);
    }
  }, []);

  useEffect(() => {
    const selectedLanguage = readLanguage(document.cookie);
    saveLanguage(selectedLanguage);
    setLanguage(selectedLanguage);
    document.documentElement.lang = selectedLanguage;
    window.__GOOGLE_TRANSLATION_CONFIG__ = translationConfig;

    const previousCallback = window.TranslateInit;
    window.TranslateInit = initialize;
    initialize();
    // Load the script only after hydration and the callback are ready.
    setMounted(true);

    return () => {
      if (window.TranslateInit === initialize) window.TranslateInit = previousCallback;
    };
  }, [initialize]);

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
    };
  }, []);

  // Route change listener to keep translated language persistent without full page reload
  useEffect(() => {
    const handleRouteChange = () => {
      if (language !== translationConfig.defaultLanguage && initialized.current) {
        setTimeout(() => {
          triggerGoogleTranslation(language);
        }, 150);
      }
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, [language, triggerGoogleTranslation]);

  // Dynamic content observer: Automatically translates newly added nodes (e.g. from TanStack Query / API)
  useEffect(() => {
    if (language === translationConfig.defaultLanguage || !mounted) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let isProcessing = false;

    const observer = new MutationObserver((mutations) => {
      if (isProcessing) return;

      let hasNewDynamicContent = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) {
              const el = node as HTMLElement;
              const tagName = el.tagName;
              if (
                tagName === "FONT" ||
                tagName === "SCRIPT" ||
                tagName === "STYLE" ||
                tagName === "IFRAME" ||
                el.id === "google_translate_element" ||
                el.classList.contains("skiptranslate") ||
                el.classList.contains("notranslate")
              ) {
                continue;
              }
              hasNewDynamicContent = true;
              break;
            }
          }
        }
        if (hasNewDynamicContent) break;
      }

      if (hasNewDynamicContent) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          isProcessing = true;
          triggerGoogleTranslation(language);
          setTimeout(() => {
            isProcessing = false;
          }, 350);
        }, 150);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [language, mounted, triggerGoogleTranslation]);

  const changeLanguage = useCallback((nextLanguage: Language) => {
    if (nextLanguage === language) return;

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);

    // 1. Immediately persist cookies and state
    saveLanguage(nextLanguage);
    setLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage;

    // 2. Trigger smooth visual transition (no reload!)
    setIsTranslating(true);

    // 3. Trigger DOM translation
    const applied = triggerGoogleTranslation(nextLanguage);
    if (!applied) {
      let attempts = 0;
      retryIntervalRef.current = setInterval(() => {
        attempts++;
        if (triggerGoogleTranslation(nextLanguage) || attempts >= 20) {
          if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
        }
      }, 50);
    }

    // 4. Smoothly restore full opacity after translation has settled
    transitionTimerRef.current = setTimeout(() => {
      setIsTranslating(false);
      transitionTimerRef.current = null;
    }, 300);
  }, [language, triggerGoogleTranslation]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isTranslating }}>
      <div id="google_translate_element" className="notranslate" translate="no" aria-hidden="true" />
      {/* Sleek top micro-progress bar during translation */}
      {isTranslating && (
        <div
          className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 animate-pulse pointer-events-none"
          role="progressbar"
          aria-label="Translating content..."
        />
      )}
      <div
        className={`site-smooth-container transition-all duration-300 ease-in-out ${
          isTranslating ? "opacity-25 blur-[1px] pointer-events-none" : "opacity-100 blur-0"
        }`}
      >
        {children}
      </div>
      {scriptFailed && language !== translationConfig.defaultLanguage && (
        <p role="status" className="notranslate fixed bottom-3 left-3 z-50 rounded bg-white p-3 text-sm shadow" translate="no">
          Translation could not be loaded. Please refresh to try again.
        </p>
      )}
      {mounted && (
        <Script
          id="google-translate-script"
          src="https://translate.google.com/translate_a/element.js?cb=TranslateInit"
          strategy="afterInteractive"
          onReady={initialize}
          onError={() => setScriptFailed(true)}
        />
      )}
    </LanguageContext.Provider>
  );
}
