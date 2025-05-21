"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InputPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama_pemohon: "",
    perihal: "",
    tanggal_surat: "",
    jenis_pohon: "",
    jumlah_pohon: "",
    kondisi_pohon: "",
    lokasi: "",
    tanggal_survey: "",
    rekomendasi: "",
    foto: null as File | null,
    keterangan: "",
  });

  // Proteksi: hanya bisa diakses jika sudah login
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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

    const {
      data: { session },
    } = await supabase.auth.getSession();
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
        console.error("Upload error:", uploadError);
        alert(
          "Upload foto gagal: " + (uploadError?.message || "Tidak diketahui.")
        );
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
      perihal: formData.perihal,
      tanggal_surat: formData.tanggal_surat,
      jenis_pohon: formData.jenis_pohon,
      jumlah_pohon: formData.jumlah_pohon,
      kondisi_pohon: formData.kondisi_pohon,
      lokasi: formData.lokasi,
      tanggal_survey: formData.tanggal_survey,
      rekomendasi: formData.rekomendasi,
      foto_url,
      keterangan: formData.keterangan,
    });

    if (!error) {
      alert("Data berhasil disimpan!");
      setFormData({
        nama_pemohon: "",
        perihal: "",
        tanggal_surat: "",
        jenis_pohon: "",
        jumlah_pohon: "",
        kondisi_pohon: "",
        lokasi: "",
        tanggal_survey: "",
        rekomendasi: "",
        foto: null,
        keterangan: "",
      });
      setPreviewUrl(null);
    }
    setUploading(false);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "jumlah_pohon" ? parseInt(value) || 0 : value,
    }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <nav className="p-3 bg-gray-800 text-white flex flex-wrap justify-center sm:justify-start gap-2">
        <Link
          href="/"
          className="bg-gray-500 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="bg-gray-500 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition"
        >
          Dashboard Monitoring
        </Link>
        <Link
          href="/posts"
          className="bg-gray-500 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition"
        >
          Data Pohon
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-600 border px-2 py-1 rounded hover:bg-red-300 hover:text-gray-800 transition cursor-pointer"
        >
          Logout
        </button>
      </nav>
      <div className="flex flex-col items-center justify-center min-h-auto bg-gray-800 text-white">
        <main className="max-w-screen mx-auto p-4 bg-gray-600 text-white rounded-lg shadow-md mb-20 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">INPUT DATA POHON</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Nama Pemohon
            </label>
            <input
              name="nama_pemohon"
              placeholder="Nama Pemohon"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.nama_pemohon}
              required
            />
            <label className="block text-sm font-medium text-gray-300">
              Perihal
            </label>
            <input
              name="perihal"
              placeholder="Perihal"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.perihal}
              required
            />
            <label
              htmlFor="tanggal_surat"
              className="block text-sm font-medium text-gray-300"
            >
              Tanggal Surat
            </label>
            <input
              name="tanggal_surat"
              type="date"
              placeholder="Tanggal Surat"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.tanggal_surat}
              required
            />
            <label className="block text-sm font-medium text-gray-300">
              Jenis Pohon
            </label>
            <input
              name="jenis_pohon"
              placeholder="Jenis Pohon"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.jenis_pohon}
              required
            />
            <label className="block text-sm font-medium text-gray-300">
              Jumlah Pohon
            </label>
            <input
              name="jumlah_pohon"
              type="number"
              min="1"
              placeholder="Jumlah Pohon"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.jumlah_pohon}
              required
            />
            <label className="kondisi_pohon block text-sm font-medium text-gray-300">
              Kondisi Pohon
            </label>
            <input
              name="kondisi_pohon"
              placeholder="Kondisi Pohon"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.kondisi_pohon}
              required
            />
            <label className="block text-sm font-medium text-gray-300">
              Lokasi (GPS)
            </label>
            <input
              name="lokasi"
              placeholder="Lokasi (GPS)"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.lokasi}
              required
            />
            <button
              type="button"
              onClick={detectLocation}
              className="w-full sm:w-auto bg-blue-600 text-gray-300 border px-2 py-1 rounded-md hover:bg-gray-300 hover:text-gray-800 transition cursor-pointer"
            >
              Deteksi Lokasi Otomatis
            </button>
            <label className="block text-sm font-medium text-gray-300">
              Tanggal Survey
            </label>
            <input
              name="tanggal_survey"
              type="date"
              placeholder="Tanggal Survey"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.tanggal_survey}
              required
            />
            <label className="block text-sm font-medium text-gray-300">
              Rekomendasi
            </label>
            <input
              name="rekomendasi"
              placeholder="Rekomendasi"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.rekomendasi}
              required
            />
            <label className="block text-sm font-medium text-gray-300">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              placeholder="Keterangan"
              className="w-full p-2 border rounded-md"
              onChange={handleChange}
              value={formData.keterangan}
            />
            <label className="block text-sm font-medium text-gray-300">
              Upload Foto
            </label>
            <button
              type="button"
              className="w-auto border px-2 py-2 rounded-md bg-gray-500 hover:text-gray-800 transition cursor-pointer text-sm"
            >
              <div className="flex flex-col sm:flex-row items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, foto: file });
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setPreviewUrl(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);

                      setUploading(true);

                      setTimeout(() => {
                        setUploading(false);
                        alert("Foto berhasil di-upload!");
                      }, 2000);
                    }
                  }}
                />
                {previewUrl && !uploading && (
                  <div className="mt-2 sm:mt-0 sm:ml-4">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="w-5 h-auto rounded"
                    />
                    <p className="mt-2 text-green-500 text-xs">
                      Foto Ter-upload
                    </p>
                  </div>
                )}
                {uploading && (
                  <div className="mt-2 sm:mt-0 sm:ml-4 text-yellow-500">
                    <p>Uploading...</p>
                  </div>
                )}
              </div>
            </button>
            <br />
            <button
              disabled={uploading}
              className="w-full sm:w-auto text-gray-300 border bg-green-600 px-2 py-1 rounded-md hover:text-gray-800 transition cursor-pointer"
            >
              {uploading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
