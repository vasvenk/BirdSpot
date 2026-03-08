"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/map", label: "Map", icon: Compass },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-xl px-4 pb-4 pt-2">
      <div className="grid grid-cols-3 gap-2 rounded-[28px] border border-white/70 bg-[color:var(--color-card)]/95 p-2 shadow-[0_18px_50px_rgba(59,92,68,0.18)] backdrop-blur">
        {tabs.map((tab) => {
          const active =
            tab.href === "/" ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold transition",
                active
                  ? "bg-[color:var(--color-forest)] text-white"
                  : "text-[color:var(--color-forest)]/75 hover:bg-[color:var(--color-moss)]/12",
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
