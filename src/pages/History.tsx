import { useLiveQuery } from 'dexie-react-hooks'
import { db, LOCAL_USER_ID } from '@/lib/db'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { CategoryIcon } from '@/components/CategoryIcon'
import { EditTransactionModal } from '@/components/EditTransactionModal'
import type { Transaction } from '@/lib/db'
import { useState } from 'react'

export function History() {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  // Use a query to get transactions with joined category and wallet info
  const transactions = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('userId')
      .equals(LOCAL_USER_ID)
      .reverse()
      .sortBy('date')

    const categories = await db.categories.where('userId').equals(LOCAL_USER_ID).toArray()
    const wallets = await db.wallets.where('userId').equals(LOCAL_USER_ID).toArray()

    return txs.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)
      const wal = wallets.find(w => w.id === t.walletId)
      return { ...t, categoryName: cat?.name || '?', icon: cat?.icon || '•', walletName: wal?.name || '?' }
    })
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Riwayat Transaksi</h2>
        <Link to="/add-transaction" className="bg-primary text-primary-foreground p-2 rounded-full shadow hover:scale-105 transition">
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <div className="space-y-3">
        {transactions?.map(t => (
          <div 
            key={t.id} 
            className="p-4 bg-card rounded-2xl border flex justify-between items-center shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setEditingTransaction(t as Transaction)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shadow-inner text-foreground/80">
                <CategoryIcon name={t.icon} className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">{t.categoryName}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium mt-0.5 text-muted-foreground">
                  <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground/70">{t.walletName}</span>
                  <span>{formatDate(t.date)}</span>
                </div>
              </div>
            </div>
            <p className={`font-bold tracking-tight text-right ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
              {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
            </p>
          </div>
        ))}

        {transactions?.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10 bg-card rounded-2xl border border-dashed flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl">📝</div>
            <p>Belum ada transaksi.</p>
          </div>
        )}
      </div>

      <EditTransactionModal 
        transaction={editingTransaction} 
        onClose={() => setEditingTransaction(null)} 
      />
    </div>
  )
}
