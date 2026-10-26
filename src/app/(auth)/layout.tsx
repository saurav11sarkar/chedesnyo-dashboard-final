import React from "react";
import LanguageSwitcher from "@/components/language-switcher";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitcher variant="compact" />
      </div>
      {children}
    </div>
  );
}

export default Layout;
