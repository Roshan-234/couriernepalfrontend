"use client";
import { useQuery } from "@tanstack/react-query";
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
                  <td className="px-3 py-4 capitalize">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
