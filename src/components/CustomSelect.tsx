import { useState, useRef, useEffect } from 'react'
import { CategoryIcon } from '@/components/CategoryIcon'

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string; icon?: string }[]
  placeholder?: string
  className?: string
  placement?: 'top' | 'bottom'
}

export function CustomSelect({ value, onChange, options, placeholder = 'Pilih...', className = '', placement = 'bottom' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm bg-card outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition shadow-sm"
      >
        <span className={selectedOption ? 'text-foreground font-medium' : 'text-muted-foreground'}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon && <CategoryIcon name={selectedOption.icon} className="w-5 h-5" />}
              <span>{selectedOption.label}</span>
            </span>
          ) : placeholder}
        </span>
        <svg className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>

      <div 
        className={`absolute z-[100] w-full py-1.5 bg-card border rounded-xl shadow-xl max-h-60 overflow-y-auto transition-all ${placement === 'top' ? 'bottom-full mb-2 origin-bottom' : 'mt-2 origin-top'} ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted ${value === option.value ? 'bg-primary/10 text-primary font-bold' : 'text-foreground font-medium'}`}
            onClick={() => {
              onChange(option.value)
              setIsOpen(false)
            }}
          >
            {option.icon && <CategoryIcon name={option.icon} className="w-5 h-5 text-foreground/70" />}
            <span>{option.label}</span>
          </button>
        ))}
        {options.length === 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground text-center">Data tidak ditemukan</div>
        )}
      </div>
    </div>
  )
}
