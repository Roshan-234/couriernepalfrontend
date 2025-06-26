'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();

  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [msg, setMsg]                   = useState<string|null>(null);
  const [err, setErr]                   = useState<string|null>(null);

  useEffect(() => {
    if (!token) setErr('Invalid link');
  }, [token]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    if (password !== confirm) return setErr("Passwords don't match");
    try {
      const { data } = await api.post('/auth/password-reset/confirm', { token, password });
      setMsg(data.msg);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (e: any) {
      setErr(e.response?.data?.msg || 'Reset failed');
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      {msg && <p className="text-green-600">{msg}</p>}
      {err && <p className="text-red-600">{err}</p>}
      {!err && (
        <form onSubmit={handle} className="space-y-4">
          <input
            type="password" placeholder="New Password"
            value={password} onChange={e=>setPassword(e.target.value)}
            className="w-full p-2 border rounded" required
          />
          <input
            type="password" placeholder="Confirm New Password"
            value={confirm} onChange={e=>setConfirm(e.target.value)}
            className="w-full p-2 border rounded" required
          />
          <button className="w-full bg-green-600 text-white p-2 rounded">Reset Password</button>
        </form>
      )}
    </>
  );
}
