# 📚 Laporan Proyek Akhir & Dokumentasi Resmi FinTrack
**FinTrack - Secure Offline-First Personal Finance Tracker**

FinTrack adalah sebuah aplikasi manajemen keuangan pribadi berkonsep *Progressive Web App* (PWA) yang menggunakan arsitektur *Offline-First*. Aplikasi ini dirancang agar data pengguna tersimpan 100% secara lokal untuk menjamin privasi absolut, sembari menyediakan antarmuka pengguna *(User Interface)* modern. Aplikasi ini juga dilengkapi dengan sistem otentikasi Lisensi berbayar (SaaS) yang menggunakan otorisasi tingkat peladen (Serverless Edge Functions) melalui Vercel.

---

## 🛠️ Teknologi dan *Tools* Utama
FinTrack dibangun di atas *stack* modern untuk performa maksimal:

### 1. Frontend (Antarmuka Pengguna)
- **Vite & React 18 + TypeScript:** Kerangka aplikasi berkecepatan sangat tinggi dan kuat dengan tipe data statis.
- **Tailwind CSS v4:** Sistem *styling utility-first* canggih untuk menyuguhkan tampilan responsif yang cantik.
- **Recharts:** Pustaka komponen pihak ketiga untuk merender bagan/grafik (Grafik Area Pengeluaran dan Pemasukan).
- **Lucide React:** Koleksi ikon SVG modern dan ringan.
- **Vite PWA Plugin:** Sistem untuk mengakali peramban (*browser*) merender aplikasi web biasa layaknya aplikasi instalasi *native* di HP (Android/iOS) atau Desktop dan bisa dijalankan tanpa WiFi.

### 2. Database & Data Layer (Penyimpanan)
- **Dexie.js & IndexedDB:** Pembungkus *database* bawaan peramban (*wrapper*). Setiap kali pengguna mencatat pengeluaran atau membuat dompet, semuanya terekam **langsung ke dalam ruang penyimpanan lokal (IndexedDB) perangkat mereka masing-masing**. Cepat, instan tanpa hambatan internet (*offline-first*), dan menjamin data uang mereka tidak pernah disentuh pihak lain.

### 3. Backend, Security, & Deployment
- **Vercel Serverless Functions (`/api/`):** Sebuah endpoint Node.js minimalis yang menyala (bangun dari tidur) seketika saat ada cek dari frontend. Bertugas memvalidasi kode rahasia yang diketik oleh klien.
- **Vercel Environment Variables:** Tempat sembunyi (*vault*) brankas kunci-kunci Lisensi resmi milik Anda untuk mencegah pencurian logika via Frontend.
- **Node.js (`crypto`):** Skrip generatif admin untuk memproduksi kumpulan kode tebak acak yang tidak dapat dipalsukan. 
- **Git & GitHub:** Sistem kontrol versi penyimpanan histori *coding* untuk otomasi perilisan (*build*) ke platform Vercel.

---

## 🏗️ Struktur Arsitektur Proyek

Berikut adalah gambaran peta kerangka di balik pembuatan aplikasi ini:

```text
FINTRACK/
├── api/                       -> 🔒 Backend Serverless
│   └── verify-license.js      -> Endpoint verifikasi Lisensi
├── public/                    -> 🖼️ Aset Publik (Logo & Ikon PWA)
├── src/
│   ├── components/            -> 🧩 Potongan UI yang Re-usable
│   │   ├── CategoryIcon.tsx   -> Ikon Mapping
│   │   ├── CustomSelect.tsx   -> Selector Komponen
│   │   ├── EditTransactionModal.tsx  -> Modal UI untuk mengedit
│   │   ├── Layout.tsx         -> Pondasi tata letak (Navbar, Nav Bawah)
│   │   └── ProtectedRoute.tsx -> 🛡️ Guardian! Memblokir peretas jika belum berlisensi!
│   ├── lib/
│   │   ├── db.ts              -> Skema Master Dexie.js (Wallets, Categories, Transactions)
│   │   └── utils.ts           -> Utilitas pemformatan mata uang ke dalam Rupiah & Tanggal
│   ├── pages/                 -> 📃 Seluruh Halaman Utama (Pages)
│   │   ├── Dashboard.tsx      -> Halaman Catat, Grafik, dan Rekapitulasi Saldo
│   │   ├── History.tsx        -> Seluruh Daftar Transaksi
│   │   ├── License.tsx        -> Halaman Landing Paywall Pengisian Lisensi 
│   │   └── Settings.tsx       -> Konfigurasi, Impor/Ekspor Pencadangan (Backup JSON)
│   ├── App.tsx                -> Sutradara Alur Jalan (React Router DOM)
│   └── index.css              -> Kode Warna Dasar & Variabel Tailwind
├── generate-keys.js           -> Skrip lokal administrator pencetak uang (lisensi)
├── vercel.json                -> Konfigurasi agar halaman reload di Vercel tidak error (Rewrite 404)
└── vite.config.ts             -> Engine Konfigurator & Setting *Service Worker* PWA
```

