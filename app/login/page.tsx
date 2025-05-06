'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return alert('Email dan password wajib diisi');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert('Login gagal: ' + error.message);

    router.push('/posts');
  };

  // Cek jika sudah login
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/posts');
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded bg-gray-700 border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded bg-gray-700 border border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          Login
        </button>
        <button
          type="button"
          className="bg-gray-600 hover:bg-gray-700 p-2 rounded"
          onClick={() => router.push('/register')}
        >
          Belum punya akun? Daftar
        </button>
      </form>
    </div>
  );
}
