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
      <div className="grid grid-cols-3 gap-2 rounded-[28px] border border-[color:var(--color-soft-line)] bg-[color:var(--color-card)]/98 p-2 shadow-[0_18px_50px_rgba(44,72,46,0.14)] backdrop-blur">
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
                  ? "border border-black/5 bg-[color:var(--color-forest-strong)] text-[color:var(--color-on-forest)] shadow-[0_10px_24px_rgba(22,53,31,0.24)] [&_svg]:text-[color:var(--color-on-forest)]"
                  : "text-[color:var(--color-ink)] hover:bg-[color:var(--color-moss)]/12",
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
