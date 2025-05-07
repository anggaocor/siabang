import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['mxwliocmvvthuylwvooq.supabase.co'], // domain supabase storage
  },
};

export default nextConfig;

// Redirects
export async function redirects() {
  return [
    {
      source: '/InputPage',
      destination: '/login',
      permanent: false,
    },
  ];
}

// Rewrites
export async function rewrites() {
  return [
    {
      source: '/InputPage',
      destination: '/posts', // ganti sesuai kebutuhan
    },
  ];
}
