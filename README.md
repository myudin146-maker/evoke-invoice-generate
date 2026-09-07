# Evoke Invoice Generator

Aplikasi pembuat faktur profesional berbasis web dengan penyimpanan cloud via Supabase.

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **Zustand** (state management)
- **Supabase** (Auth + Database + Storage)
- **html2pdf.js** (export PDF)

---

## Setup & Instalasi

### 1. Install dependencies
```bash
npm install
```

### 2. Konfigurasi Supabase

Edit file `.env.local` dan isi dengan credentials dari Supabase project kamu:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Credentials ini bisa ditemukan di:  
**Supabase Dashboard → Project Settings → API**

### 3. Setup Database

Buka **Supabase Dashboard → SQL Editor**, lalu paste dan jalankan semua isi file:

```
supabase/schema.sql
```

File ini akan membuat:
- Tabel `user_profiles`, `invoices`, `invoice_items`
- Row Level Security (RLS) policies
- Storage bucket `logos` untuk upload logo perusahaan
- Trigger `updated_at` otomatis

### 4. Aktifkan Google OAuth (opsional)

Di Supabase Dashboard → **Authentication → Providers → Google**, aktifkan dan masukkan Google OAuth credentials.

### 5. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Fitur

| Fitur | Keterangan |
|-------|------------|
| 🖊️ WYSIWYG Editor | Klik langsung di kanvas untuk mengedit |
| 🏢 Template Company | Desain formal dengan logo, NPWP, no. registrasi |
| ✨ Template Simple | Desain minimalis |
| 🧮 Kalkulasi Otomatis | Pajak (% / nominal), diskon, pengiriman |
| 📄 Download PDF | Export A4 via html2pdf.js |
| 🖨️ Print | Dialog cetak browser |
| ☁️ Cloud Sync | Simpan & kelola riwayat invoice (perlu login) |
| 👤 Guest Mode | Buat & download tanpa login (localStorage) |
| 🔐 Auth | Email/Password + Google OAuth |
| 🇮🇩 Rupiah / 🇺🇸 Dollar | Pilihan mata uang |

## Deployment ke Vercel

1. Push ke GitHub
2. Import repository di [vercel.com](https://vercel.com)
3. Set Environment Variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy
