import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['mxwliocmvvthuylwvooq.supabase.co'], // Ganti dengan domain Supabase Anda
  },
};

module.exports = {
  // ...
  matcher: ['/InputPage'],
}

export default nextConfig;
