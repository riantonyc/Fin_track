import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, LOCAL_USER_ID } from '@/lib/db'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { nanoid } from 'nanoid'
import { CustomSelect } from '@/components/CustomSelect'
import { CategoryIcon, IconMap } from '@/components/CategoryIcon'
import { EditTransactionModal } from '@/components/EditTransactionModal'
import type { Transaction } from '@/lib/db'

export function Dashboard() {
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE' | null>(null)
  const [timeFilter, setTimeFilter] = useState<'Week' | 'Month' | 'Year'>('Month')
  
  // Edit State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  // States for Transaction Form
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  // States for Quick Add Category
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('Package')

  // Queries
  const balance = useLiveQuery(async () => {
    const wallets = await db.wallets.where('userId').equals(LOCAL_USER_ID).toArray()
    return wallets.reduce((sum, w) => sum + w.balance, 0)
  }) || 0

  const recentTransactions = useLiveQuery(async () => {
    const txs = await db.transactions.where('userId').equals(LOCAL_USER_ID).reverse().sortBy('date')
    const categories = await db.categories.where('userId').equals(LOCAL_USER_ID).toArray()
    
    return txs.slice(0, 5).map(t => {
      const cat = categories.find(c => c.id === t.categoryId)
      return { ...t, categoryName: cat?.name || '?', icon: cat?.icon || 'Package' }
    })
  })

  const formCategories = useLiveQuery(() => 
    formType ? db.categories.where({ userId: LOCAL_USER_ID, type: formType }).toArray() : []
  , [formType])

  const wallets = useLiveQuery(() => db.wallets.where('userId').equals(LOCAL_USER_ID).toArray())

  // Time boundaries based on filter
  const getBoundaries = () => {
    const now = new Date()
    if (timeFilter === 'Week') {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay() + 1)
      start.setHours(0,0,0,0)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23,59,59,999)
      return { start: start.getTime(), end: end.getTime() }
    } else if (timeFilter === 'Month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime()
      return { start, end }
    } else {
      const start = new Date(now.getFullYear(), 0, 1).getTime()
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59).getTime()
      return { start, end }
    }
  }

  // Filtered Transations for Metrics
  const filteredTransactions = useLiveQuery(async () => {
    const { start, end } = getBoundaries()
    return await db.transactions
      .where('userId').equals(LOCAL_USER_ID)
      .filter(t => t.date >= start && t.date <= end)
      .toArray()
  }, [timeFilter]) || []

  const stats = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'INCOME') acc.income += t.amount
    else acc.expense += t.amount
    return acc
  }, { income: 0, expense: 0 })

  const categoryData = useLiveQuery(async () => {
    const { start, end } = getBoundaries()
    const txs = await db.transactions
      .where('userId').equals(LOCAL_USER_ID)
      .filter(t => t.date >= start && t.date <= end && t.type === 'EXPENSE')
      .toArray()

    const categories = await db.categories.where('userId').equals(LOCAL_USER_ID).toArray()
    
    const catMap: Record<string, {name: string, amount: number, color: string}> = {}
    const colors = ['#34d399', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
    
    txs.forEach(t => {
      if(!catMap[t.categoryId]) {
         const cat = categories.find(c => c.id === t.categoryId);
         catMap[t.categoryId] = {
           name: cat?.name || 'Lainnya',
           amount: 0,
           color: colors[Object.keys(catMap).length % colors.length]
         }
      }
      catMap[t.categoryId].amount += t.amount;
    })
    return Object.values(catMap).sort((a,b) => b.amount - a.amount);
  }, [timeFilter]) || []

  // Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!newCategoryName || !formType) return

    const newCatId = nanoid()
    await db.categories.add({
      id: newCatId,
      userId: LOCAL_USER_ID,
      name: newCategoryName,
      icon: newCategoryIcon,
      type: formType
    })

    setCategoryId(newCatId)
    setNewCategoryName('')
    setShowAddCategory(false)
  }

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !walletId || !amount || !date || !formType) return

    const parsedAmount = parseInt(amount, 10)

    await db.transaction('rw', db.transactions, db.wallets, async () => {
      await db.transactions.add({
        id: nanoid(),
        userId: LOCAL_USER_ID,
        walletId,
        categoryId,
        type: formType,
        amount: parsedAmount,
        note,
        date: new Date(date).getTime(),
        createdAt: Date.now()
      })

      const wallet = await db.wallets.get(walletId)
      if (wallet) {
        const newBalance = formType === 'INCOME' 
          ? wallet.balance + parsedAmount 
          : wallet.balance - parsedAmount
        await db.wallets.update(walletId, { balance: newBalance })
      }
    })

    setAmount('')
    setCategoryId('')
    setNote('')
    setFormType(null)
  }

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground p-6 rounded-3xl shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.54-1.22-2.8-2.65-3.19V5h-2v1.47c-1.39.31-2.66 1.4-2.66 3.01 0 1.95 1.71 2.65 3.86 3.19 1.77.45 2.34 1.05 2.34 1.83 0 .86-.84 1.51-2.18 1.51-1.54 0-2.21-.76-2.28-1.78h-1.71c.09 1.83 1.36 2.99 2.99 3.32V19h2v-1.44c1.44-.28 2.76-1.35 2.76-3.1 0-1.87-1.46-2.63-3.88-3.32z"/>
          </svg>
        </div>
        <h2 className="text-sm font-medium opacity-90 relative z-10">Total Saldo Terakhir</h2>
        <p className="text-4xl font-bold mt-2 tracking-tight relative z-10">{formatRupiah(balance)}</p>
        
        <div className="grid grid-cols-2 gap-3 mt-5 relative z-10">
          <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-500/30">
            <p className="text-emerald-50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1">Pemasukan (Bulan Ini)</p>
            <p className="font-bold text-white tracking-tight leading-none text-lg sm:text-xl">{formatRupiah(stats.income)}</p>
          </div>
          <div className="bg-destructive/20 backdrop-blur-md rounded-2xl p-3 border border-destructive/30">
            <p className="text-red-50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1">Pengeluaran (Bulan Ini)</p>
            <p className="font-bold text-white tracking-tight leading-none text-lg sm:text-xl">{formatRupiah(stats.expense)}</p>
          </div>
        </div>
        
        {!formType && (
          <div className="mt-6 flex gap-3 relative z-10 animate-in fade-in duration-300">
            <button onClick={() => setFormType('INCOME')} className="bg-white/20 hover:bg-white/30 transition text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex-1 text-center backdrop-blur-sm shadow-sm ring-1 ring-white/30">
              + Pemasukan
            </button>
            <button onClick={() => setFormType('EXPENSE')} className="bg-white/20 hover:bg-white/30 transition text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex-1 text-center backdrop-blur-sm shadow-sm ring-1 ring-white/30">
              - Pengeluaran
            </button>
          </div>
        )}
      </section>

      {/* QUICK TRANSACTION FORM (CLASSIC STYLE) */}
      {formType && (
        <section className="bg-card p-5 rounded-3xl border shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className={`font-bold text-lg ${formType === 'INCOME' ? 'text-emerald-500' : 'text-destructive'}`}>
              Catat {formType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
            </h3>
            <button onClick={() => { setFormType(null); setShowAddCategory(false); }} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition">✕</button>
          </div>

          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Nominal (Rp)</label>
              <input 
                type="number" required
                className="w-full px-4 py-3 bg-background border rounded-2xl text-2xl font-bold outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition shadow-sm"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0" autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20 w-full">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori</label>
                  {!showAddCategory && (
                    <button type="button" onClick={() => setShowAddCategory(true)} className="text-[10px] font-bold text-primary hover:underline">+ Baru</button>
                  )}
                </div>
                
                {showAddCategory ? (
                  <div className="bg-muted p-2.5 rounded-xl border flex flex-col gap-3 shadow-inner animate-in fade-in">
                    <div>
                      <input 
                        list="category-suggestions"
                        type="text" placeholder="Ketik Nama Kategori..." 
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border outline-none focus:border-primary"
                        value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                      />
                      <datalist id="category-suggestions">
                        {Array.from(new Set([
                          ...(formType === 'INCOME' ? ['Gaji', 'Bonus', 'Pemberian', 'Investasi'] : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan']),
                          ...(formCategories?.map(c => c.name) || [])
                        ])).map(name => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>

                    <div className="bg-background p-2 rounded-lg border flex flex-wrap gap-1.5 justify-center max-h-48 overflow-y-auto">
                      {Object.keys(IconMap).map(iconName => (
                        <button 
                          key={iconName} type="button" 
                          onClick={() => setNewCategoryIcon(iconName)}
                          className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${newCategoryIcon === iconName ? 'bg-primary text-primary-foreground scale-110 shadow-md ring-2 ring-primary ring-offset-1' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                          <CategoryIcon name={iconName} className="w-5 h-5" />
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={handleAddCategory} className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-1.5 rounded-lg hover:bg-primary/90">Simpan</button>
                      <button type="button" onClick={() => setShowAddCategory(false)} className="flex-1 bg-background text-muted-foreground text-xs font-bold py-1.5 rounded-lg border hover:bg-muted">Batal</button>
                    </div>
                  </div>
                ) : (
                  <CustomSelect 
                    value={categoryId} onChange={setCategoryId} placeholder="Pilih Kategori"
                    options={formCategories?.map(c => ({ value: c.id, label: c.name, icon: c.icon })) || []}
                  />
                )}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Catatan (Opsional)</label>
                <input 
                  type="text"
                  className="w-full px-3 py-3 border rounded-xl text-sm bg-background outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition shadow-sm"
                  value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Keterangan..."
                />
              </div>
            </div>

            <button type="submit" className={`w-full mt-2 text-white py-3.5 rounded-xl text-sm font-bold shadow-md transition-transform active:scale-[0.98] ${formType === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-destructive hover:bg-destructive/90'}`}>
              Simpan Transaksi
            </button>
          </form>
        </section>
      )}

      {/* METRICS & RECENT TRANSACTIONS */}
      {!formType && (
        <>
          {/* Time Filters */}
          <div className="bg-card border p-1.5 rounded-2xl flex gap-1 shadow-sm">
            {['Week', 'Month', 'Year'].map(f => (
              <button 
                key={f}
                onClick={() => setTimeFilter(f as any)}
                className={`flex-1 font-semibold text-sm py-2 rounded-xl transition ${timeFilter === f ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <section className="bg-card rounded-3xl border shadow-sm p-5 animate-in fade-in duration-500">
            <h3 className="text-base font-bold text-foreground mb-6">Spending by Category</h3>
            
            <div className="h-44 w-full relative mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(val: any) => formatRupiah(Number(val) || 0)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {categoryData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">Bulan ini belum ada pengeluaran</div>
              )}
            </div>

            <div className="space-y-4">
              {categoryData.map(cat => (
                <div key={cat.name} className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-foreground/80">{cat.name}</span>
                  </div>
                  <span className="text-foreground tracking-tight">{formatRupiah(cat.amount)}</span>
                </div>
              ))}
            </div>
          </section>
          
          <section className="space-y-3 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold">Recent Transactions</h3>
              <Link to="/history" className="text-sm text-primary font-bold hover:underline">See All</Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentTransactions?.map(t => (
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
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{formatDate(t.date)}</p>
                    </div>
                  </div>
                  <p className={`font-bold tracking-tight text-right ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                  </p>
                </div>
              ))}

              {recentTransactions?.length === 0 && (
                <div className="p-8 bg-card rounded-2xl border border-dashed shadow-sm text-center text-muted-foreground flex flex-col items-center">
                  <span className="text-3xl mb-2">💸</span>
                  <p className="text-sm font-medium">Belum ada transaksi.</p>
                  <p className="text-xs mt-1 opacity-70">Catat pemasukan atau pengeluaran pertama Anda.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Edit Modal */}
      <EditTransactionModal 
        transaction={editingTransaction} 
        onClose={() => setEditingTransaction(null)} 
      />
    </div>
  )
}
