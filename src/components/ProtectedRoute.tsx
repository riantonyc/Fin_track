import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  // Cek apakah aplikasi sedang di-develop di komputer lokal (localhost)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  
  // Mengecek apakah di browser ini sudah ada token lisensi aktif
  const isLicensed = localStorage.getItem('fintrack_license') === 'active'
  
  if (!isLicensed && !isLocalhost) {
    // Jika belum ada lisensi dan bukan jalan di lokal, tendang paksa ke halaman /license
    return <Navigate to="/license" replace />
  }

  // Jika aman, lanjutkan memuat halaman yang diminta
  return <Outlet />
}
