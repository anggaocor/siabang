import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="bg-gray-800 p-4">
        <h1 className="text-center text-2xl font-bold text-gray-300">
          SIABANG
        </h1>
        <p className="text-center text-gray-300">
          <strong>SISTEM INFORMASI</strong> PEMANGKASAN DAN PENEBANGAN POHON
          <strong> KOTA BANJARBARU</strong>
        </p>
      </div>
      <br />
      <nav className="flex flex-wrap justify-center gap-2 sm:justify-start">
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
        <Link
          href="/InputPage"
          className="bg-gray-500 text-gray-300 border px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition"
        >
          Input Data
        </Link>
        <Link
          href="/login"
          className="bg-blue-500 text-gray-300 border border-gray-300 px-2 py-1 rounded hover:bg-gray-300 hover:text-gray-800 transition duration-300"
        >
          Login
        </Link>
      </nav>
      <br />
      <section className="text-center text-gray-300 space-y-6 px-4 sm:px-8 mb-20">
        <div>
          <h2 className="text-xl font-semibold">Tentang SIABANG</h2>
          <p>
            <strong>SIABANG</strong> adalah aplikasi digital yang dirancang
            untuk mempermudah proses pendataan, pemantauan, dan pengelolaan
            aktivitas pemangkasan serta penebangan pohon di wilayah Kota
            Banjarbaru. Aplikasi ini mendukung transparansi, efisiensi kerja
            petugas lapangan, serta mempercepat pengambilan keputusan oleh
            instansi terkait.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Tujuan Utama</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Mendokumentasikan permohonan pemangkasan dan penebangan pohon dari
              masyarakat.
            </li>
            <li>
              Mencatat hasil survei lapangan secara digital dengan akurat dan
              real-time.
            </li>
            <li>
              Menyediakan data lokasi, jenis pohon, kondisi, dan dokumentasi
              foto untuk setiap kasus.
            </li>
            <li>
              Meningkatkan efisiensi dan akuntabilitas proses pengelolaan ruang
              hijau kota.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Fitur Utama</h2>
          <p>
            📋 Formulir Pendataan Digital, 📍 Integrasi Lokasi GPS, 📸 Unggah
            Foto Lapangan, 🗂 Database Terpusat, 📊 Dashboard Monitoring
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Manfaat Aplikasi</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Mempermudah tim lapangan dalam mencatat dan melaporkan temuan
              secara langsung dari lokasi.
            </li>
            <li>
              Mengurangi penggunaan kertas dan meningkatkan efisiensi kerja.
            </li>
            <li>
              Memberikan data yang valid dan dapat ditelusuri untuk perencanaan
              dan kebijakan lingkungan.
            </li>
            <li>
              Mendorong pelayanan publik yang lebih responsif dan transparan.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Teknologi yang Digunakan</h2>
          <p>
            Next.js + TypeScript (Frontend), Supabase (Database & Storage),
            Tailwind CSS (UI Styling), Geolocation API (Deteksi Lokasi), Cloud
            Storage untuk pengelolaan foto pohon
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Pengguna Utama</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Petugas Dinas Lingkungan Hidup Kota Banjarbaru</li>
            <li>Tim surveyor di lapangan</li>
            <li>Operator pendataan dan pengambil keputusan di kantor pusat</li>
          </ul>
        </div>
      </section>
      <div className="fixed inset-0 -z-10">
        <Image
          src="/background.png"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </>
  );
}
