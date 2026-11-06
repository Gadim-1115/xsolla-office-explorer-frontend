import { Check } from 'lucide-react'
import type { HotspotDTO } from '../../../shared/types/api.types'
import { XsollaEmblem } from '../../../shared/ui/XsollaLogo'

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
      onClick={(e) => {
        e.stopPropagation()
        onClaim(hotspot.id)
      }}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        left: `${hotspot.x_percent}%`,
        top: `${hotspot.y_percent}%`,
      }}
      title={hotspot.is_claimed ? `${hotspot.title} (Claimed)` : 'Hidden Xsolla emblem! Click to collect'}
      className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center rounded-full transition-all duration-300 ${
        hotspot.is_claimed
          ? 'h-9 w-9 border border-[#80EAFF]/70 bg-[#153640] text-[#80EAFF] cursor-default'
          : 'h-8 w-8 text-[#80EAFF] opacity-35 hover:opacity-100 hover:scale-125 hover:drop-shadow-[0_0_14px_rgba(128,234,255,0.9)] cursor-pointer'
      }`}
    >
      {hotspot.is_claimed ? (
        <Check className="h-4 w-4" />
      ) : (
        <XsollaEmblem className="h-full w-full" />
      )}
    </button>
  )
}
