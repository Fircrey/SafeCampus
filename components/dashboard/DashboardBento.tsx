"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { hasMinRole } from "@/lib/auth-utils";
import { HeroCard } from "./HeroCard";
import { SystemHealthCard } from "./SystemHealthCard";
import { ReportSummaryCard } from "./ReportSummaryCard";
import { ZoneActivityCard } from "./ZoneActivityCard";
import { LiveDetectionsCard } from "./LiveDetectionsCard";
import { QuickLinksGrid } from "./QuickLinksGrid";

export function DashboardBento() {
  const { user, loading } = useAuth();
  const isAdmin = hasMinRole(user?.role, "admin");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-tadeo-blue" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-tadeo-paper">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Row 1: Hero + System Health (admin only) */}
          <HeroCard
            className={isAdmin ? "md:col-span-2 lg:col-span-3" : "md:col-span-2 lg:col-span-4"}
            showStats={isAdmin}
          />
          {isAdmin && <SystemHealthCard className="md:col-span-1" />}

          {/* Row 2: Report Summary + Zone Activity (admin only) */}
          {isAdmin && (
            <>
              <ReportSummaryCard className="md:col-span-1 lg:col-span-2" />
              <ZoneActivityCard className="md:col-span-1 lg:col-span-2" />
            </>
          )}

          {/* Row 3: Live Detections (admin only) + Zone Activity (user) + Quick Links */}
          {isAdmin && (
            <LiveDetectionsCard className="md:col-span-1 lg:col-span-2" />
          )}
          {!isAdmin && (
            <ZoneActivityCard className="md:col-span-1 lg:col-span-2" />
          )}
          <QuickLinksGrid
            className={isAdmin ? "md:col-span-1 lg:col-span-2" : "md:col-span-1 lg:col-span-2"}
          />
        </div>

        {/* Legal footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          IA alerta, humanos deciden · Sistema académico demo · Universidad Jorge Tadeo Lozano
        </p>
      </div>
    </main>
  );
}
