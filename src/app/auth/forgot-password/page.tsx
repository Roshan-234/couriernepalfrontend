'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [msg, setMsg]       = useState<string|null>(null);
  const [err, setErr]       = useState<string|null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      const { data } = await api.post('/auth/password-reset', { email });
      setMsg(data.msg);
    } catch (e: any) {
      setErr(e.response?.data?.msg || 'Error sending link');
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      {msg && <p className="text-green-600">{msg}</p>}
      {err && <p className="text-red-600">{err}</p>}
      <form onSubmit={handle} className="space-y-4">
        <input
          type="email" placeholder="you@example.com"
          value={email} onChange={e=>setEmail(e.target.value)}
          className="w-full p-2 border rounded" required
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Send Reset Link</button>
      </form>
    </>
  );
}
