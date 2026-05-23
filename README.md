# 🎓 Bimbel Samuray

> Platform manajemen bimbingan belajar privat untuk siswa TK, SD, SMP, dan SMA di wilayah Pekalongan, Batang, Tegal, Brebes, dan sekitarnya.

**Live URL:** https://bimbelsamuray.lovable.app  
**Lovable Project:** https://lovable.dev/projects/fc194237-2250-4656-8502-b2e110c0ab26

---

## 📖 Deskripsi Proyek

Bimbel Samuray adalah aplikasi web berbasis React yang menyediakan sistem manajemen bimbingan belajar privat lengkap dengan tiga peran pengguna — **Siswa**, **Tutor**, dan **Admin**.

Aplikasi ini memungkinkan:
- **Siswa** mencari dan memilih tutor berdasarkan mata pelajaran & lokasi, mengelola profil, serta melihat tutor yang sedang aktif.
- **Tutor** mengelola profil, keahlian, pendidikan, dokumen, serta melihat siswa yang terdaftar.
- **Admin** mengelola seluruh data siswa, tutor, persetujuan tutor, mata pelajaran, presensi, dan peta lokasi.

---

## 🚀 Teknologi

| Stack | Detail |
|-------|--------|
| **Framework** | React 18 + Vite 8 |
| **Bahasa** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 + shadcn/ui |
| **State & Query** | React Query (TanStack) |
| **Routing** | React Router DOM 6 |
| **Backend** | Supabase (Lovable Cloud) |
| **Auth** | Supabase Auth (Email + Google OAuth) |
| **Database** | PostgreSQL via Supabase |
| **Maps** | Leaflet + React Leaflet |
| **Validasi** | Zod |
| **Charting** | Recharts |
| **Carousel** | Embla Carousel |

---

## 📂 Struktur Folder

```
├── public/                    # Aset statis (favicon, manifest, dll)
├── src/
│   ├── components/
│   │   ├── ui/               # Komponen shadcn/ui (button, card, dialog, dll)
│   │   ├── auth/             # Form login & registrasi
│   │   ├── admin/modals/     # Modal CRUD untuk admin
│   │   ├── tutor/profile/    # Tab profil tutor
│   │   └── ...             # Navbar, Hero, Footer, CTA, dsb.
│   ├── pages/
│   │   ├── Index.tsx         # Landing page
│   │   ├── Auth.tsx          # Halaman login / register / reset password
│   │   ├── student/          # Dashboard, Cari Tutor, Tutor Saya, Profil
│   │   ├── tutor/            # Dashboard, Siswa, Presensi, Profil, Pending Approval
│   │   └── admin/            # Dashboard, Siswa, Tutor, Persetujuan, Map, dsb.
│   ├── lib/
│   │   ├── queries/          # Query functions ke Supabase
│   │   ├── constants/        # Schema validasi Zod, konstanta
│   │   ├── types/            # TypeScript types
│   │   └── utils.ts
│   ├── hooks/                # Custom React hooks
│   ├── integrations/supabase/ # Client & types Supabase (auto-generated)
│   └── index.css             # Tailwind entry + design tokens
├── supabase/
│   ├── migrations/             # Database migrations (SQL)
│   └── config.toml           # Konfigurasi Supabase project
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 🔐 Fitur Autentikasi

- **Email & Password** — Registrasi dengan verifikasi email.
- **Google OAuth** — Login satu klik dengan akun Google.
- **Role-based Access Control** — Tiga peran: `student`, `tutor`, `admin`.
- **Reset Password** — Kirim link reset via email.
- **RLS (Row Level Security)** — Data terlindungi per-user.

---

## 👤 Peran Pengguna

### 🎒 Siswa
- Lihat dashboard ringkasan
- Cari tutor berdasarkan mata pelajaran & lokasi
- Lihat detail tutor yang sedang aktif
- Kelola profil pribadi

### 👨‍🏫 Tutor
- Dashboard dengan statistik
- Kelola profil lengkap (info pribadi, pendidikan, keahlian, dokumen)
- Lihat daftar siswa yang terdaftar
- Input presensi
- Menunggu persetujuan admin untuk aktivasi akun

### ⚙️ Admin
- Dashboard dengan chart & statistik
- Manajemen Siswa (CRUD)
- Manajemen Tutor (CRUD + persetujuan/reject)
- Manajemen Mata Pelajaran
- Manajemen Enrollment
- Presensi
- Peta lokasi tutor & siswa

---

## ⚙️ Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js (disarankan menggunakan [nvm](https://github.com/nvm-sh/nvm))
- Package manager: `npm`, `yarn`, `pnpm`, atau `bun`

### Langkah-langkah

```bash
# 1. Clone repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install
# atau
bun install

