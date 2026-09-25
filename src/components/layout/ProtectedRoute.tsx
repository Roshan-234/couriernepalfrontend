"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
export default function ProtectedRoute({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [loading, user, router]);
  if (loading || !user)
    return (
      <div className="p-12 text-center" role="status">
        Loading your account…
      </div>
    );
  if (admin && !user.is_admin)
    return (
      <div className="p-12 text-center">
        This page is available to administrators only.
      </div>
    );
  return <>{children}</>;
}
