"use client";

import { translationConfig, Language } from "@/lib/translation";
import { useLanguage } from "@/provider/TranslateProvider";

interface LanguageSwitcherProps {
  variant?: "compact" | "full";
  className?: string;
}

export default function LanguageSwitcher({ variant = "full", className = "" }: LanguageSwitcherProps) {
  const { language, changeLanguage, isTranslating } = useLanguage();

  if (variant === "compact") {
    return (
      <div
        className={`notranslate inline-flex items-center p-0.5 rounded-full bg-gray-100 border border-gray-200 select-none ${className}`}
        translate="no"
        role="group"
        aria-label={language === "en" ? "Select Language" : "Selecteer Taal"}
      >
        {translationConfig.languages.map(({ name, title }) => {
          const isActive = language === name;
          return (
            <button
              key={name}
              type="button"
              lang={name}
              disabled={isTranslating}
              aria-pressed={isActive}
              onClick={() => changeLanguage(name as Language)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-green-700 hover:bg-gray-200/60"
              }`}
              title={title}
            >
              {name.toUpperCase()}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`notranslate flex items-center justify-center gap-2 p-2 flex-wrap ${className}`}
      translate="no"
      role="group"
      aria-label={language === "en" ? "Select Language" : "Selecteer Taal"}
    >
      <span className="text-xs font-medium text-gray-500 mr-1 hidden sm:inline">
        {language === "en" ? "Language:" : "Taal:"}
      </span>
      <div className="inline-flex items-center p-1 rounded-lg bg-gray-100 border border-gray-200 gap-1">
        {translationConfig.languages.map(({ name, title }) => {
          const isActive = language === name;
          return (
            <button
              key={name}
              type="button"
              lang={name}
              disabled={isTranslating}
              aria-pressed={isActive}
              onClick={() => changeLanguage(name as Language)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-700 hover:text-green-700 hover:bg-white"
              }`}
            >
              {title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
