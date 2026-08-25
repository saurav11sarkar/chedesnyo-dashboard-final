"use client";

import { useEffect } from "react";

export default function GoogleTranslatePatch() {
  useEffect(() => {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (child.parentNode) {
          child.parentNode.removeChild(child);
        }
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };

    const translateWindow = window as typeof window & {
      google?: {
        translate: {
          TranslateElement: new (
            options: Record<string, unknown>,
            elementId: string
          ) => unknown;
        };
      };
      googleTranslateElementInit?: () => void;
      __GOOGLE_TRANSLATION_CONFIG__?: Record<string, unknown>;
    };

    translateWindow.__GOOGLE_TRANSLATION_CONFIG__ = {
      languages: [
        { title: "Nederlands", name: "nl" },
        { title: "English", name: "en" },
      ],
      defaultLanguage: "nl",
    };

    translateWindow.googleTranslateElementInit = () => {
      if (!translateWindow.google) return;

      new translateWindow.google.translate.TranslateElement(
        {
          pageLanguage: "nl",
          includedLanguages: "nl,en",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    window.dispatchEvent(new Event("translationConfigReady"));

    // Loading the widget from an effect guarantees that React has hydrated the
    // server-rendered body before Google Translate starts mutating the DOM.
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-translate="true"]'
    );

    if (translateWindow.google) {
      translateWindow.googleTranslateElementInit();
    } else if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.dataset.googleTranslate = "true";
      document.head.appendChild(script);
    }

    return () => {
      Node.prototype.removeChild = originalRemoveChild;
      Node.prototype.insertBefore = originalInsertBefore;
      delete translateWindow.googleTranslateElementInit;
    };
  }, []);

  return null;
}
