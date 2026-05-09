"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthContext";
import { hasMinRole } from "@/lib/auth-utils";

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Lock body scroll + Escape to close
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKey);
      };
    }
  }, [open]);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.minRole || hasMinRole(user?.role, item.minRole)
  );

  return (
    <>
      {/* Top bar — solo visible en mobile */}
      <header className="md:hidden flex items-center justify-between bg-tadeo-blueDark px-4 py-3">
        <div className="flex items-center gap-2">
          <img
            src="/cabito-icon.png"
            alt="Cabito"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-sm font-black text-white">SafeCampus AI</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-slate-300 hover:text-white"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Cerrar menú"
          />
          {/* Panel */}
          <nav className="relative z-10 flex w-64 flex-col bg-tadeo-blueDark p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/cabito-icon.png"
                  alt="Cabito"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-sm font-black text-white">SafeCampus AI</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex-1 space-y-1">
              {visibleItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? "border-l-[3px] border-tadeo-cyan bg-white/[0.08] text-white"
                          : "border-l-[3px] border-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* User + Logout */}
            {user && (
              <div className="border-t border-white/10 pt-3 mt-3">
                <p className="mb-2 truncate text-xs text-slate-400">{user.name}</p>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
