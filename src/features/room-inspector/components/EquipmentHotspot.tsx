import { Coffee, Refrigerator, Droplets, Projector, Eye } from 'lucide-react'
import type { HotspotDTO } from '../../../shared/types/api.types'

interface EquipmentHotspotProps {
  hotspot: HotspotDTO
  isActive: boolean
  onSelect: (hotspot: HotspotDTO) => void
}

export function EquipmentHotspot({
  hotspot,
  isActive,
  onSelect,
}: EquipmentHotspotProps) {
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

  return (
    <button
      type="button"
      onClick={() => onSelect(hotspot)}
      style={{
        left: `${hotspot.x_percent}%`,
        top: `${hotspot.y_percent}%`,
      }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg transition-all ${
        isActive
          ? 'border-indigo-400 bg-indigo-600 text-white scale-110 z-20'
          : 'border-indigo-400/50 bg-[#16162a]/90 text-indigo-200 hover:bg-indigo-600 hover:text-white hover:scale-105 z-10'
      }`}
    >
      {renderIcon()}
      <span>{hotspot.title}</span>
    </button>
  )
}
