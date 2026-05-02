import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import { LayoutShell } from "@/components/layout/LayoutShell";

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
      <body>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
