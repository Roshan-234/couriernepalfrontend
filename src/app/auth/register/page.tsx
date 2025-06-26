'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', phone:'', password:'', confirm:'' });
  const [err, setErr] = useState<string|null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (form.password !== form.confirm) return setErr("Passwords don't match");
    try {
      await api.post('/auth/register', {
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        phone:      form.phone,
        password:   form.password
      });
      router.push('/auth/login');
    } catch (e: any) {
      setErr(e.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      {err && <p className="text-red-600">{err}</p>}
      <form onSubmit={handle} className="space-y-4">
        {['first_name','last_name','email','phone','password','confirm'].map(name => (
          <div key={name}>
            <input
              name={name}
              type={name.includes('password') ? 'password' : name==='email'?'email':'text'}
              placeholder={name.replace('_',' ')}
              required
              value={(form as any)[name]}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
        <button className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
      </form>
    </>
  );
}
