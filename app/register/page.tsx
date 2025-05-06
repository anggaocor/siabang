'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert('Gagal register: ' + error.message);
    alert('Registrasi berhasil, silakan login');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <h2 className="text-xl">Register</h2>
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded">Register</button>
      </form>
    </div>
  );
}
