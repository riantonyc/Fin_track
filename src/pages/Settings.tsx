import { useState, useRef } from 'react'
import { exportUserData, importUserData } from '@/lib/backup'
import { db, LOCAL_USER_ID } from '@/lib/db'
import { formatRupiah } from '@/lib/utils'
import { ConfirmModal } from '@/components/ConfirmModal'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function Settings() {
  const [loading, setLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'))
  const [showResetModal, setShowResetModal] = useState(false)
  const [showCleanModal, setShowCleanModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportCSV = async () => {
    const txs = await db.transactions.where('userId').equals(LOCAL_USER_ID).toArray()
    const categories = await db.categories.where('userId').equals(LOCAL_USER_ID).toArray()
    const wallets = await db.wallets.where('userId').equals(LOCAL_USER_ID).toArray()

    let csvContent = "Tanggal,Dompet,Kategori,Tipe,Nominal,Catatan\n"
    
    txs.forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || '?'
      const wal = wallets.find(w => w.id === t.walletId)?.name || '?'
      const date = new Date(t.date).toLocaleDateString('id-ID')
      csvContent += `${date},${wal},${cat},${t.type},${t.amount},"${t.note || ''}"\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `fintrack_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = async () => {
    setLoading(true)
    const txs = await db.transactions.where('userId').equals(LOCAL_USER_ID).sortBy('date')
    const categories = await db.categories.where('userId').equals(LOCAL_USER_ID).toArray()
    const wallets = await db.wallets.where('userId').equals(LOCAL_USER_ID).toArray()

    const doc = new jsPDF()
    doc.text("Laporan Transaksi FinTrack", 14, 15)

    const tableData = txs.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      wallets.find(w => w.id === t.walletId)?.name || '?',
      categories.find(c => c.id === t.categoryId)?.name || '?',
      t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
      formatRupiah(t.amount),
      t.note || ''
    ])

    autoTable(doc, {
      head: [['Tanggal', 'Dompet', 'Kategori', 'Tipe', 'Nominal', 'Catatan']],
      body: tableData,
      startY: 20,
    })

    doc.save(`fintrack_laporan_${Date.now()}.pdf`)
    setLoading(false)
  }

  const handleBackupJSON = async () => {
    const data = await exportUserData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `fintrack_backup_${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        const success = await importUserData(content)
        if (success) {
          alert("Data berhasil diimpor! Halaman akan dimuat ulang untuk memperbarui cache.")
          window.location.reload()
        } else {
          alert("Gagal mengimpor data. Format JSON tidak valid.")
        }
      }
    }
    reader.readAsText(file)
  }

  const executeCleanCategories = async () => {
    setLoading(true)
    try {
      const allTx = await db.transactions.where('userId').equals(LOCAL_USER_ID).toArray()
      const usedCategoryIds = new Set(allTx.map(t => t.categoryId))
      
      const allCat = await db.categories.where('userId').equals(LOCAL_USER_ID).toArray()
      const unusedCatIds = allCat.filter(c => !usedCategoryIds.has(c.id)).map(c => c.id)
      
      if (unusedCatIds.length > 0) {
        await db.categories.bulkDelete(unusedCatIds)
        alert(`Berhasil membersihkan ${unusedCatIds.length} histori nama kategori yang tidak terpakai!`)
        window.location.reload()
      } else {
        alert('Tidak ada histori kategori asing yang bisa dihapus. Semua rekomendasi saat ini sedang terpakai pada riwayat transaksi Anda.')
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan sistem saat membersihkan data.')
    }
    setLoading(false)
    setShowCleanModal(false)
  }

  const handleResetData = async () => {
    try {
      await db.transactions.where('userId').equals(LOCAL_USER_ID).delete()
      await db.wallets.where('userId').equals(LOCAL_USER_ID).delete()
      await db.categories.where('userId').equals(LOCAL_USER_ID).delete()
      await db.budgets.where('userId').equals(LOCAL_USER_ID).delete()
      await db.bills.where('userId').equals(LOCAL_USER_ID).delete()
      setShowResetModal(false)
      window.location.reload()
    } catch (err) {
      console.error('Reset error:', err)
      alert('Terjadi kesalahan saat mereset data.')
    }
  }

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Pengaturan</h2>

      <section className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Tampilan & Tema</h3>
        <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border shadow-sm hover:border-primary transition group outline-none focus:ring-2 focus:ring-primary/40">
          <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:rotate-12 transition-transform">{isDarkMode ? '🌙' : '☀️'}</span>
            <div className="text-left">
              <p className="font-bold text-sm">Mode Layar</p>
              <p className="text-xs text-muted-foreground">{isDarkMode ? 'Gelap (Dark Mode)' : 'Terang (Light Mode)'}</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </button>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Ekspor Data Transaksi</h3>
        <div className="grid gap-3">
          <button onClick={handleExportPDF} disabled={loading} className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border shadow-sm hover:border-primary focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition group">
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
              <div className="text-left">
                <p className="font-bold text-sm">Ekspor ke PDF</p>
                <p className="text-xs text-muted-foreground">Laporan rapi siap cetak</p>
              </div>
            </div>
            <span className="text-primary font-bold">→</span>
          </button>

          <button onClick={handleExportCSV} className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border shadow-sm hover:border-primary focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition group">
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
              <div className="text-left">
                <p className="font-bold text-sm">Ekspor ke Spreadsheet (CSV)</p>
                <p className="text-xs text-muted-foreground">Olah data di Excel / Sheets</p>
              </div>
            </div>
            <span className="text-primary font-bold">→</span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Pencadangan Profil / Pindah Perangkat</h3>
        <div className="bg-card p-5 rounded-2xl border shadow-sm relative overflow-hidden">
          <p className="text-sm mb-5 text-foreground leading-relaxed">Unduh seluruh data <span className="font-medium text-primary">(dompet, kategori, transaksi)</span> ke dalam format JSON untuk dipindahkan atau dicadangkan ke perangkat lain secara aman.</p>
          <div className="flex gap-3">
            <button onClick={handleBackupJSON} className="flex-[1.5] bg-secondary text-secondary-foreground font-bold py-3.5 rounded-xl hover:bg-secondary/80 focus:ring-2 focus:ring-secondary/40 outline-none transition shadow-sm border border-border">
              Unduh Backup
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 outline-none transition shadow-sm">
              Impor JSON
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImportJSON} accept=".json" className="hidden" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Pembersihan Histori</h3>
        <button onClick={() => setShowCleanModal(true)} disabled={loading} className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border shadow-sm hover:border-primary focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition group">
          <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:scale-110 transition-transform">🧹</span>
            <div className="text-left">
              <p className="font-bold text-sm">Hapus Rekomendasi Kategori</p>
              <p className="text-xs text-muted-foreground">Bersihkan nama kategori yang tidak terpakai</p>
            </div>
          </div>
          <span className="text-primary font-bold">→</span>
        </button>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h3 className="font-semibold text-sm text-destructive/70">Zona Berbahaya ⚠️</h3>
        <div className="bg-card p-5 rounded-2xl border border-destructive/20 shadow-sm">
          <p className="text-sm text-foreground leading-relaxed mb-4">Hapus <strong>semua data</strong> Anda secara permanen — termasuk seluruh dompet, kategori, dan riwayat transaksi. <span className="text-destructive font-medium">Tindakan ini tidak dapat diurungkan.</span></p>
          <button 
            onClick={() => setShowResetModal(true)}
            className="w-full py-3.5 bg-destructive/10 text-destructive border border-destructive/30 font-bold rounded-xl hover:bg-destructive hover:text-destructive-foreground outline-none focus:ring-2 focus:ring-destructive/40 transition"
          >
            🗑️  Reset Semua Data
          </button>
        </div>
      </section>

      <ConfirmModal
        isOpen={showResetModal}
        title="Reset Semua Data?"
        message="Tindakan ini akan menghapus SELURUH dompet, kategori, dan riwayat transaksi Anda secara permanen. Pastikan sudah melakukan backup terlebih dahulu!"
        onConfirm={handleResetData}
        onCancel={() => setShowResetModal(false)}
      />

      <ConfirmModal
        isOpen={showCleanModal}
        title="Bersihkan Histori Kategori?"
        message="Sistem akan menghapus nama kategori tidak terpakai dari daftar autocomplete. Riwayat transaksi Anda akan TETAP AMAN."
        onConfirm={executeCleanCategories}
        onCancel={() => setShowCleanModal(false)}
      />
    </div>
  )
}
