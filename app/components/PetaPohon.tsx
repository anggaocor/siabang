'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const PetaPohon = () => {
  const [data, setData] = useState<{ lat: number; lng: number; nama: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('pendataan_pohon')
        .select('latitude, longitude, nama_pohon');

      if (error) {
        console.error("Gagal mengambil data dari Supabase:", error.message);
        return;
      }

      if (data) {
        const hasil = data.map((item: { latitude: number; longitude: number; nama_pohon: string }) => ({
          lat: item.latitude,
          lng: item.longitude,
          nama: item.nama_pohon,
        }));
        setData(hasil);
      }
    };

    fetchData();
  }, []);

  if (data.length === 0) return <div>Loading peta...</div>;

  return (
    <MapContainer center={[data[0].lat, data[0].lng]} zoom={13} className="h-[500px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.map((pos, idx) => (
        <Marker key={idx} position={[pos.lat, pos.lng]}>
          <Popup>{pos.nama}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default PetaPohon;
