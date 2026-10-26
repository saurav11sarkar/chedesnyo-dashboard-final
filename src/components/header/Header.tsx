"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KeyRound, LogOut, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogoutModal from "@/components/Dialog/LogOutModal";
import LanguageSwitcher from "@/components/language-switcher";

export default function Header() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Admin";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!dropdownRef.current?.contains(target) && !accountButtonRef.current?.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed left-80 right-0 top-0 z-40 flex h-20 items-center justify-end border-b border-slate-200 bg-white px-6 shadow-sm lg:px-8">
      <div className="relative flex items-center gap-3">
        <LanguageSwitcher variant="compact" />

        <button
          ref={accountButtonRef}
          type="button"
          onClick={() => setIsDropdownOpen((open) => !open)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100"
        >
          <Avatar className="h-10 w-10 border border-gray-200">
            {user?.profileImage ? (
              <AvatarImage src={user.profileImage} alt={`${displayName}'s profile`} />
            ) : null}
            <AvatarFallback className="bg-green-100 font-semibold text-green-700">
              {initials || "A"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-44 sm:block">
            <span className="block truncate text-sm font-semibold text-gray-800">{displayName}</span>
            <span className="block truncate text-xs capitalize text-gray-500">{user?.role || "admin"}</span>
          </span>
        </button>

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <UserRound className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/update-password"
              role="menuitem"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <KeyRound className="h-4 w-4" />
              Change password
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsLogoutOpen(true);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>

      <LogoutModal isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </header>
  );
}
