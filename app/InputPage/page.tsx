'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { createClient } from "@supabase/supabase-js";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InputPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama_pemohon: "",
    jenis_pohon: "",
    jumlah_pohon: "",
    lokasi: "",
    foto: null as File | null,
    tanggal_survey: "",
    keterangan: "",
  });

  // Proteksi: hanya bisa diakses jika sudah login
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkSession();
  }, [router]);

  function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setFormData((prev) => ({ ...prev, lokasi: `${latitude},${longitude}` }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Anda harus login terlebih dahulu.");
      setUploading(false);
      router.push("/login");
      return;
    }

    if (formData.jumlah_pohon <= "") {
      alert("Jumlah pohon harus lebih dari 0");
      setUploading(false);
      return;
    }

    let foto_url = "";
    if (formData.foto) {
      const fileExt = formData.foto.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("foto-pohon")
        .upload(fileName, formData.foto);

      if (uploadError || !uploadData) {
        console.error('Upload error:', uploadError);
        alert("Upload foto gagal: " + (uploadError?.message || "Tidak diketahui."));
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("foto-pohon")
        .getPublicUrl(fileName);
      foto_url = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("datapohon").insert({
      nama_pemohon: formData.nama_pemohon,
      jenis_pohon: formData.jenis_pohon,
      jumlah_pohon: formData.jumlah_pohon,
      lokasi: formData.lokasi,
      foto_url,
      tanggal_survey: formData.tanggal_survey,
      keterangan: formData.keterangan,
    });

    if (!error) {
      alert("Data berhasil disimpan!");
      setFormData({
        nama_pemohon: "",
        jenis_pohon: "",
        jumlah_pohon: "",
        lokasi: "",
        foto: null,
        tanggal_survey: "",
        keterangan: "",
      });
      setPreviewUrl(null);
    }
    setUploading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "jumlah_pohon" ? parseInt(value) || 0 : value
    }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <nav className="p-3 bg-gray-800 text-white">
        <Link href="/" className="mx-2 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition">Home</Link>
        <Link href="/posts" className="mx-2 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition">Data Pohon</Link>
        <button onClick={handleLogout} className="mx-2 text-red-600 border px-2 py-1 rounded hover:bg-red-600 hover:text-gray-800 transition cursor-pointer">Logout</button>
      </nav>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
        <main className="max-w-xl mx-auto p-4 bg-gray-600 text-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">INPUT DATA POHON</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="nama_pemohon" placeholder="Nama Pemohon" className="w-full p-2 border" onChange={handleChange} value={formData.nama_pemohon} required />
            <input name="jenis_pohon" placeholder="Jenis Pohon" className="w-full p-2 border" onChange={handleChange} value={formData.jenis_pohon} required />
            <input name="jumlah_pohon" type="number" min="1" placeholder="Jumlah Pohon" className="w-full p-2 border" onChange={handleChange} value={formData.jumlah_pohon} required />
            <input name="lokasi" placeholder="Lokasi (GPS)" className="w-full p-2 border" onChange={handleChange} value={formData.lokasi} required />
            <button type="button" onClick={detectLocation} className="mx-2 text-grey-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition cursor-pointer">Deteksi Lokasi Otomatis</button>
            <input name="tanggal_survey" type="date" className="w-full p-2 border" onChange={handleChange} value={formData.tanggal_survey} required />
            <textarea name="keterangan" placeholder="Keterangan" className="w-full p-2 border" onChange={handleChange} value={formData.keterangan} />
            <div className="space-y-2 border p-2 rounded">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, foto: file });
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => setPreviewUrl(event.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {previewUrl && (
                <Image src={previewUrl} alt="Preview" width={100} height={100} className="w-5 h-auto mt-2 rounded" />
              )}
            </div>
            <button disabled={uploading} className="mx-2 text-grey-300 border bg-blue-600 px-2 py-1 rounded hover:text-gray-800 transition cursor-pointer">
              {uploading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
