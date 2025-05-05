'use client'

import Link from "next/link";
import React from 'react'
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const Datas = () => {
  return (
    <>
      <h1>DATA</h1> 
      <nav className="flex justify-items-start">
      <Link href="/" className="mx-2">Home</Link>
      <Link href="/posts" className="mx-2">Input Data</Link>
      <Link href="/datas" className="mx-2">Data Pohon</Link>
      </nav>
    </>
  )
}

export default Datas