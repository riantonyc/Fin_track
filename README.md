# FinTrack - Aplikasi Pencatat Keuangan Pribadi (Offline-First)

FinTrack adalah manajer keuangan pribadi (Personal Finance Manager) yang dibangun bertumpu pada arsitektur modern web untuk menjamin kecepatan, keamanan, dan privasi penuh. Seluruh data disimpan secara lokal pada perangkat Anda menggunakan IndexedDB.

## 🌟 Fitur Unggulan

### 1. Pencatatan Transaksi & Manajemen Saldo
- **UX/UI Modern:** Mencatat Pemasukan dan Pengeluaran kini begitu cepat melalui Dashboard dengan *layout grid* yang responsif baik di HP maupun Layar Lebar.
- **Dukungan Multi-Dompet (Wallet):** Melacak saldo tidak hanya dari satu dompet, tapi juga bisa melalui Kas Tunai, Rekening Bank, dan Dompet Digital (E-Wallet).
- **Edit & Hapus Dinamis:** Lakukan kesalahan pencatatan? Cukup klik transaksi apapun untuk mengedit nominal, kategori, letak dompet, hingga tanggal. Sistem secara otomatis menyesuaikan ulang saldo riil Anda tanpa perlu hitung manual.

### 2. Kategori Cerdas
- **Ikon Premium Lucide:** Tinggalkan emoji lawas. Pilih di antara lebih dari 60+ ikon *line-art* modern yang dikemas dalam desain antarmuka *grid icon-picker*.
- **Autocomplete Cerdas (Datalist):** Tak perlu mengetik berulang-ulang nama kategori yang sama. Sistem selalu memunculkan nama kategori sebagai rekomendasi (*auto-fill*) langsung dari *database* Anda yang paling mutakhir. Juga hadir dengan default/template (Gaji, Makanan, Transport, dll).

### 3. Visualisasi Keuangan (Analitik)
- **Grafik Arus Kas:** Amati tren *Income* & *Expense* Anda sepanjang bulan menggunakan Grafik Area dinamis berbasis antarmuka kustom (Recharts).
- **Metrik Bulanan:** Kartu rangkuman Pemasukan vs Pengeluaran bulan ini yang elegan, diletakkan persis di bawah ringkasan Total Saldo Utama.

### 4. Ekspor, Backup, dan Keamanan Data

- **Ekspor PDF & CSV:** Unduh laporan bulanan siap cetak dalam bentuk file PDF atau pindahkan ke Excel (CSV) untuk kalkulasi lanjutan.
- **Backup Data Menyeluruh (.JSON):** Simpan cadangan data penuh Anda ke flashdisk, atau kirim "Template Kategori & Transaksi" kepada teman Anda menggunakan fitur Impor FinTrack.
- **Pembersihan Log History:** Satu tombol mudah (Pembersihan Histori) untuk membuang bersih rujukan Kategori yang tak lagi Anda pakai.
- **Hard Reset:** Eksekusi Reset Semua Data di bawah *Danger Zone* untuk memulai lembaran baru secara instan.

### 5. Interaksi Super Halus (Micro-interactions)
- Animasi transisi masuk setiap layar.
- **Peringatan Konfirmasi Cantik (ConfirmModal):** Selamat tinggal fitur alert kaku bawaan *browser*. Aplikasi ini diilhami komponen kustom bersinar dengan tata letak tombol meredam kesalahan klik yang ditata aman (*safety-first*).
- Modal pendukung (seperti edit transaksi) otomatis tertutup tanpa tombol *close* (*Backdrop Click Auto-close*).
- Mendukung Gelap & Terang secara *seamless* (Dark/Light mode).

## 🛠 Teknologi yang Digunakan
* **Kerangka Kerja Utama**: React 18, TypeScript, Vite
* **Tampilan (UI/Styling)**: Tailwind CSS (Utility-first), Lucide React (Vector Icon Library)
* **Penyimpanan Lokal**: IndexedDB via `Dexie.js` & `dexie-react-hooks`
* **Visualisasi Data**: Recharts
* **Pembuatan Dokumen**: jsPDF, jsPDF-AutoTable

## 🚀 Instalasi & Menjalankan Lokal (Developer Mode)

Lakukan kloning dari Repositori ini dan buka melalui terminal/Command Prompt Anda:

```bash
# 1. Unduh modul dependensi
npm install

# 2. Jalankan lokal server
npm run dev
```

Buka URL lokal yang muncul pada terminal (biasanya `http://localhost:5173`) melalui browser pilihan Anda.

---

## 📈 Log Pembaruan Terkini (Maret 2026)

Pembaruan QoL (Quality of Life) dan Perbaikan Bug terbaru yang telah diimplementasikan (Hari ini):
1. **Perbaikan Impor JSON Lintas Akun**: Data backup JSON dari `userId` lama kini secara cerdas dipetakan ulang (`re-mapping`) ke `userId` akun yang sedang login, sehingga migrasi data antar perangkat berjalan mulus.
2. **Fitur "Reset Semua Data"**: Ditambahkan *Zona Berbahaya* di Pengaturan untuk menghapus semua transaksi, dompet, dan kategori dengan modal konfirmasi ganda ganda.
3. **Peningkatan UI Kalkulator & Konversi**:
   - Layout *Mata Uang Tujuan* disinkronisasikan agar se-estetik input *Mata Uang Asal*.
   - Tombol operasi (`×`, `⌫`, `%`) kini memiliki warna kontras (*Primary*) agar mudah dibedakan dari tombol angka.
4. **Penyempurnaan Dark Mode**: Menyelesaikan rasio kontras warna (*Color Palette*) untuk Dark Mode, memberikan elevasi (*Slate 900*) pada kartu-kartu antarmuka agar bayangan terlihat jelas dan teks terbaca sempurna.

---

> **Catatan Privasi**: FinTrack adalah aplikasi *local-first* — tidak ada data yang dikirim ke server manapun. Semua informasi keuangan Anda tersimpan 100% di perangkat Anda sendiri.
