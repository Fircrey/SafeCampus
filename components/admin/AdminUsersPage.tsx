"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { User, UserRole } from "@/lib/types";
import { fetchUsers, updateUser } from "@/lib/flask-client";
import { useAuth } from "@/components/auth/AuthContext";

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Usuario",
  admin: "Admin",
  superadmin: "Super Admin",
};

const ROLE_COLORS: Record<UserRole, string> = {
  user: "bg-slate-100 text-slate-600",
  admin: "bg-blue-100 text-blue-700",
  superadmin: "bg-purple-100 text-purple-700",
};

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id: number, role: UserRole) {
    try {
      const updated = await updateUser(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch { /* ignore */ }
  }

  async function handleToggleActive(id: number, isActive: boolean) {
    try {
      const updated = await updateUser(id, { is_active: !isActive });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch { /* ignore */ }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-tadeo-blue text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">Super Admin</p>
            <h1 className="text-xl font-black text-tadeo-ink">Gestión de Usuarios</h1>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No hay usuarios.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Rol</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-medium text-tadeo-ink">{u.name}</td>
                    <td className="px-3 py-3 text-slate-600">{u.email}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-semibold ${u.is_active ? "text-green-600" : "text-red-500"}`}>
                        {u.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {currentUser?.id === u.id ? (
                        <span className="text-xs text-slate-400 italic">Tu cuenta</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs"
                          >
                            {Object.entries(ROLE_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                            className={`rounded px-2 py-1 text-xs font-semibold ${
                              u.is_active
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {u.is_active ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
