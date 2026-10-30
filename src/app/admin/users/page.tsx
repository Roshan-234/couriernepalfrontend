"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { errorMessage } from "@/lib/api";
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  status: string;
}
export default function Page() {
  const { user: current } = useAuth();
  const cache = useQueryClient();
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  async function changeStatus(user: User, status: string) {
    setBusy(user.id); setMessage("");
    try {
      await api.put(`/users/${user.id}`, { status });
      await cache.invalidateQueries({ queryKey: ["users"] });
      setMessage("Account status saved.");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(null); }
  }
  const {
    data = [],
    error,
    isLoading,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
  });
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Customer directory</h1>
      {message && <p role="status" className="mb-4">{message}</p>}
      <div className="panel overflow-x-auto">
        {isLoading ? (
          <p role="status">Loading users…</p>
        ) : error ? (
          <p role="alert">{errorMessage(error)}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Name", "Email", "Roles", "Status"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-3 py-4">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-3 py-4">{user.email}</td>
                  <td className="px-3 py-4">{user.roles.join(", ")}</td>
                  <td className="px-3 py-4"><select aria-label={`Account status for ${user.email}`} className="field" value={user.status} disabled={busy !== null || user.id === current?.id || (user.roles.includes("super_admin") && !current?.roles.includes("super_admin"))} onChange={event => changeStatus(user, event.target.value)}>{["active", "inactive", "suspended", "pending"].map(status => <option key={status} value={status}>{status}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
