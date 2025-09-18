"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { api, CreateServiceRequest } from '../../../services/api';

export default function NewServicePage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<CreateServiceRequest>({ name: '', price: 0, availability: true });
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && (!user || user.role !== 'admin')) {
    if (typeof window !== 'undefined') router.replace('/login');
  }

  const update = (key: keyof CreateServiceRequest, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    const res = await api.createService(token, form);
    setSubmitting(false);
    if (!res.success) { setError(res.error || 'Failed to create'); return; }
    router.replace('/services');
  };

  useEffect(() => {
    (async () => {
      const res = await api.listCategories();
      if (res.success) setCategories(res.data || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await api.listServiceTypes(form.categoryId);
      if (res.success) setTypes(res.data || []);
    })();
  }, [form.categoryId]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Service</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      <form onSubmit={submit} className="bg-white/80 dark:bg-black/20 p-4 rounded-xl">
        <label className="block text-sm font-medium">Name</label>
        <input className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={form.name} onChange={(e) => update('name', e.target.value)} required />

        <label className="block text-sm font-medium">Price</label>
        <input type="number" className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={form.price} onChange={(e) => update('price', Number(e.target.value))} required />

        <label className="block text-sm font-medium">Description</label>
        <textarea className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={form.description || ''} onChange={(e) => update('description', e.target.value)} />

        <label className="block text-sm font-medium">Category</label>
        <select className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={form.categoryId ?? ''} onChange={(e) => update('categoryId', e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label className="block text-sm font-medium">Service Type</label>
        <select className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={form.serviceTypeId ?? ''} onChange={(e) => update('serviceTypeId', e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">Select type</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <label className="block text-sm font-medium">Duration (minutes)</label>
        <input type="number" className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={form.durationMinutes || 0} onChange={(e) => update('durationMinutes', Number(e.target.value))} />

        <label className="block text-sm font-medium">Available</label>
        <select className="mt-1 w-full border rounded px-3 py-2 mb-4 text-black" value={form.availability ? 'true' : 'false'} onChange={(e) => update('availability', e.target.value === 'true')}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <button disabled={submitting} className="bg-black text-white px-4 py-2 rounded font-semibold disabled:opacity-50">{submitting ? 'Creating…' : 'Create Service'}</button>
      </form>
    </div>
  );
}


