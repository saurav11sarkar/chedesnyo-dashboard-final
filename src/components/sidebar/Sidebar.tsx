"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  Factory,
  FileText,
  Flag,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Share2,
  Trophy,
  UsersRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import LogoutModal from "../Dialog/LogOutModal";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Revenue from Sales user", href: "/revenue-sales-user", icon: BarChart3 },
  { name: "Assignments Request", href: "/assignments-request", icon: ClipboardList },
  { name: "Courses Request", href: "/courses-request", icon: GraduationCap },
  { name: "Business representative User", href: "/business-representative-user", icon: BriefcaseBusiness },
  { name: "Sales Representative User", href: "/seles-representative-user", icon: UsersRound },
  { name: "Industry List", href: "/industry-list", icon: Factory },
  { name: "Blog Management", href: "/blog-management", icon: FileText },
  { name: "Reports Management", href: "/reports", icon: Flag },
  { name: "Payout Management", href: "/payout-management", icon: Wallet },
  { name: "Referral Management", href: "/referral-management", icon: Share2 },
  { name: "Promotion Management", href: "/promotion-management", icon: Megaphone },
  { name: "Leaderboard", href: "/leaderboard-management", icon: Trophy },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(15,23,42,0.06)]">
      <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-6">
        <Link href="/" className="relative block h-12 w-32" aria-label="Chedesnyo dashboard home">
          <Image
            src="/images/chedsnyoLogo.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </Link>
      </div>

      <nav
        aria-label="Dashboard navigation"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span
                className={cn(
                  "leading-5 transition-colors duration-200",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-100 p-3">
        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          onClick={() => setIsLogoutOpen(true)}
        >
          <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Log Out</span>
        </button>
      </div>

      <LogoutModal isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </aside>
  );
}
