'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalPohon, setTotalPohon] = useState(0);
  const [totalPemohon, setTotalPemohon] = useState(0);
  const [dataChart, setDataChart] = useState<{ tanggal: string; jumlah: number }[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login');
      } else {
        fetchData().finally(() => setLoading(false));
      }
    });
  }, [router]);

  async function fetchData() {
    const { data, error } = await supabase.from('datapohon').select('*');

    if (error || !data) {
      console.error('Gagal mengambil data:', error);
      return;
    }

    const total = data.reduce((sum, item) => sum + item.jumlah_pohon, 0);
    setTotalPohon(total);

    const pemohonSet = new Set(data.map(item => item.nama_pemohon));
    setTotalPemohon(pemohonSet.size);

    const grouped = data.reduce((acc, item) => {
      const tanggal = new Date(item.tanggal_survey).toISOString().split('T')[0];
      acc[tanggal] = (acc[tanggal] || 0) + item.jumlah_pohon;
      return acc;
    }, {} as Record<string, number>);

    const chart = Object.entries(grouped).map(([tanggal, jumlah]) => ({
      tanggal,
      jumlah: jumlah as number,
    }));

    setDataChart(chart);
  }

  return (
    <div className="p-6">
      <nav className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold flex-shrink-0">Dashboard Monitoring</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="font-medium bg-blue-300 border border-gray-300 px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition duration-300">Home</Link>
          <Link href="/posts" className="font-medium bg-green-300 border border-gray-300 px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition duration-300">Data Pohon</Link>
          <Link href="/InputPage" className="font-medium bg-orange-300 border border-gray-300 px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition duration-300">Input Data</Link>
          <button onClick={handleLogout} className="bg-red-600 border px-2 py-1 rounded hover:bg-red-700 hover:text-gray-300 transition cursor-pointer">Logout</button>
        </div>
      </nav>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-200 rounded shadow p-4">
              <h2 className="text-lg">Total Pohon</h2>
              <p className="text-3xl font-bold text-green-600">{totalPohon}</p>
            </div>
            <div className="bg-gray-200 rounded shadow p-4">
              <h2 className="text-lg">Total Pemohon</h2>
              <p className="text-3xl font-bold text-blue-600">{totalPemohon}</p>
            </div>
          </div>
          <div className="bg-gray-200 rounded shadow p-4">
            <h2 className="text-lg mb-2">Grafik Jumlah Pohon per Tanggal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataChart}>
                <XAxis dataKey="tanggal" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
