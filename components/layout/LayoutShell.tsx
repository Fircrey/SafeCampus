"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { MobileHeader } from "./MobileHeader";
import { Sidebar } from "./Sidebar";

const AUTH_PAGES = ["/login", "/register"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-tadeo-blue border-t-transparent" />
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileHeader />
      <Sidebar />
      <div key={pathname} className="page-transition flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
