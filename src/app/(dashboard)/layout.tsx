import Header from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import React from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="w-full mt-[100px] p-8">
         <div className="z-0">
           {children}
         </div>
        </div>
      </div>
    </>
  );
}

export default Layout;
