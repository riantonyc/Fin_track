import { useLiveQuery } from 'dexie-react-hooks'
import { db, LOCAL_USER_ID } from '@/lib/db'
import { formatRupiah, formatDate } from '@/lib/utils'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'
import { CategoryIcon } from '@/components/CategoryIcon'
import { EditTransactionModal } from '@/components/EditTransactionModal'
import { Plus } from 'lucide-react'
import type { Transaction } from '@/lib/db'

export function History() {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [timeFilter, setTimeFilter] = useState<'Week'|'Month'|'Year'>('Week')

  const now = new Date()
  
  // Calculate boundaries based on filter
  const getBoundaries = () => {
    if (timeFilter === 'Week') {
      const start = new Date(now)
      const currentDay = start.getDay() || 7 // Ubah format Hari Minggu js (0) menjadi (7)
      start.setDate(start.getDate() - currentDay + 1) // Geser mundur ke hari Senin
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

  const { start, end } = getBoundaries()

  const rawTransactions = useLiveQuery(() => 
    db.transactions.where('userId').equals(LOCAL_USER_ID)
      .filter(t => t.date >= start && t.date <= end)
      .toArray()
  , [start, end]) || []

  const categories = useLiveQuery(() => db.categories.where('userId').equals(LOCAL_USER_ID).toArray()) || []
  const wallets = useLiveQuery(() => db.wallets.where('userId').equals(LOCAL_USER_ID).toArray()) || []

  // Derived Trend Data (Bar Chart)
  const trendData = (() => {
    if (timeFilter === 'Week') {
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      const data = days.map((d, i) => ({ name: d, amount: 0, index: i+1 })) 
      rawTransactions.forEach(t => {
        if (t.type === 'EXPENSE') {
          let day = new Date(t.date).getDay()
          if (day === 0) day = 7 
          const target = data.find(d => d.index === day)
          if (target) target.amount += t.amount
        }
      })
      return data
    } else if (timeFilter === 'Month') {
      const weeks = ['1-7', '8-14', '15-21', '22-28', '29+']
      const data = weeks.map(w => ({ name: w, amount: 0 }))
      rawTransactions.forEach(t => {
        if (t.type === 'EXPENSE') {
          const d = new Date(t.date).getDate()
          const wIdx = Math.min(Math.floor((d - 1) / 7), 4)
          data[wIdx].amount += t.amount
        }
      })
      return data
    } else {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const data = months.map(m => ({ name: m, amount: 0 }))
      rawTransactions.forEach(t => {
        if (t.type === 'EXPENSE') {
          const mIdx = new Date(t.date).getMonth()
          data[mIdx].amount += t.amount
        }
      })
      return data
    }
  })();

  const topCategoryName = (() => {
    const expenses = rawTransactions.filter(t => t.type === 'EXPENSE')
    if(expenses.length === 0) return 'None'
    const catMap = {} as any
    expenses.forEach(t => {
      catMap[t.categoryId] = (catMap[t.categoryId] || 0) + t.amount
    })
    const sorted = Object.entries(catMap).sort((a:any,b:any) => b[1] - a[1])
    const topId = sorted[0][0]
    return categories.find(c => c.id === topId)?.name || 'Other'
  })()

  // Derived Category Breakdown
  const categoryBreakdown = (() => {
    const expenses = rawTransactions.filter(t => t.type === 'EXPENSE')
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0)
    
    const catMap: Record<string, {name: string, amount: number, color: string, icon: string}> = {}
    const colors = ['#f59e0b', '#a855f7', '#ec4899', '#34d399', '#3b82f6'];
    
    expenses.forEach(t => {
      if(!catMap[t.categoryId]) {
         const cat = categories.find(c => c.id === t.categoryId);
         catMap[t.categoryId] = {
           name: cat?.name || 'Lainnya',
           amount: 0,
           color: colors[Object.keys(catMap).length % colors.length],
           icon: cat?.icon || 'Package'
         }
      }
      catMap[t.categoryId].amount += t.amount;
    })
    
    return Object.values(catMap)
      .sort((a,b) => b.amount - a.amount)
      .map(c => ({
        ...c,
        percentage: totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0
      }))
  })();

  const transactionsList = rawTransactions.map(t => {
    const cat = categories.find(c => c.id === t.categoryId)
    const wal = wallets.find(w => w.id === t.walletId)
    return { ...t, categoryName: cat?.name || '?', icon: cat?.icon || 'Package', walletName: wal?.name || '?' }
  }).sort((a,b) => b.date - a.date)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Statistics</h2>
        <Link to="/" className="bg-primary text-primary-foreground p-2 rounded-full shadow hover:scale-105 transition">
          <Plus className="w-5 h-5" />
        </Link>
      </div>

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

      {/* Spending Trends */}
      <section className="bg-card rounded-3xl p-5 border shadow-sm">
        <h3 className="font-bold text-lg text-foreground mb-6">Spending Trends</h3>
        
        <div className="h-40 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{top: 0, right: 0, left: 0, bottom: 0}}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <RechartsTooltip 
                cursor={{fill: 'var(--color-muted)'}}
                formatter={(val: any) => formatRupiah(Number(val) || 0)}
                contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)' }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {trendData.map((entry, index) => {
                  const isMax = entry.amount === Math.max(...trendData.map(d => d.amount));
                  return <Cell key={`cell-${index}`} fill={isMax ? 'var(--color-primary)' : 'hsl(var(--primary)/0.6)'} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight Card */}
        <div className="bg-muted mt-5 p-4 rounded-2xl border text-sm flex gap-3 text-foreground/80 font-medium">
          <div className="text-xl">💡</div>
          <p>You spent <span className="font-bold">{formatRupiah(trendData.reduce((s,d)=>s+d.amount,0))}</span> this {timeFilter.toLowerCase()}. Your top spending category is <span className="font-bold text-foreground">{topCategoryName}</span>.</p>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="bg-card rounded-3xl p-5 border shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-foreground mb-2">Category Breakdown</h3>
        
        <div className="space-y-6">
          {categoryBreakdown.map((cat, i) => (
            <div key={i} className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted border shadow-sm" style={{ color: cat.color }}>
                    <CategoryIcon name={cat.icon} className="w-5 h-5 opacity-90" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{cat.name}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground">{cat.percentage}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-sm tracking-tight">{formatRupiah(cat.amount)}</p>
                </div>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}></div>
              </div>
            </div>
          ))}
          
          {categoryBreakdown.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">No spending in this period.</p>
          )}
        </div>
      </section>

      {/* Detailed Transactions */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold px-1">Detailed Transactions</h3>
        <div className="space-y-3">
          {transactionsList.map(t => (
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
          {transactionsList.length === 0 && (
             <div className="p-8 bg-card rounded-2xl border border-dashed text-center text-muted-foreground text-sm">Belum ada transaksi.</div>
          )}
        </div>
      </section>

      <EditTransactionModal 
        transaction={editingTransaction} 
        onClose={() => setEditingTransaction(null)} 
      />
    </div>
  )
}
