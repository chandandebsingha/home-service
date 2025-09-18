"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && user.role === 'admin') router.replace('/dashboard');
    else router.replace('/login');
  }, [loading, user, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="text-center opacity-70">Redirecting…</div>
    </div>
  );
}
