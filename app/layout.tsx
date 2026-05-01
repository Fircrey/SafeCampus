import type { Metadata } from "next";
import "./globals.css";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "SafeCampus AI",
  description:
    "Demo de seguridad, convivencia y bienestar con IA para campus universitario."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col md:flex-row">
        <MobileHeader />
        <Sidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </body>
    </html>
  );
}
