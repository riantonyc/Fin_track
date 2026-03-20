export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-[90%] max-w-sm p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 border border-border">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="flex-1 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition outline-none focus:ring-2 focus:ring-muted-foreground/30"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-3 bg-destructive text-destructive-foreground font-bold rounded-xl hover:bg-destructive/90 transition shadow-lg shadow-destructive/20 outline-none focus:ring-2 focus:ring-destructive/40"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
