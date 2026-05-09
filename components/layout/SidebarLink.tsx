"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
}

export function SidebarLink({ href, label, icon: Icon, collapsed }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
        isActive
          ? "border-l-[3px] border-tadeo-cyan bg-white/[0.08] text-white"
          : "border-l-[3px] border-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {collapsed ? (
        <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {label}
        </span>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </Link>
  );
}
