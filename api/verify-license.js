export default function handler(req, res) {
  // Hanya melayani metode HTTP POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  // Mengambil kode lisensi yang dikirim dari React Frontend (Input User)
  const { license } = req.body

  if (!license) {
    return res.status(400).json({ valid: false, message: 'Lisensi wajib diisi' })
  }

  // Mengambil daftar lisensi valid dari Environment Variables Vercel
  const validLicensesString = process.env.VALID_LICENSES || ''

  // Memisahkan berdasarkan koma ke dalam Array, dan membuang spasi berlebih
  const validLicenses = validLicensesString.split(',').map(key => key.trim())

  // Mengecek apakah lisensi yang diketik pengunjung cocok dengan salah satu kode rahasia di atas
  const isValid = validLicenses.includes(license.trim())

  if (isValid) {
    // Opsional ke depan tingkat lanjut: Simpan status kode license terpakai di database lain (Supabase)
    return res.status(200).json({ valid: true, message: 'Akses Diberikan' })
  } else {
    return res.status(401).json({ valid: false, message: 'Kode Lisensi Tidak Valid atau Salah' })
  }
}
