import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, LOCAL_USER_ID } from '@/lib/db'
import { nanoid } from 'nanoid'
import { formatRupiah } from '@/lib/utils'
import { CustomSelect } from '@/components/CustomSelect'

export function Wallets() {
  const wallets = useLiveQuery(() => db.wallets.where('userId').equals(LOCAL_USER_ID).toArray())
  
  const [name, setName] = useState('')
  const [type, setType] = useState<'CASH' | 'BANK' | 'EWALLET'>('CASH')
  const [balance, setBalance] = useState('')

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !balance) return

    await db.wallets.add({
      id: nanoid(),
      userId: LOCAL_USER_ID,
      name,
      type,
      balance: parseInt(balance, 10),
      currency: 'IDR',
      createdAt: Date.now()
    })

    setName('')
    setBalance('')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dompet & Rekening</h2>
      
      <form onSubmit={handleAddWallet} className="bg-card p-5 rounded-2xl shadow-sm border space-y-4">
        <h3 className="font-semibold text-sm">Tambah Dompet Baru</h3>
        <input 
          type="text" required placeholder="Nama Dompet (mis. BCA)" 
          className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          value={name} onChange={(e) => setName(e.target.value)}
        />
        <div className="flex gap-3 relative z-10 w-full">
          <div className="flex-1">
            <CustomSelect 
              value={type} 
              onChange={(val: any) => setType(val)}
              options={[
                { value: 'CASH', label: 'Tunai', icon: '💵' },
                { value: 'BANK', label: 'Bank', icon: '🏦' },
                { value: 'EWALLET', label: 'E-Wallet', icon: '📱' },
              ]} 
            />
          </div>
          <input 
            type="number" required placeholder="Saldo Awal" 
            className="w-full px-4 py-3 border rounded-xl text-sm bg-background flex-[1.2] outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-bold"
            value={balance} onChange={(e) => setBalance(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-md">Simpan Dompet</button>
      </form>

      <div className="space-y-3">
        {wallets?.map(w => (
          <div key={w.id} className="p-4 bg-card rounded-2xl border flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {w.type === 'CASH' ? '💵' : w.type === 'BANK' ? '🏦' : '📱'}
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">{w.name}</p>
                <p className="text-[11px] font-medium text-muted-foreground">{w.type}</p>
              </div>
            </div>
            <p className="font-bold text-primary tracking-tight">{formatRupiah(w.balance)}</p>
          </div>
        ))}
        {wallets?.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8 bg-card rounded-2xl border border-dashed">
            Belum ada dompet. Tambahkan dompet pertama Anda.
          </div>
        )}
      </div>
    </div>
  )
}
