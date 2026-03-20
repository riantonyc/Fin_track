# Laporan Proyek Akhir: FinTrack (Aplikasi Pencatat Keuangan)

## 1. Pendahuluan
FinTrack adalah aplikasi *Personal Finance Manager* berjenis *offline-first* yang dikembangkan untuk membantu pengguna mencatat dan memonitor Pemasukan serta Pengeluaran harian mereka. Aplikasi ini dirancang agar sangat aman, privat (tanpa cloud pihak ketiga), responsif, dan mudah digunakan di perangkat Desktop maupun Mobile.

## 2. Teknologi Utama yang Digunakan
1. **Frontend Framework**: **React 18** & **Vite** — Menjamin performa tinggi dan waktu *build/reload* yang sangat cepat selama masa pengembangan lingkungan *Single Page Application* (SPA).
2. **Bahasa Pemrograman**: **TypeScript** — Menerapkan *Type Safety* dan integritas data untuk mencegah bug *runtime* terutama dalam struktur pengelolaan *state* dan respons manipulasi form.
3. **Penyimpanan Lokal (Database)**: **Dexie.js** dan **IndexedDB** — Secara asinkron mengelola relasi tebal (Transaksi, Dompet/Wallet, Kategori) di dalam penyimpanan browser tanpa membutuhkan Backend Server sama sekali (Offline Database).
4. **Desain / UI Styling**: 
   - **Tailwind CSS** — *Utility-first CSS framework* untuk menyusun *layout responsif*, mode *glassmorphism*, tata *grid*, serta Dark & Light mode.
   - **Lucide React** — Mengokupasi lebih dari 60 ikon garis vektor (*line-art*) elegan pengganti emoji standar.
5. **Visualisasi Data (Analitik)**: **Recharts** — Modul grafik khusus React yang dipakai untuk merender kurva arus kas (Grafik Area Pemasukan vs Pengeluaran).
6. **Ekspor Data & Utility**:
   - **jsPDF** & **jsPDF-autotable** — Digunakan untuk menata transaksi menjadi Laporan PDF baku yang berformat *invoice/table*.
   - **NanoID** — *String generator* sebagai Primary Key (`id`) bagi setiap entitas data (Kategori, Dompet, Transaksi).

## 3. Struktur Direktori Proyek Utama (`/src`)
Arsitektur direktori di FinTrack dibangun dengan filosofi modul dan pembagian tanggung jawab (*separation of concerns*):

```text
src/
├── components/          # Komponen UI Reusable (dapat digunakn berulang kali)
│   ├── CategoryIcon.tsx # Mapping & Render Ikon-Ikon Lucide Kategori
│   ├── ConfirmModal.tsx # Antarmuka Pop-up cantik untuk alert konfirmasi (Ganti window.confirm)
│   ├── CustomSelect.tsx # Elemen <select> modern yang dirombak untuk mendukung ikon (dropdown custom)
│   ├── EditTransactionModal.tsx # Form Modal utuh untuk mengubah / menghapus entri transaksi lawas beserta auto-balance
│   ├── Layout.tsx       # Pembungkus (Wrapper) Antarmuka Induk (Sidebar, Navigasi Mobile)
│   └── ProtectedRoute.tsx # Garda pengaman rute
├── lib/                 # Utilitas Pustaka Tambahan & Pengaturan Database Inti
│   ├── backup.ts        # Script algoritma peng-Ekspor & Impor database utuh ke dan dari .JSON
│   ├── db.ts            # Registrasi dan skema relasi Dexie.js (wallets, categories, transactions)
│   └── utils.ts         # Helper (Format Rupiah & Format Tanggal standar Indonesia)
├── pages/               # Halaman-halaman Navigasi Utama (Routes)
│   ├── Calculator.tsx   # Fitur Kalkulator standar & Konversi Mata Uang via API
│   ├── Dashboard.tsx    # Integrasi Form Tambah Transaksi/Kategori, Grafik Saldo, Metrik Bulanan
│   ├── History.tsx      # Daftar/Log linimasa semua aliran transaksi masuk dan keluar
│   ├── Settings.tsx     # Menu Ekspor, Backup, Tema, Hapus Kategori Tdk Terpakai, Hard Reset Data
│   └── Wallets.tsx      # Manajemen penambahan / penghapusan tipe simpanan Dompet / Bank
├── stores/
│   └── authStore.ts     # Pengelolaan ID lokal sesi user menggunakan Zustand
├── App.tsx              # Router Utama navigasi halaman (React Router DOM)
├── index.css            # Arahan Tailwind & Modifikasi utilitas CSS Global (Scrollbar/Body)
└── main.tsx             # Titik Inisiasi Mounting Aplikasi React ke dalam DOM
```

## 4. Solusi Permasalahan Utama & Kesimpulan
Dalam pengembangan versi terakhir ini (Maret 2026), FinTrack telah menyelesaikan problematika *User Experience* kompleks dengan menghadirkan:
1. **Fitur Edit "Mistake-Proof"**: Pembalikan kalkulasi saldo dompet secara sempurna di belakang layar jika pengguna salah memilih Sumber Dompet/Input Nominal dari suatu transaksi di masa lalu, **tanpa menyebabkan ketimpangan total akhir.**
2. **Kategori Smarter & Pembersihan**: Memanfaatkan kemampuan *Autocomplete* dengan algoritma membaca dari jejak relasi database secara aktual. Terdapat juga skema **Garbage Collector Opsional** (Hapus Kategori Tidak Terpakai) untuk menangani inflasi kotor dari *Import Template JSON* pihak luar.
3. **Data Portability Tingkat Tinggi**: Kemampuan *Import*, *Export*, CSV Download, dan *Print PDF Report* yang memastikan informasi keuangan aman, mudah dipindahkan lintas perangkat, maupun diekstrasi untuk pelaporan fisik.

Aplikasi ini mendemonstrasikan perpaduan sempurna antara performa kilat aplikasi *Frontend/Client-side* dan fungsionalitas mutakhir aplikasi *Enterprise Financial*, semuanya dalam lingkup *Offline-First* yang terjaga privasinya.