# 3. Konfigurasi environment
# Salin .env.example ke .env dan isi dengan kredensial Supabase/Lovable Cloud

# 4. Jalankan development server
npm run dev
# atau
bun dev

# 5. Buka browser di http://localhost:5173
```

### Build Production

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

---

## 🗄️ Database & Backend

Proyek ini menggunakan **Lovable Cloud** (berbasis Supabase) untuk:

- **Database** — PostgreSQL dengan tabel: `profiles`, `user_roles`, `tutor_details`, `enrollments`, `subjects`, `attendance`, dll.
- **Authentication** — Email/password + Google OAuth
- **Row Level Security (RLS)** — Setiap tabel dilindungi dengan policy keamanan
- **Realtime** — Dapat diaktifkan untuk fitur live
- **Edge Functions** — Backend serverless (jika diperlukan)

### Menambah Migration Baru

Gunakan tool migration Lovable untuk memodifikasi skema database. Jangan edit file `src/integrations/supabase/types.ts` secara manual — file tersebut di-generate otomatis.

---

## 🔑 Environment Variables

Salin `.env.example` ke `.env`:

```env
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
VITE_SUPABASE_URL="https://your_project_id.supabase.co"
```

> Variabel di atas akan otomatis terisi oleh Lovable Cloud.

---

## 🎨 Design System

- **Warna** — Menggunakan CSS custom properties (HSL) di `index.css`
- **Typography** — Tailwind default + font-family kustom (jika diatur)
- **Komponen UI** — [shadcn/ui](https://ui.shadcn.com/) — aksesibel, customizable, modern
- **Animasi** — Tailwind animations + Framer Motion (jika digunakan)

---

## 🛡️ Keamanan

- **RLS Policies** — Semua tabel publik dilindungi RLS.
- **User Roles** — Peran (`student`, `tutor`, `admin`) disimpan di tabel terpisah untuk mencegah privilege escalation.
- **Security Definer Functions** — Fungsi khusus untuk akses data publik aman (misal: daftar tutor).
- **HIBP** — Have I Been Pwned protection untuk password.
- **No Client-Side Admin Check** — Admin status selalu dicek di server.

---

## 📝 Informasi Bimbel Samuray

| | |
|:---|:---|
| **Nama** | Bimbel Samuray |
| **Tagline** | Bimbingan Belajar Privat untuk TK, SD, SMP, SMA |
| **Wilayah Layanan** | Pekalongan, Batang, Wiradesa, Kedungwuni, Tegal, Brebes |
| **WhatsApp** | 0853-2895-5589 |
| **Instagram** | @bimbelsamuray |
| **YouTube** | Bimbel Samuray Official |
| **TikTok** | @bimbelsamuray |

---

## 🤝 Kontribusi

Proyek ini dikelola melalui [Lovable](https://lovable.dev). Anda dapat:
1. Edit langsung di Lovable
2. Clone repo dan push perubahan dari IDE lokal
3. Edit langsung di GitHub

---

## 📜 Lisensi

Proyek private. Hak cipta © Bimbel Samuray.

---

## 🆘 Butuh Bantuan?

- Lihat dokumentasi Lovable: https://docs.lovable.dev
- Hubungi admin Bimbel Samuray via WhatsApp: 0853-2895-5589
