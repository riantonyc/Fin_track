# FinTrack - Aplikasi Pencatat Keuangan Pribadi (Offline-First SaaS)

FinTrack adalah manajer keuangan pribadi (Personal Finance Manager) yang dibangun bertumpu pada arsitektur modern web untuk menjamin kecepatan, keamanan, dan privasi penuh. Seluruh data disimpan secara lokal pada perangkat Anda menggunakan IndexedDB, diiringi pelindung Lisensi SaaS pintar (Serverless Vercel) untuk monetisasi komersial.

## 🌟 Fitur Unggulan

### 1. Pencatatan Transaksi & Manajemen Saldo
- **UX/UI Modern:** Mencatat Pemasukan dan Pengeluaran kini begitu cepat melalui Dashboard dengan antarmuka dinamis dan *Classic Mode* yang terpadu.
- **Pencatatan Instan (IndexedDB):** Layar merespon instan tanpa loading server berkat integrasi penuh dengan basis data lokal bawaan *browser* Anda (`Dexie.js`).

### 2. Kategori Cerdas
- **Ikon Premium Lucide:** Tinggalkan emoji lawas. Pilih ikon *line-art* modern dengan UI kategori yang atraktif.
- **Autocomplete Cerdas (Datalist):** Tak perlu mengetik berulang-ulang nama kategori yang sama. Sistem selalu memunculkan nama kategori rekomendasi (*auto-fill*) langsung dari log histori Anda.

### 3. Keamanan Lisensi SaaS (Baru!)
- **Paywall Lisensi Komersial (*Vercel Edge API*):** Siapa pun yang mengunjungi link Vercel aplikasi ini secara publik harus memasukkan Kunci Lisensi khusus (contoh: `FIN-XXXX...`) untuk dapat mengakses fitur utama.
- **Validasi Tersembunyi (Serverless):** Keamanan lisensi mustahil dijebol dari *browser* frontend (*Inspect Element*) karena sistem melempar validasinya menuju Backend `/api/verify-license` Vercel yang tak kasatmata.
- **Developer Auto-Bypass:** Sedang *ngoding*? Perintah `npm run dev` (`localhost`) otomatis dideteksi dan **diloloskan** secara pintar oleh blok kode `ProtectedRoute.tsx` agar developer tidak kelelahan mengisi lisensi berulang kali saat revisi.

### 4. Dukungan PWA (*Progressive Web App*)
- Bisa di-*install* selayaknya aplikasi asli (*Native App*) di HP Android/iOS maupun PC/Mac!
- Bisa diakses kapan saja meski tanpa paket internet/WiFi (Mode **Offline-first**) berkat Vite PWA Service Workers.

### 5. Ekspor, Backup, dan Keamanan Data
- **Ekspor PDF & CSV:** Unduh laporan bulanan siap cetak dalam bentuk file PDF atau pindahkan ke Excel (CSV) untuk kalkulasi lanjutan.
- **Backup Data Menyeluruh (.JSON):** Simpan cadangan data penuh Anda ke komputer, atau kirim data lintas akun berkat *re-mapping userId* yang cerdas.
- **Hard Reset:** Eksekusi ganda Zona Berbahaya untuk mereset Semua Data ke nol besar.

## 🛠 Teknologi yang Digunakan
* **Kerangka Kerja Utama**: React 18, TypeScript, Vite
* **Backend Serverless Otentikasi**: Vercel Serverless Functions (`api/verify-license.js`)
* **Tampilan (UI/Styling)**: Tailwind CSS (Utility-first), Lucide React (Vector Icon Library)
* **Penyimpanan Lokal**: IndexedDB via `Dexie.js` & `dexie-react-hooks`
* **Visualisasi Data**: Recharts
* **PWA & Offline System**: Vite-Plugin-PWA

## 🚀 Instalasi & Menjalankan Lokal (Developer Mode)

Lakukan kloning dari Repositori ini dan buka melalui terminal/Command Prompt Anda:

```bash
# 1. Unduh modul dependensi
npm install

# 2. Jalankan lokal server
npm run dev
```

Buka URL lokal yang muncul pada terminal (biasanya `http://localhost:5173`) melalui browser pilihan Anda. Sistem Lisensi akan dinonaktifkan secara otomatis khusus di URL `localhost` demi kenyamanan Anda!

## 📈 Log Pembaruan Terkini (Maret 2026)

1. **Pembuatan Sistem Penjualan (SaaS License Gateway):** 
   - Endpoint `/api/verify-license.js` selesai dikonfigurasi.
   - Pintu gerbang `License.tsx` dan `ProtectedRoute.tsx` menjaga rute secara absolut.
   - Generator Skrip `generate-keys.js` agar admin dapat mencetak uang (lisensi) secara gratis!
2. **Setup SPA Deployment Vercel:** Penambahan file `vercel.json` untuk menghilangkan *Bug 404 Not Found* saat user me-*refresh* paksa halaman.
3. **Optimisasi PWA:** Ikon Manifest WebApp dipecah rapi memakai `favicon.svg` murni yang terhindar dari *Broken Image Link*.
4. **Pembersihan UI Spin Button:** Penghilangan paksa panah input numerik bawaan browser Chrome/Safari menggunakan filter CSS transparan.

---

> **Catatan Privasi Keuangan**: FinTrack adalah aplikasi *local-first* — tidak ada data angka/jumlah uang yang dikirim ke server Vercel manapun. Vercel hanya digunakan sebatas untuk gerbang kunci portal login. Semua informasi transaksi Anda 100% terkunci dalam hard disk/HP Anda sendiri.
