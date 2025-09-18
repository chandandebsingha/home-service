"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

export default function ServiceTypesPage() {
  const { user, token, loading } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [cats, typs] = await Promise.all([
        api.listCategories(),
        api.listServiceTypes(undefined),
      ]);
      if (cats.success) setCategories(cats.data || []);
      if (typs.success) setTypes(typs.data || []);
    })();
  }, []);

  const filteredTypes = useMemo(() => {
    if (!categoryId) return types;
    return types.filter((t) => t.categoryId === categoryId);
  }, [types, categoryId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !categoryId) return;
    setSubmitting(true);
    setError(null);
    const res = await api.createServiceType(token, { name: name.trim(), description: description.trim() || undefined, categoryId });
    setSubmitting(false);
    if (!res.success) { setError(res.error || 'Failed'); return; }
    setName('');
    setDescription('');
    const refreshed = await api.listServiceTypes(categoryId);
    if (refreshed.success) setTypes((prev) => {
      // merge update; for simplicity just replace when filtered
      const other = prev.filter((t) => t.categoryId !== categoryId);
      return [...other, ...(refreshed.data || [])];
    });
  };

  if (loading || !user) return <div className="p-6">Loading…</div>;
  if (user.role !== 'admin') return <div className="p-6">Unauthorized</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Service Types</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

      <div className="bg-white/80 dark:bg-black/20 rounded-xl p-4 mb-6">
        <div className="font-semibold mb-2">Add Service Type</div>
        <label className="block text-sm font-medium">Category</label>
        <select className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="block text-sm font-medium">Name</label>
        <input className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="block text-sm font-medium">Description</label>
        <textarea className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button disabled={submitting || !categoryId} className="bg-black text-white px-4 py-2 rounded font-semibold disabled:opacity-50">{submitting ? 'Creating…' : 'Create Type'}</button>
      </div>

      <div className="bg-white/80 dark:bg-black/20 rounded-xl">
        {filteredTypes.map((t) => (
          <div key={t.id} className="px-4 py-3 border-b last:border-b-0 border-black/10 dark:border-white/10">
            <div className="font-medium">{t.name}</div>
            {!!t.description && <div className="text-sm opacity-70">{t.description}</div>}
          </div>
        ))}
        {filteredTypes.length === 0 && <div className="p-6 text-sm opacity-70">No service types yet.</div>}
      </div>
    </div>
  );
}