---

## ⚙️ Cara Kerja Sistem (Alur Operasional)

### 1. Cara Kerja Proteksi Lisensi (Keamanan Penjualan)
Untuk memonetisasi aplikasi Web agar tak dibajak secara cuma-cuma:
1. **Pencegatan Lokasi (`ProtectedRoute.tsx & App.tsx`):**  
   Siapa pun yang membuka secara online alamat web yang bukan memuat kata `localhost`, perjalananya menuju dasbor akan dialihkan (*redirect*) membentur dinding gerbang yakni halaman `/license`.
2. **Pengisian Lisensi (`License.tsx`):**
   Ketiklisensi. Begitu tombol "Validasi" diklik, React mengirimkan instruksi gedor jaringan *(fetch request)* memuat deretan kode itu menuju jembatan belakang (`API Vercel`).
3. **Pencarian Data (Vercel Serverless `verify-license.js`):**
   Serverless Vercel mencerna kode yang di lempar dan mencocokkannya ke dalam Gudang Rahasia `VALID_LICENSES` miliknya. (Inilah mengapa tidak ada kode lisensi hard-code di Frontend yang bisa di-*inspect* oleh *Hacker/User Biasa*).
4. **Respon:**  
   Jika valid, server berteriak izin aman (`200 OK`) dan meremajakan token memori izin di gembok `localStorage.setItem('fintrack_license', 'active')`. Lalu mengizinkannya membuka Dashboard selamanya.

### 2. Cara Kerja Sistem Bypass Pengembangan (Developer Mode Lokal)
Aplikasi didesain mengerti bahwa sebagai pemilik *(developer)* Anda tak ingin diperiksa terus saat men-*coding*.  
Kode akan mendeteksi baris URL Anda. Jika rutenya menunjukkan **"localhost"** atau **127.0.0.1** saat Anda melakukan eksekusi perintah terminal `npm run dev`, pelindung lisensi akan secara magis mematikan diri dan memberikan rel akses tanpa hadangan (Otomatis By-pass / Lewat Tol).

### 3. Cara Kerja Database Penyimpanan
Karena sifatnya lokal, jika user berganti-ganti akun peramban lokal *(Local Account)*, atau mereka mematikan jaringan (Wi-Fi), mereka tetap bisa menabung lalu memasukkan data ke FinTrack secara Instan (Kecepatan *Load* tanpa tundaan waktu/delay sedikitpun akibat pengambilan).  
1. Mereka mencatatkan Pemasukan $1000. 
2. Di dalam file `db.ts`, uang tercatat ke tabel *(Collection)* "Transactions" lalu segera meng-Kalkulasi dompet (Tabel "Wallets") untuk otomatis bertambah (sinkronisasi dompet). Segala perpindahan tersebut langsung difoto ulang secara reaktif *Real-time* oleh Hook pamungkas `useLiveQuery` dari `dexie-react-hooks`. Dashboard akan me-refresh saldonya di hadapan mereka detik itu juga.

---

Semoga dokumentasi rekayasa *software* dari produk *FinTrack* mewah ini membawa manfaat besar bagi perilisan komersialnya! 🚀
