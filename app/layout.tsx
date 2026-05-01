import type { Metadata } from "next";
import "./globals.css";
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
      <body className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </body>
    </html>
  );
}
