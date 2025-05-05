'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import CardList from '../components/Posts/CardList';
import '../globals.css';


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
  const [posts, setPosts] = useState<DataPohon[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<DataPohon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const filtered = posts.filter((post) => {
      return (
        post.nama_pemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.jenis_pohon.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  return (
    <div className="p-4">
      <h1 className="text-fuchsia-600 text-2xl mb-4">Data Pohon</h1>
      <nav className="mb-6">
        <Link href="/" className="mx-2 text-blue-400 hover:underline">Home</Link>
        <Link href="/posts" className="mx-2 text-blue-400 hover:underline">Input Data</Link>
        <Link href="/datas" className="mx-2 text-blue-400 hover:underline">Data Pohon</Link>
      </nav>

      <input
        type="text"
        placeholder="Cari berdasarkan nama pemohon atau jenis pohon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-3 py-2 border rounded w-full md:w-1/2 mb-6"
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
  );
};

export default Posts;
