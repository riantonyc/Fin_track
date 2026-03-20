import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ShieldCheck, Key } from 'lucide-react'

export function License() {
  const [license, setLicense] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!license.trim()) {
      setError('Harap masukkan kode lisensi')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Panggil API Vercel
      const response = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license: license.trim() })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        // Simpan token tanda bahwa user ini resmi / punya lisensi valid di localStorage
        localStorage.setItem('fintrack_license', 'active')
        // Arahkan otomatis ke Dashboard halaman login
        navigate('/', { replace: true })
      } else {
        // Tampilkan pesan error jika server mengembalikan status 401
        setError(data.message || 'Kode lisensi ditolak.')
      }
    } catch (err) {
      console.error(err)
      // Jika error bukan dari API (misalnya gagal koneksi)
      setError('Terjadi kesalahan saat memverifikasi kode. Jika Anda sedang offline, pastikan Anda terhubung ke internet untuk verifikasi lisensi pertama kali.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border rounded-3xl shadow-xl p-8 relative overflow-hidden">
        {/* Dekorasi Latar Belakang Kotak */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-destructive/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Aktivasi FinTrack</h1>
          <p className="text-sm text-muted-foreground mt-2">Silakan masukkan Kunci Lisensi Premium Anda untuk membuka akses aplikasi.</p>
        </div>

        <form onSubmit={handleVerify} className="relative z-10 space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kunci Lisensi</label>
            </div>
            <input 
              type="text" 
              placeholder="FIN-XXXX-XXXX-XXXX"
              className={`w-full px-4 py-3 bg-background border-2 rounded-xl text-center font-mono font-bold uppercase tracking-widest outline-none transition-all shadow-sm focus:ring-4 ${error ? 'border-destructive focus:ring-destructive/20 focus:border-destructive' : 'focus:ring-primary/20 focus:border-primary'}`}
              value={license} 
              onChange={(e) => setLicense(e.target.value.toUpperCase())}
              disabled={loading}
              autoFocus
            />
            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            {!error && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Lisensi asli akan diotentikasi ke server utama sebelum diberikan izin akses penuh secara permanen.</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || !license.trim()}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98] transition outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Verifikasi & Masuk"}
          </button>
        </form>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">© 2026 FinTrack Premium Edition.</p>
    </div>
  )
}
