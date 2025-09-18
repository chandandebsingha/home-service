"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { api, Service } from '../../services/api';

export default function ServicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.listServices();
      if (!mounted) return;
      if (res.success && res.data) setServices(res.data);
      else setError(res.error || 'Failed to load services');
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Services</h1>
        <Link className="bg-black text-white px-3 py-2 rounded" href="/services/new">Add Service</Link>
      </div>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      <div className="bg-white/80 dark:bg-black/20 rounded-xl">
        {services.map((s) => (
          <div key={s.id} className="px-4 py-3 border-b last:border-b-0 border-black/10 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm opacity-70">₹{s.price} • {s.serviceType || 'general'}</div>
            </div>
          </div>
        ))}
        {services.length === 0 && <div className="p-6 text-sm opacity-70">No services yet.</div>}
      </div>
    </div>
  );
}


