"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut, Grip, ShoppingBasket, Flag, Wallet, Share2, Megaphone, Trophy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import LogoutModal from "../Dialog/LogOutModal";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Revenue from Sales user", href: "/revenue-sales-user", icon: LayoutDashboard },
  { name: "Assignments Request", href: "/assignments-request", icon: LayoutDashboard },
  { name: "Courses Request", href: "/courses-request", icon: Grip },
  { name: "Business representative User", href: "/business-representative-user", icon: ShoppingBasket },
  { name: "Sales Representative User", href: "/seles-representative-user", icon: ShoppingBasket },
  { name: "Industry List", href: "/industry-list", icon: ShoppingBasket },
  { name: "Blog Management", href: "/blog-management", icon: ShoppingBasket },
  { name: "Reports Management", href: "/reports", icon: Flag },
  { name: "Payout Management", href: "/payout-management", icon: Wallet },
  { name: "Referral Management", href: "/referral-management", icon: Share2 },
  { name: "Promotion Management", href: "/promotion-management", icon: Megaphone },
  { name: "Leaderboard", href: "/leaderboard-management", icon: Trophy },
  { name: "Settings", href: "/settings", icon: ShoppingBasket },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="flex h-screen sticky top-0 w-[420px] flex-col z-50 shadow-[0px_16px_48px_0px_#00000029] bg-gray-50">
      {/* Logo */}
      <div className="h-[100px] flex items-center justify-center px-4 my-7">
        <div className="h-full w-32 relative">
          <Image
            src="/images/chedsnyoLogo.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 flex flex-col items-center justify-start overflow-y-auto mt-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex w-full mx-auto items-center justify-start gap-3 px-5 py-3.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#0080001A] text-[#008000]"
                  : "text-[#5B6574] hover:bg-slate-600/50 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-colors duration-200",
                  isActive ? "text-[#008000]" : ""
                )}
              />
              <span
                className={cn(
                  "font-normal text-[20px] leading-[120%] transition-colors duration-200",
                  isActive ? "text-[#008000] font-medium" : ""
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout fixed at bottom */}
      <div className="p-3">
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer 
                     bg-gradient-to-r from-red-500/10 to-transparent 
                     text-red-600 font-semibold text-base transition-all duration-300 
                     hover:from-red-600 hover:to-red-700 hover:text-white hover:shadow-md"
          onClick={() => setIsLogoutOpen(true)}
        >
          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          <span>Log Out</span>
        </div>
      </div>

      {/* Logout modal */}
      <LogoutModal isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </div>
  );
}
