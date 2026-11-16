import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  badge?: ReactNode
  headerAction?: ReactNode
  children: ReactNode
  maxWidthClass?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  headerAction,
  children,
  maxWidthClass = 'max-w-3xl',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidthClass} rounded-xl border border-[#2F4045] bg-[#233134] text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[3px] w-full bg-[#80EAFF]" />
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2F4045] px-6 py-4 bg-[#233134]">
          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-white">
                {title}
              </h2>
              {badge}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-[#9DB0B4]">{subtitle}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            {headerAction}
            <button
              type="button"
              onClick={onClose}
              className="rounded-[6px] bg-[#2F4045] p-1.5 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
