"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.replace('/login');
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    let mounted = true;
    if (!token) return;
    (async () => {
      const res = await api.adminStats(token);
      if (!mounted) return;
      if (res.success) setStats(res.data);
      else setError(res.error || 'Failed to load');
    })();
    return () => { mounted = false; };
  }, [token]);

  if (loading || !user) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-white/80 dark:bg-black/20 rounded-xl p-4 mb-6">
        <div className="font-semibold mb-2">Quick Actions</div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/services/new" className="px-3 py-2 rounded bg-black text-white text-sm">Add Service</Link>
          <Link href="/meta/categories" className="px-3 py-2 rounded bg-black text-white text-sm">Manage Categories</Link>
          <Link href="/meta/types" className="px-3 py-2 rounded bg-black text-white text-sm">Manage Service Types</Link>
        </div>
      </div>
      {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Users" value={stats?.counts?.users ?? '-'} />
        <StatCard title="Services" value={stats?.counts?.services ?? '-'} />
        <StatCard title="Bookings" value={stats?.counts?.bookings ?? '-'} />
      </div>

      <h2 className="text-lg font-semibold mb-2">Recent Bookings</h2>
      <div className="bg-white/80 dark:bg-black/20 rounded-xl p-4 mb-6">
        {(stats?.recent?.bookings || []).map((b: any) => (
          <div key={b.id} className="py-2 border-b last:border-b-0 border-black/10 dark:border-white/10">
            <div className="font-medium">Booking #{b.id}</div>
            <div className="text-sm opacity-70">{b.date} {b.time} • ₹{b.price}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-2">Recent Services</h2>
      <div className="bg-white/80 dark:bg-black/20 rounded-xl p-4">
        {(stats?.recent?.services || []).map((s: any) => (
          <div key={s.id} className="py-2 border-b last:border-b-0 border-black/10 dark:border-white/10">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm opacity-70">₹{s.price} • {s.serviceType || 'general'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/80 dark:bg-black/20 p-4">
      <div className="text-sm opacity-70">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}


