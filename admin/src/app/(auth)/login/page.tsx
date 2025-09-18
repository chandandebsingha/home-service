"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) { setError(res.error || 'Login failed'); return; }
    router.replace('/dashboard');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white/80 dark:bg-black/20 backdrop-blur rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 w-full border rounded px-3 py-2 mb-3 text-black" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label className="block text-sm font-medium">Password</label>
        <input className="mt-1 w-full border rounded px-3 py-2 mb-4 text-black" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button disabled={loading} className="w-full bg-black text-white py-2 rounded font-semibold disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}


