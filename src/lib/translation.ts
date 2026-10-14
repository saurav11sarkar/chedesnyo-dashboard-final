export const translationConfig = {
  defaultLanguage: "nl",
  languages: [
    { name: "nl", title: "Nederlands" },
    { name: "en", title: "English" },
  ],
} as const;

export type Language = (typeof translationConfig.languages)[number]["name"];

export const LANGUAGE_COOKIE = "site-language";
export const GOOGLE_TRANSLATE_COOKIE = "googtrans";

export function isLanguage(value: unknown): value is Language {
  return translationConfig.languages.some((language) => language.name === value);
}

export function readLanguage(cookieHeader: string): Language {
  const cookies = cookieHeader.split(";").map((cookie) => {
    const separator = cookie.indexOf("=");
    const name = cookie.slice(0, separator).trim();
    let value = cookie.slice(separator + 1).trim();
    try {
      value = decodeURIComponent(value);
    } catch {
      // Ignore malformed legacy cookies instead of breaking the switcher.
    }
    return { name, value };
  });

  const savedLanguage = cookies.find((cookie) => cookie.name === LANGUAGE_COOKIE)?.value;
  if (isLanguage(savedLanguage)) return savedLanguage;

  const googleLanguage = cookies
    .filter((cookie) => cookie.name === GOOGLE_TRANSLATE_COOKIE)
    .map((cookie) => cookie.value.split("/")[2])
    .find(isLanguage);

  return googleLanguage ?? translationConfig.defaultLanguage;
}

export function cookieDomains(hostname: string): string[] {
  if (!hostname.includes(".") || /^[\d.]+$/.test(hostname) || hostname.includes(":")) {
    return [];
  }

  const parts = hostname.split(".");
  return parts.slice(0, -1).map((_, index) => parts.slice(index).join("."));
}

export function saveLanguage(language: Language): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const options = `; Path=/; SameSite=Lax${secure}`;

  // Clear older target cookies so they cannot override the newly selected language
  document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=; Max-Age=0${options}`;
  for (const domain of cookieDomains(window.location.hostname)) {
    document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=; Max-Age=0; Domain=${domain}${options}`;
  }

  const lifetime = "; Max-Age=31536000";
  document.cookie = `${LANGUAGE_COOKIE}=${language}${lifetime}${options}`;
  document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=/nl/${language}${lifetime}${options}`;
}
