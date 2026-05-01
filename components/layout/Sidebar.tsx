"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { SidebarLink } from "./SidebarLink";
import { NAV_ITEMS } from "@/lib/constants";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex h-screen flex-col bg-tadeo-blueDark transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ position: "sticky", top: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-tadeo-yellow">
          <ShieldCheck className="h-5 w-5 text-tadeo-blue" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-tadeo-yellow">
              Utadeo
            </p>
            <p className="truncate text-sm font-black text-white">SafeCampus AI</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
