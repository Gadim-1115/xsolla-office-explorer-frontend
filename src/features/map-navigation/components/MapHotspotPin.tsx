import { Eye, Droplets, Package, Projector } from 'lucide-react'
import type { HotspotDTO } from '../../../shared/types/api.types'

interface MapHotspotPinProps {
  hotspot: HotspotDTO
  onSelect: (hotspot: HotspotDTO) => void
}

export function MapHotspotPin({
  hotspot,
  onSelect,
}: MapHotspotPinProps) {
  const getIcon = () => {
    switch (hotspot.category) {
      case 'VIEWPOINT':
        return <Eye className="h-5 w-5" />
      case 'STOCK':
        return <Package className="h-5 w-5" />
      case 'DISPENSER':
        return <Droplets className="h-5 w-5" />
      case 'PROJECTOR':
        return <Projector className="h-5 w-5" />
      default:
        return <Eye className="h-5 w-5" />
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
      title={hotspot.title}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-[#80EAFF] bg-[#80EAFF] text-[#0D1A1D] shadow-md hover:bg-[#A6F1FF] hover:scale-110 transition-all cursor-pointer"
    >
      {getIcon()}
    </button>
  )
}

