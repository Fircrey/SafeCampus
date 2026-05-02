import {
  Bot,
  Camera,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  darkTheme?: boolean;
  minRole?: UserRole;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/detector", label: "Detector en Vivo", icon: Camera, darkTheme: true, minRole: "admin" },
  { href: "/chat", label: "Chat de Bienestar", icon: Bot },
  { href: "/rutas", label: "Rutas Institucionales", icon: MapPin },
  { href: "/admin/reports", label: "Panel Reportes", icon: ClipboardList, minRole: "admin" },
  { href: "/admin/users", label: "Gestión Usuarios", icon: Users, minRole: "superadmin" },
];

// URL directa para SocketIO (necesita conexion directa, no proxy HTTP)
export const FLASK_URL =
  process.env.NEXT_PUBLIC_FLASK_URL ?? "http://localhost:5000";

// El video feed va DIRECTO a Flask (sin proxy): <img> no tiene restricciones CORS
// y el proxy de Next.js no puede hacer streaming de multipart/x-mixed-replace.
// Las rutas REST sí van por el proxy para evitar CORS en fetch().
export const FLASK_VIDEO_FEED = `${FLASK_URL}/video_feed`;
export const FLASK_API_START = "/flask/api/start";
export const FLASK_API_STOP = "/flask/api/stop";
export const FLASK_API_STATS = "/flask/api/stats";
export const FLASK_API_HISTORY = "/flask/api/history";
export const FLASK_API_CLEAR = "/flask/api/clear-history";

// Auth & Reports
export const FLASK_API_AUTH_LOGIN = "/flask/api/auth/login";
export const FLASK_API_AUTH_REGISTER = "/flask/api/auth/register";
export const FLASK_API_AUTH_ME = "/flask/api/auth/me";
export const FLASK_API_REPORTS = "/flask/api/reports";
export const FLASK_API_ADMIN_USERS = "/flask/api/admin/users";
