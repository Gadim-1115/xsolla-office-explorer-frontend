import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Trophy, X } from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'

const CONFETTI_COLORS = ['#80EAFF', '#A6F1FF', '#FFFFFF', '#145B6D', '#FB7185']
const CONFETTI_COUNT = 70

interface ConfettiPiece {
  id: number
  style: CSSProperties
}

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, id) => ({
    id,
    style: {
      left: `${Math.random() * 100}%`,
      width: `${6 + Math.random() * 5}px`,
      height: `${9 + Math.random() * 8}px`,
      backgroundColor: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
      borderRadius: id % 3 === 0 ? '9999px' : '2px',
      '--confetti-drift': `${(Math.random() - 0.5) * 40}vw`,
      '--confetti-spin': `${(Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720)}deg`,
      '--confetti-duration': `${2.6 + Math.random() * 1.8}s`,
      '--confetti-delay': `${Math.random() * 0.9}s`,
    } as CSSProperties,
  }))
}

/** Shown once, the moment a student reaches 100%: every zone unlocked and every logo found. */
export function CompletionCelebration() {
  const { isCelebrationOpen, closeCelebration, progress } = useExplorer()
  const [confetti] = useState<ConfettiPiece[]>(makeConfetti)
  const continueButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isCelebrationOpen) return
    continueButtonRef.current?.focus()
    // Capture phase + stopPropagation: Escape closes only this top layer, not the room view
    // underneath (RoomModal also closes itself on Escape from a window listener).
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      closeCelebration()
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isCelebrationOpen, closeCelebration])

  if (!isCelebrationOpen || !progress) return null

  const stats = [
    { label: 'Zones unlocked', value: `${progress.unlocked_zones_count} / ${progress.total_locked_zones}` },
    { label: 'Xsolla logos found', value: `${progress.found_eggs_count} / ${progress.total_easter_eggs}` },
    { label: 'Office explored', value: '100%' },
  ]

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={closeCelebration}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {confetti.map((piece) => (
          <span key={piece.id} className="confetti-piece" style={piece.style} />
        ))}
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-celebration-title"
        className="animate-room-dive-in relative w-full max-w-lg rounded-xl border border-[#80EAFF]/40 bg-[#233134] text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[3px] w-full bg-[#80EAFF]" />

        <button
          type="button"
          onClick={closeCelebration}
          className="absolute top-4 right-4 rounded-[6px] bg-[#2F4045] p-1.5 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center sm:px-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#80EAFF]/70 bg-[#153640] shadow-[0_0_0_8px_rgba(128,234,255,0.12)]">
            <Trophy className="h-8 w-8 text-[#80EAFF]" />
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#80EAFF]">
            100% Office Completed
          </p>
          <h2 id="completion-celebration-title" className="mt-2 text-xl font-bold text-white sm:text-2xl">
            You explored the whole 31st floor
          </h2>
          <p className="mt-3 max-w-sm text-sm text-[#9DB0B4]">
            Every locked zone is open and every hidden Xsolla logo is found. Welcome to Xsolla School Baku.
          </p>

          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[4px] border border-[#2F4045] bg-[#1B2628] px-2 py-3">
                <p className="text-base font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-[#9DB0B4]">{s.label}</p>
              </div>
            ))}
          </div>

          <button
            ref={continueButtonRef}
            type="button"
            onClick={closeCelebration}
            className="mt-6 w-full rounded-[6px] bg-[#80EAFF] px-4 py-2.5 text-sm font-bold text-[#0D1A1D] hover:bg-[#A6F1FF] transition cursor-pointer"
          >
            Keep exploring
          </button>
        </div>
      </div>
    </div>
  )
}
