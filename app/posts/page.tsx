"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CardList from "../components/CardList";
import RequireAuth from "../components/RequireAuth";
import { exportToExcel } from "@/utils/exportToExcel";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface DataPohon {
  id: number;
  nama_pemohon: string;
  perihal: string;
  tanggal_surat: string;
  jenis_pohon: string;
  jumlah_pohon: number;
  kondisi_pohon: string;
  lokasi: string;
  tanggal_survey: string;
  rekomendasi: string;
  foto_url: string;
  keterangan: string;
  created_at: string;
}

const Posts = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<DataPohon[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<DataPohon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<DataPohon>>({});

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          router.push("/login");
        } else {
          setUserEmail(data.user.email ?? null);
        }
      } catch (err) {
        console.error("Error getting user", err);
        router.push("/login");
      }
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleExport = async () => {
    const { data, error } = await supabase.from("datapohon").select("*");
    if (error) {
      alert("Gagal mengambil data: " + error.message);
    } else if (data) {
      const processedData = data.map((item) => ({
        "Nama Pemohon": item.nama_pemohon,
        Perihal: item.perihal,
        "Tanggal Surat": new Date(item.tanggal_surat).toLocaleDateString(
          "id-ID"
        ),
        "Jenis Pohon": item.jenis_pohon,
        "Jumlah Pohon": item.jumlah_pohon,
        "Kondisi Pohon": item.kondisi_pohon,
        "Lokasi (GPS)": item.lokasi,
        "Tanggal Survey": new Date(item.tanggal_survey).toLocaleDateString(
          "id-ID"
        ),
        Rekomendasi: item.rekomendasi,
        Keterangan: item.keterangan,
        "Tanggal Input": new Date(item.created_at).toLocaleDateString("id-ID"),
        "URL Foto": item.foto_url,
      }));

      exportToExcel(processedData, "Data_Pendataan_Pohon");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("datapohon").select("*");
      if (error) {
        console.error("Error fetching posts:", error.message);
        setError("Gagal mengambil data");
      } else {
        setPosts(data || []);
        setFilteredPosts(Array.isArray(data) ? (data as DataPohon[]) : []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = posts.filter((post: DataPohon) => {
      const title = `${post.nama_pemohon} ${post.perihal} ${post.jenis_pohon} ${post.kondisi_pohon} ${post.rekomendasi}`;
      return title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredPosts(filtered);
  }, [posts, searchTerm]);

  const startEditing = (post: DataPohon) => {
    setEditingId(post.id);
    setEditData({ ...post });
  };

  const handleUpdate = async (id: number) => {
    const confirmUpdate = confirm("Simpan perubahan?");
    if (!confirmUpdate) return;

    const { error } = await supabase
      .from("datapohon")
      .update({
        nama_pemohon: editData.nama_pemohon,
        perihal: editData.perihal,
        tanggal_surat: editData.tanggal_surat,
        jenis_pohon: editData.jenis_pohon,
        jumlah_pohon: editData.jumlah_pohon,
        kondisi_pohon: editData.kondisi_pohon,
        lokasi: editData.lokasi,
        tanggal_survey: editData.tanggal_survey,
        rekomendasi: editData.rekomendasi,
        keterangan: editData.keterangan,
        foto_url: editData.foto_url,
      })
      .eq("id", id);

    if (error) {
      alert("Gagal memperbarui data");
    } else {
      const updated = posts.map((p) =>
        p.id === id ? ({ ...p, ...editData } as DataPohon) : p
      );
      setPosts(updated);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Yakin ingin menghapus data ini?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("datapohon").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus data");
    } else {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  const uploadFoto = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("foto-pohon")
      .upload(filePath, file);

    if (error) {
      alert("Gagal mengunggah foto: " + error.message);
      return;
    }

    const { publicUrl } = supabase.storage
      .from("foto-pohon")
      .getPublicUrl(filePath).data;

    if (publicUrl) {
      setEditData((prev) => ({ ...prev, foto_url: publicUrl }));
    }
  };

  function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setEditData((prev) => ({ ...prev, lokasi: `${latitude},${longitude}` }));
    });
  }

  return (
    <RequireAuth>
      <div className="p-4 bg-gray-800 min-h-screen text-white">
        <div className="flex justify-between items-center mb-4">
          <strong className="text-gray-300 text-2xl">DATA POHON</strong>
          {userEmail && (
            <p className="text-sm text-gray-400">Login sebagai: {userEmail}</p>
          )}
        </div>
        <nav className="mb-6 flex flex-wrap gap-4">
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
            href="/InputPage"
            className="bg-gray-500 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition"
          >
            Input Data
          </Link>
          <button
            onClick={handleExport}
            className="bg-green-600 border px-2 py-1 rounded hover:bg-green-300 hover:text-gray-800 transition cursor-pointer"
          >
            Export ke Excel
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 border px-2 py-1 rounded hover:bg-red-300 hover:text-gray-800 transition cursor-pointer"
          >
            Logout
          </button>
        </nav>

        <input
          type="text"
          placeholder="Cari berdasarkan nama pemohon / perihal / jenis pohon / kondisi pohon / rekomendasi"
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
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Pemohon
                      </label>
                      <input
                        type="text"
                        value={editData.nama_pemohon || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            nama_pemohon: e.target.value,
                          })
                        }
                        className="w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Perihal
                      </label>
                      <input
                        type="text"
                        value={editData.perihal || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, perihal: e.target.value })
                        }
                        className="w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal Surat
                      </label>
                      <input
                        type="date"
                        value={editData.tanggal_surat || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            tanggal_surat: e.target.value,
                          })
                        }
                        className="mb-2 w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Jenis Pohon
                      </label>
                      <input
                        type="text"
                        value={editData.jenis_pohon || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            jenis_pohon: e.target.value,
                          })
                        }
                        className="w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Jumlah Pohon
                      </label>
                      <input
                        type="number"
                        value={editData.jumlah_pohon ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            jumlah_pohon:
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value),
                          })
                        }
                        className="w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kondisi Pohon
                      </label>
                      <input
                        type="text"
                        value={editData.kondisi_pohon || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            kondisi_pohon: e.target.value,
                          })
                        }
                        className="mb-2 w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Lokasi (GPS)
                      </label>
                      <input
                        type="text"
                        value={editData.lokasi || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, lokasi: e.target.value })
                        }
                        className="mb-2 w-full border p-1 bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={detectLocation}
                        className="w-full sm:w-auto bg-blue-400 border px-2 py-1 rounded-md hover:bg-gray-300 hover:text-gray-800 transition cursor-pointer"
                      >
                        Deteksi Lokasi Otomatis
                      </button>
                      <label className="block text-sm font-medium text-gray-300"></label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal Survey
                      </label>
                      <input
                        type="date"
                        value={editData.tanggal_survey || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            tanggal_survey: e.target.value,
                          })
                        }
                        className="mb-2 w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rekomendasi
                      </label>
                      <input
                        type="text"
                        value={editData.rekomendasi || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            rekomendasi: e.target.value,
                          })
                        }
                        className="mb-2 w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Keterangan
                      </label>
                      <input
                        type="text"
                        value={editData.keterangan || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            keterangan: e.target.value,
                          })
                        }
                        className="mb-2 w-full border p-1 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ganti Foto
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Lakukan upload ke Supabase Storage atau konversi ke URL blob sementara
                            uploadFoto(file); // Fungsi ini harus kamu definisikan
                          }
                        }}
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
                  <p>
                    <h2 className="text-xl font-bold text-blue-600">
                      Pemohon: {post.nama_pemohon}
                    </h2>
                    <p>
                      <strong>Perihal:</strong> {post.perihal}
                    </p>
                    <p>
                      <strong>Tanggal Surat:</strong>{" "}
                      {post.tanggal_surat
                        ? new Date(post.tanggal_surat).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </p>
                    <p>
                      <strong>Jenis Pohon:</strong> {post.jenis_pohon}
                    </p>
                    <p>
                      <strong>Jumlah Pohon:</strong> {post.jumlah_pohon}
                    </p>
                    <p>
                      <strong>Kondisi Pohon:</strong> {post.kondisi_pohon}
                    </p>
                    <p>
                      <strong>Lokasi:</strong> {post.lokasi}
                    </p>
                    <p>
                      <strong>Tanggal Suvey:</strong>{" "}
                      {post.tanggal_survey
                        ? new Date(post.tanggal_survey).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </p>
                    <p>
                      <strong>Rekomendasi:</strong> {post.rekomendasi}
                    </p>
                    <p>
                      <strong>Keterangan:</strong> {post.keterangan}
                    </p>
                    <p>
                      <strong>Tanggal Input Data:</strong>{" "}
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </p>
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
                  </p>
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
