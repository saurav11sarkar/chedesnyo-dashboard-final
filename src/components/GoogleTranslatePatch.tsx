"use client";

import { useEffect } from "react";
import { installGoogleTranslateDomPatch } from "@/lib/google-translate-dom";

const HIDE_GOOGLE_TRANSLATE_CSS = `
body > .skiptranslate,
iframe.goog-te-banner-frame,
iframe.skiptranslate,
.goog-te-banner-frame,
.goog-te-balloon-frame,
#goog-gt-tt,
#goog-gt-vt,
.goog-tooltip,
.goog-tooltip:hover,
.goog-text-highlight,
.VIpgJd-ZVi9od-ORHb-OEVmcd,
.VIpgJd-ZVi9od-l4eHX-hSRGPd,
.VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
.VIpgJd-y60Sfe-gGGt0e,
[class*="VIpgJd"],
div[id^="goog-gt-"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
  border: none !important;
}

body {
  top: 0px !important;
  position: static !important;
}

#google_translate_element {
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

font[style*="vertical-align: inherit"] {
  background-color: transparent !important;
  box-shadow: none !important;
}

.translated-ltr,
.translated-rtl {
  margin-top: 0px !important;
}
`;

export default function GoogleTranslatePatch() {
  useEffect(() => {
    const styleId = "hide-google-translate-style";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style && typeof document !== "undefined") {
      style = document.createElement("style");
      style.id = styleId;
      style.textContent = HIDE_GOOGLE_TRANSLATE_CSS;
      document.head.appendChild(style);
    }

    return installGoogleTranslateDomPatch(document.body);
  }, []);

  return null;
}
