import Header from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import React from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Sidebar />
      <main className="ml-80 min-h-screen pt-20">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
