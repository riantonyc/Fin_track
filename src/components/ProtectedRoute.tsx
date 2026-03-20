import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  // Mengecek apakah di browser ini sudah ada token lisensi aktif
  const isLicensed = localStorage.getItem('fintrack_license') === 'active'
  
  if (!isLicensed) {
    // Jika belum ada lisensi, tendang paksa ke halaman /license
    return <Navigate to="/license" replace />
  }

  // Jika aman, lanjutkan memuat halaman yang diminta
  return <Outlet />
}
