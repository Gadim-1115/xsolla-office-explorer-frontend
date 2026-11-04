import { Sparkles, Check } from 'lucide-react'
import type { HotspotDTO } from '../../../shared/types/api.types'

interface EasterEggTriggerProps {
  hotspot: HotspotDTO
  onClaim: (id: string) => void
  isClaiming: boolean
}

export function EasterEggTrigger({
  hotspot,
  onClaim,
  isClaiming,
}: EasterEggTriggerProps) {
  return (
    <button
      type="button"
      disabled={hotspot.is_claimed || isClaiming}
      onClick={() => onClaim(hotspot.id)}
      style={{
        left: `${hotspot.x_percent}%`,
        top: `${hotspot.y_percent}%`,
      }}
      title={hotspot.is_claimed ? `${hotspot.title} (Claimed)` : 'Hidden Xsolla Logo!'}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition-all duration-300 ${
        hotspot.is_claimed
          ? 'bg-amber-500/30 border border-amber-400 text-amber-300 opacity-90 cursor-default'
          : 'bg-indigo-500/15 border border-white/15 text-indigo-300 opacity-30 hover:opacity-100 hover:scale-125 hover:bg-amber-500/30 hover:border-amber-400 hover:text-amber-300 cursor-pointer'
      }`}
    >
      {hotspot.is_claimed ? (
        <Check className="h-4 w-4" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
    </button>
  )
}
