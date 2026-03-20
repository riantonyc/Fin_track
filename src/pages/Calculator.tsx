import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatRupiah } from '@/lib/utils'
import { CustomSelect } from '@/components/CustomSelect'

export function Calculator() {
  const [tab, setTab] = useState<'KALKULATOR' | 'KONVERSI'>('KALKULATOR')
  
  // Custom Math Calculator State
  const [display, setDisplay] = useState('0')
  const [equation, setEquation] = useState('')

  // Currency Converter State
  const [rates, setRates] = useState<Record<string, number>>({})
  const [amount, setAmount] = useState('1')
  const [fromCurr, setFromCurr] = useState('USD')
  const [toCurr, setToCurr] = useState('IDR')
  const [converted, setConverted] = useState(0)

  useEffect(() => {
    // Fetch rates relative to IDR or USD
    axios.get('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => setRates(res.data.rates))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (rates[fromCurr] && rates[toCurr]) {
      const baseInUsd = parseFloat(amount || '0') / rates[fromCurr]
      setConverted(baseInUsd * rates[toCurr])
    } else {
      setConverted(0)
    }
  }, [amount, fromCurr, toCurr, rates])

  const handleCalcClick = (val: string) => {
    if (val === 'C') { setDisplay('0'); setEquation(''); return }
    if (val === '⌫') { setDisplay(display.length > 1 ? display.slice(0, -1) : '0'); return }
    if (val === '%') { setDisplay(String(parseFloat(display) / 100)); return }
    if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        const res = eval(equation.replace(/×/g, '*') + display)
        setDisplay(String(res))
        setEquation('')
      } catch (e) { setDisplay('Error') }
      return
    }
    if (['+', '-', '×', '/'].includes(val)) {
      setEquation(equation + display + val)
      setDisplay('0')
      return
    }
    if (val === '.' && display.includes('.')) return
    
    setDisplay(display === '0' && val !== '.' ? val : display + val)
  }

  const calcButtons = ['C','⌫','%','/','7','8','9','×','4','5','6','-','1','2','3','+','00','0','.','=']
  const currencyOptions = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD', 'KRW', 'CNY']

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Alat Finansial</h2>
      
      <div className="flex p-1.5 bg-muted rounded-xl shadow-inner">
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${tab === 'KALKULATOR' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}
          onClick={() => setTab('KALKULATOR')}
        >
          Kalkulator
        </button>
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${tab === 'KONVERSI' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}
          onClick={() => setTab('KONVERSI')}
        >
          Konversi Kurs
        </button>
      </div>

      {tab === 'KALKULATOR' && (
        <div className="bg-card p-5 rounded-3xl shadow-sm border max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-muted p-4 rounded-2xl mb-5 text-right overflow-hidden shadow-inner border border-border">
            <div className="text-sm text-muted-foreground h-5 mb-1 font-mono tracking-wider">{equation}</div>
            <div className="text-4xl font-bold tracking-tight overflow-x-auto">{display}</div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {calcButtons.map(btn => (
              <button 
                key={btn} 
                onClick={() => handleCalcClick(btn)}
                className={`py-4 text-xl font-bold rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-primary/40 focus:outline-none active:scale-90 ${
                  btn === 'C' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                  btn === '⌫' ? 'bg-destructive/5 text-destructive/80 border border-destructive/10' :
                  btn === '=' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' :
                  ['+','-','×','/','%'].includes(btn) ? 'bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30' : 'bg-background border border-border hover:bg-muted'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'KONVERSI' && (
        <div className="bg-card p-5 rounded-3xl border shadow-sm space-y-5 flex flex-col items-stretch animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-center text-sm text-muted-foreground mb-4">Kurs Mata Uang Live API</h3>
          <div className="relative z-[60]">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Jumlah & Mata Uang Asal</label>
            <div className="flex gap-2">
              <input 
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-lg font-bold bg-background outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              <CustomSelect 
                className="w-32 flex-shrink-0"
                value={fromCurr} onChange={setFromCurr}
                options={currencyOptions.map(c => ({ value: c, label: c }))}
              />
            </div>
          </div>

          <div className="flex justify-center text-muted-foreground py-1 relative z-10">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shadow-inner">
              ↓
            </div>
          </div>

          <div className="relative z-50">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Mata Uang Tujuan</label>
            <div className="flex gap-2">
              <input 
                type="text" readOnly 
                value={toCurr === 'IDR' ? formatRupiah(converted) : new Intl.NumberFormat('en-US', { style: 'currency', currency: toCurr }).format(converted)}
                className="w-full px-4 py-3 border border-primary/20 rounded-xl text-lg font-bold bg-primary/5 text-primary outline-none cursor-default shadow-inner"
              />
              <CustomSelect 
                className="w-32 flex-shrink-0"
                value={toCurr} onChange={setToCurr}
                options={currencyOptions.map(c => ({ value: c, label: c }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
