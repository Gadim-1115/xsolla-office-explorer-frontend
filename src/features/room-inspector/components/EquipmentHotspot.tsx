import { useState } from 'react'
import { Coffee, Refrigerator, Droplets, Projector, Eye } from 'lucide-react'
import type { HotspotDTO } from '../../../shared/types/api.types'

interface EquipmentHotspotProps {
  hotspot: HotspotDTO
  isActive: boolean
  onSelect: (hotspot: HotspotDTO | null) => void
}

export function EquipmentHotspot({
  hotspot,
  isActive,
  onSelect,
}: EquipmentHotspotProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const showPopup = isHovered || isActive

  const renderIcon = () => {
    switch (hotspot.category) {
      case 'COFFEE_MACHINE':
        return <Coffee className="h-4 w-4" />
      case 'FRIDGE':
        return <Refrigerator className="h-4 w-4" />
      case 'DISPENSER':
        return <Droplets className="h-4 w-4" />
      case 'PROJECTOR':
        return <Projector className="h-4 w-4" />
      case 'VIEWPOINT':
        return <Eye className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const openBelow = hotspot.y_percent < 36

  return (
    <div
      style={{
        left: `${hotspot.x_percent}%`,
        top: `${hotspot.y_percent}%`,
      }}
      onMouseEnter={() => {
        setIsHovered(true)
        onSelect(hotspot)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        onSelect(null)
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          onSelect(isActive ? null : hotspot)
        }}
        className={`group relative flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold shadow-2xl transition-all duration-200 cursor-pointer ${
          showPopup
            ? 'border-indigo-300 bg-indigo-600 text-white scale-110 ring-4 ring-indigo-500/30'
            : 'border-indigo-400/70 bg-[#14142b]/90 text-indigo-100 hover:scale-105'
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>
        {renderIcon()}
        <span>{hotspot.title}</span>
      </div>

      {showPopup && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-72 sm:w-80 rounded-2xl border border-indigo-400/50 bg-[#111126]/95 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-150 pointer-events-none ${
            openBelow ? 'top-full mt-3' : 'bottom-full mb-3'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-white">
              <span className="text-indigo-400">{renderIcon()}</span>
              {hotspot.title}
            </span>
            <span className="rounded-md bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
              {hotspot.category.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
            {hotspot.content}
          </p>
        </div>
      )}
    </div>
  )
}
