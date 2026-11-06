import { CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'achievement'
  title: string
  description?: string
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isAchievement = toast.type === 'achievement'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className="pointer-events-auto relative flex items-start gap-3 rounded-xl border border-[#2F4045] bg-[#233134] p-4 text-white shadow-[0_14px_40px_rgba(0,0,0,0.14)] overflow-hidden transition-all"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-[3px] ${
                isError ? 'bg-[#3A2429]0' : 'bg-[#80EAFF]'
              }`}
            />
            <div className="mt-0.5 shrink-0">
              {isAchievement ? (
                <Sparkles className="h-5 w-5 text-[#80EAFF]" />
              ) : isError ? (
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-[#80EAFF]" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[#9DB0B4]">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded p-1 text-[#9DB0B4] hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
