import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, LOCAL_USER_ID, type Transaction } from '@/lib/db'
import { CustomSelect } from '@/components/CustomSelect'
import { ConfirmModal } from '@/components/ConfirmModal'

interface Props {
  transaction: Transaction | null
  onClose: () => void
}

export function EditTransactionModal({ transaction, onClose }: Props) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    if (transaction) {
      setType(transaction.type as 'INCOME' | 'EXPENSE')
      setAmount(String(transaction.amount))
      setCategoryId(transaction.categoryId)
      setWalletId(transaction.walletId)
      setDate(new Date(transaction.date).toISOString().split('T')[0])
      setNote(transaction.note || '')
    }
  }, [transaction])

  const categories = useLiveQuery(() => 
    db.categories.where({ userId: LOCAL_USER_ID, type }).toArray()
  , [type])
  
  const wallets = useLiveQuery(() => 
    db.wallets.where('userId').equals(LOCAL_USER_ID).toArray()
  )

  if (!transaction) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !walletId || !amount || !date) return

    const parsedAmount = parseInt(amount, 10)
    const newDate = new Date(date).getTime()

    await db.transaction('rw', db.transactions, db.wallets, async () => {
      // 1. Revert efek dari transaksi lama
      const oldWallet = await db.wallets.get(transaction.walletId)
      if (oldWallet) {
        let revertedBalance = oldWallet.balance
        if (transaction.type === 'INCOME') revertedBalance -= transaction.amount
        else revertedBalance += transaction.amount
        await db.wallets.update(transaction.walletId, { balance: revertedBalance })
      }

      // 2. Berikan efek dari transaksi baru
      const newWallet = await db.wallets.get(walletId)
      if (newWallet) {
        let appliedBalance = newWallet.balance
        if (type === 'INCOME') appliedBalance += parsedAmount
        else appliedBalance -= parsedAmount
        await db.wallets.update(walletId, { balance: appliedBalance })
      }

      // 3. Update data transaksi
      await db.transactions.update(transaction.id, {
        type,
        amount: parsedAmount,
        categoryId,
        walletId,
        date: newDate,
        note
      })
    })

    onClose()
  }

  const handleDeleteClick = () => {
    setShowConfirmDelete(true)
  }

  const confirmDelete = async () => {
    if (!transaction) return
    await db.transaction('rw', db.transactions, db.wallets, async () => {
      const oldWallet = await db.wallets.get(transaction.walletId)
      if (oldWallet) {
        let revertedBalance = oldWallet.balance
        if (transaction.type === 'INCOME') revertedBalance -= transaction.amount
        else revertedBalance += transaction.amount
        await db.wallets.update(transaction.walletId, { balance: revertedBalance })
      }
      await db.transactions.delete(transaction.id)
    })
    setShowConfirmDelete(false)
    onClose()
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      >
        <div 
          className="bg-card w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">Edit Transaksi</h3>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="flex p-1 bg-muted rounded-xl shadow-inner">
            <button 
              type="button"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${type === 'EXPENSE' ? 'bg-card shadow-sm text-destructive' : 'text-muted-foreground'}`}
              onClick={() => {
                if (type !== 'EXPENSE') { setType('EXPENSE'); setCategoryId(''); }
              }}
            >
              Pengeluaran
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${type === 'INCOME' ? 'bg-card shadow-sm text-emerald-600' : 'text-muted-foreground'}`}
              onClick={() => {
                if (type !== 'INCOME') { setType('INCOME'); setCategoryId(''); }
              }}
            >
              Pemasukan
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Nominal (Rp)</label>
            <input 
              type="number" required
              className="w-full px-4 py-3 bg-background border rounded-2xl text-2xl font-bold outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition shadow-sm"
              value={amount} onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Kategori</label>
              <CustomSelect 
                value={categoryId} onChange={setCategoryId} placeholder="Pilih Kategori"
                options={categories?.map(c => ({ value: c.id, label: c.name, icon: c.icon })) || []}
              />
            </div>
            <div className="relative z-10">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Dompet</label>
              <CustomSelect 
                value={walletId} onChange={setWalletId} placeholder="Pilih Dompet"
                options={wallets?.map(w => ({ value: w.id, label: w.name, icon: w.type === 'CASH' ? '💵' : w.type === 'BANK' ? '🏦' : '📱' })) || []}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Tanggal</label>
              <input 
                type="date" required
                className="w-full px-3 py-3 border rounded-xl text-sm bg-background outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition shadow-sm"
                value={date} onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Catatan</label>
              <input 
                type="text"
                className="w-full px-3 py-3 border rounded-xl text-sm bg-background outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition shadow-sm"
                value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Keterangan..."
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold shadow-md transition-transform active:scale-[0.98] hover:bg-primary/90">
              Simpan Perubahan
            </button>
            <button type="button" onClick={handleDeleteClick} className="w-full bg-destructive/10 text-destructive py-3.5 rounded-xl text-sm font-bold transition hover:bg-destructive hover:text-white">
              Hapus Transaksi
            </button>
          </div>
        </form>
      </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirmDelete}
        title="Hapus Transaksi?"
        message="Anda yakin ingin menghapus catatan transaksi ini? Saldo dompet akan otomatis disesuaikan kembali."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  )
}

