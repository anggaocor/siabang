'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import CardList from '../components/CardList';
import RequireAuth from '../components/RequireAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface DataPohon {
  id: number;
  nama_pemohon: string;
  perihal: string;
  jenis_pohon: string;
  jumlah_pohon: number;
  lokasi: string;
  tanggal_survey: string;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<DataPohon>>({});

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
      } else {
        router.push('/login');
      }
    };
    getUser();
  }, [router]);

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

  const startEditing = (post: DataPohon) => {
    setEditingId(post.id);
    setEditData({ ...post });
  };

  const handleUpdate = async (id: number) => {
    const confirmUpdate = confirm('Simpan perubahan?');
    if (!confirmUpdate) return;

    const { error } = await supabase
      .from('datapohon')
      .update({
        nama_pemohon: editData.nama_pemohon,
        perihal: editData.perihal,
        jenis_pohon: editData.jenis_pohon,
        jumlah_pohon: editData.jumlah_pohon,
        lokasi: editData.lokasi,
        tanggal_survey: editData.tanggal_survey,
        keterangan: editData.keterangan
      })
      .eq('id', id);

    if (error) {
      alert('Gagal memperbarui data');
    } else {
      const updated = posts.map((p) =>
        p.id === id ? { ...p, ...editData } as DataPohon : p
      );
      setPosts(updated);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm('Yakin ingin menghapus data ini?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('datapohon').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus data');
    } else {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

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
          className="px-3 py-2 border rounded w-full md:w-1/2 mb-6 text-black bg-gray-100"
        />

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && filteredPosts.length === 0 && (
          <p>Tidak ada data yang cocok.</p>
        )}

        <CardList>
          {filteredPosts.map((post) => {
            const isEditing = post.id === editingId;
            return (
              <div
                key={post.id}
                className="border-2 border-fuchsia-600 p-4 m-2 rounded-lg bg-white text-black"
              >
                {isEditing ? (
                  <>
                    <label className="text-lg font-bold">Edit Data</label>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Nama Pemohon</label>
                      <input
                      type="text"
                      value={editData.nama_pemohon || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, nama_pemohon: e.target.value })
                      }
                      className="w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Perihal</label>
                      <input
                      type="text"
                      value={editData.perihal || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, perihal: e.target.value })
                      }
                      className="w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Jenis Pohon</label>
                      <input
                      type="text"
                      value={editData.jenis_pohon || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, jenis_pohon: e.target.value })
                      }
                      className="w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Jumlah Pohon</label>
                      <input
                      type="number"
                      value={editData.jumlah_pohon || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setEditData({
                        ...editData,
                        jumlah_pohon: isNaN(value) ? 0 : value
                        });
                      }}
                      className="w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className='mb-2'>
                      <label className="block text-sm font-medium text-gray-700">Lokasi (GPS)</label>
                      <input
                      type="text"
                      value={editData.lokasi || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, lokasi: e.target.value })
                      }
                      className="mb-2 w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tanggal Survey</label>
                      <input
                      type="text"
                      value={editData.tanggal_survey || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, tanggal_survey: e.target.value })
                      }
                      className="mb-2 w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                      <input
                      type="text"
                      value={editData.keterangan || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, keterangan: e.target.value })
                      }
                      className="mb-2 w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(post.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                      >
                        Batal
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{post.nama_pemohon}</h2>
                    <p><strong>Jenis:</strong> {post.jenis_pohon}</p>
                    <p><strong>Perihal:</strong> {post.perihal}</p>
                    <p><strong>Jumlah:</strong> {post.jumlah_pohon}</p>
                    <p><strong>Lokasi:</strong> {post.lokasi}</p>
                    <p><strong>Tanggal Survey:</strong> {post.tanggal_survey}</p>
                    <p><strong>Keterangan:</strong> {post.keterangan}</p>
                    <p><strong>Tanggal Input Data:</strong> {new Date(post.created_at).toLocaleDateString()}</p>
                    <Image
                      src={post.foto_url}
                      alt="Foto Pohon"
                      width={160}
                      height={160}
                      className="mt-2 rounded"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => startEditing(post)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Hapus
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </CardList>
      </div>
    </RequireAuth>
  );
};

export default Posts;
