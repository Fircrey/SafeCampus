"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { SidebarLink } from "./SidebarLink";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthContext";
import { hasMinRole } from "@/lib/auth-utils";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.minRole || hasMinRole(user?.role, item.minRole)
  );

  return (
    <aside
      className={`hidden md:flex h-screen flex-col bg-tadeo-blueDark transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ position: "sticky", top: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-4">
        <img
          src="/cabito-icon.png"
          alt="Cabito"
          className={`shrink-0 rounded-lg object-contain transition-all duration-300 ${collapsed ? "max-h-10 max-w-10" : "max-h-[72px] max-w-[72px]"}`}
        />
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
          {visibleItems.map((item) => (
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

      {/* User info + Logout */}
      {user && (
        <div className="border-t border-white/10 px-3 py-3">
          {!collapsed && (
            <p className="mb-1 truncate text-xs text-slate-400">{user.name}</p>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400 hover:bg-white/10 hover:text-white"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Salir</span>}
          </button>
        </div>
      )}

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
