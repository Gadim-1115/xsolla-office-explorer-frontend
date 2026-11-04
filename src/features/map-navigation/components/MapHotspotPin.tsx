import { Eye, Sparkles, Check, Droplets, Projector } from 'lucide-react'
import type { HotspotDTO } from '../../../shared/types/api.types'

interface MapHotspotPinProps {
  hotspot: HotspotDTO
  onSelect: (hotspot: HotspotDTO) => void
  onClaimEgg: (hotspotId: string) => void
}

export function MapHotspotPin({
  hotspot,
  onSelect,
  onClaimEgg,
}: MapHotspotPinProps) {
  if (hotspot.category === 'EASTER_EGG') {
    return (
      <button
        type="button"
        disabled={hotspot.is_claimed}
        onClick={(e) => {
          e.stopPropagation()
          onClaimEgg(hotspot.id)
        }}
        style={{
          left: `${hotspot.x_percent}%`,
          top: `${hotspot.y_percent}%`,
        }}
        title={hotspot.is_claimed ? 'Easter Egg Claimed!' : 'Hidden Xsolla Logo'}
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition-all ${
          hotspot.is_claimed
            ? 'bg-amber-500/30 border border-amber-400 text-amber-300 opacity-90'
            : 'bg-indigo-500/10 border border-white/10 text-indigo-300 opacity-25 hover:opacity-100 hover:scale-125 hover:bg-amber-500/30 hover:border-amber-400 hover:text-amber-200'
        }`}
      >
        {hotspot.is_claimed ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
      </button>
    )
  }

  const getIcon = () => {
    switch (hotspot.category) {
      case 'VIEWPOINT':
        return <Eye className="h-3.5 w-3.5" />
      case 'DISPENSER':
        return <Droplets className="h-3.5 w-3.5" />
      case 'PROJECTOR':
        return <Projector className="h-3.5 w-3.5" />
      default:
        return <Eye className="h-3.5 w-3.5" />
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onSelect(hotspot)
      }}
      style={{
        left: `${hotspot.x_percent}%`,
        top: `${hotspot.y_percent}%`,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-cyan-950/90 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 shadow-lg hover:bg-cyan-500 hover:text-slate-950 hover:scale-110 transition-all"
    >
      {getIcon()}
      <span>{hotspot.title}</span>
    </button>
  )
}
