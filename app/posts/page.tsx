'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import CardList from '../components/Posts/CardList';
import RequireAuth from '../components/RequireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface DataPohon {
  id: number;
  nama_pemohon: string;
  jenis_pohon: string;
  jumlah_pohon: number;
  lokasi: string;
  foto_url: string;
  keterangan: string;
  created_at: string;
}

const Posts = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<DataPohon[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<DataPohon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('datapohon').select('*');
      if (error) {
        console.error('Error fetching posts:', error.message);
        setError('Gagal mengambil data');
      } else {
        setPosts(data || []);
        setFilteredPosts(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = posts.filter((post) =>
      post.nama_pemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.jenis_pohon.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  return (
    <RequireAuth>
      <div className="p-4 bg-gray-800 min-h-screen text-white">
        <div className="flex justify-between items-center mb-4">
          <strong className="text-gray-300 text-2xl">DATA POHON</strong>
          {userEmail && <p className="text-sm text-gray-400">Login sebagai: {userEmail}</p>}
        </div>

        <nav className="mb-6">
          <Link href="/" className="mx-2 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition">Home</Link>
          <Link href="/InputPage" className="mx-2 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition">Input Data</Link>
          <button onClick={handleLogout} className="mx-2 text-red-600 border px-2 py-1 rounded hover:bg-red-600 hover:text-gray-800 transition cursor-pointer">Logout</button>
        </nav>

        <input
          type="text"
          placeholder="Cari berdasarkan nama pemohon atau jenis pohon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded w-full md:w-1/2 mb-6 text-grey-800"
        />

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && filteredPosts.length === 0 && (
          <p>Tidak ada data yang cocok.</p>
        )}

        <CardList>
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="border-2 border-fuchsia-600 p-4 m-2 rounded-lg bg-white text-black"
            >
              <h2 className="text-xl font-bold">{post.nama_pemohon}</h2>
              <p><strong>Jenis:</strong> {post.jenis_pohon}</p>
              <p><strong>Jumlah:</strong> {post.jumlah_pohon}</p>
              <p><strong>Lokasi:</strong> {post.lokasi}</p>
              <p><strong>Keterangan:</strong> {post.keterangan}</p>
              <p><strong>Tanggal:</strong> {new Date(post.created_at).toLocaleDateString()}</p>
              {post.foto_url && (
                <img src={post.foto_url} alt="Foto Pohon" className="mt-2 w-40 h-auto rounded" />
              )}
            </div>
          ))}
        </CardList>
      </div>
    </RequireAuth>
  );
};

export default Posts;
