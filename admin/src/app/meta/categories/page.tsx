"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

export default function CategoriesPage() {
  const { user, token, loading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.listCategories();
      if (res.success) setItems(res.data || []);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    const res = await api.createCategory(token, { name: name.trim(), description: description.trim() || undefined });
    setSubmitting(false);
    if (!res.success) { setError(res.error || 'Failed'); return; }
    setName('');
    setDescription('');
    const refreshed = await api.listCategories();
    if (refreshed.success) setItems(refreshed.data || []);
  };

  if (loading || !user) return <div className="p-6">Loading…</div>;
  if (user.role !== 'admin') return <div className="p-6">Unauthorized</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Service Categories</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      <form onSubmit={submit} className="bg-white/80 dark:bg-black/20 rounded-xl p-4 mb-6">
        <div className="font-semibold mb-2">Add Category</div>
        <label className="block text-sm font-medium">Name</label>
        <input className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="block text-sm font-medium">Description</label>
        <textarea className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button disabled={submitting} className="bg-black text-white px-4 py-2 rounded font-semibold disabled:opacity-50">{submitting ? 'Creating…' : 'Create Category'}</button>
      </form>

      <div className="bg-white/80 dark:bg-black/20 rounded-xl">
        {items.map((c) => (
          <div key={c.id} className="px-4 py-3 border-b last:border-b-0 border-black/10 dark:border-white/10">
            <div className="font-medium">{c.name}</div>
            {!!c.description && <div className="text-sm opacity-70">{c.description}</div>}
          </div>
        ))}
        {items.length === 0 && <div className="p-6 text-sm opacity-70">No categories yet.</div>}
      </div>
    </div>
  );
}



