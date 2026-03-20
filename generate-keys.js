import crypto from 'crypto';

// Fungsi untuk membuat 1 kunci lisensi acak yang keren
function generateLicenseKey() {
  // Membuat 8 byte random lalu mengubahnya ke string HEX
  const randomBytes = crypto.randomBytes(6).toString('hex').toUpperCase();
  // Format menjadi FIN-XXXX-XXXX-XXXX
  return `FIN-${randomBytes.slice(0,4)}-${randomBytes.slice(4,8)}-${randomBytes.slice(8,12)}`;
}

// Berapa lisensi yang ingin Anda cetak hari ini?
const BANYAK_LISENSI = 20;

console.log('====================================================');
console.log('🚀 MENCETAK KODE LISENSI FINTRACK PREMIUM 🚀');
console.log('====================================================\n');

const generatedKeys = [];

for (let i = 0; i < BANYAK_LISENSI; i++) {
  const key = generateLicenseKey();
  generatedKeys.push(key);
  console.log(`${i + 1}. ${key}`);
}

console.log('\n====================================================');
console.log('🔧 CARA PENGGUNAAN:');
console.log('1. Copy semua kode di atas (pisahkan antar kode dengan KOMA jika dimasukkan satu baris).');
console.log('2. Buka Dashboard Vercel > Buka Proyek Anda > Settings > Environment Variables.');
console.log('3. Isi Key dengan: VALID_LICENSES');
console.log('4. Paste semua kode lisensi tadi ke dalam kolom Value (dipisahkan tanda koma tanpa spasi).');
console.log('   Contoh Value: FIN-A1B2-C3D4-E5F6,FIN-1111-2222-3333');
console.log('5. Klik Save, lalu klik tab Deployments > Redeploy.');
console.log('====================================================');
