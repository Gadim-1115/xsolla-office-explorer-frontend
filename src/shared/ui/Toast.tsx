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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isAchievement = toast.type === 'achievement'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all ${
              isAchievement
                ? 'border-amber-400/50 bg-amber-950/90 text-amber-100'
                : isError
                  ? 'border-rose-500/50 bg-rose-950/90 text-rose-100'
                  : 'border-emerald-500/50 bg-emerald-950/90 text-emerald-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isAchievement ? (
                <Sparkles className="h-5 w-5 text-amber-400" />
              ) : isError ? (
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs opacity-85">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded p-1 opacity-70 hover:opacity-100 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
