import { useState } from 'react'
import {
  Coffee,
  Refrigerator,
  Droplets,
  Projector,
  Eye,
  Monitor,
  ClipboardList,
  HeartPulse,
  Building2,
  Dumbbell,
  Headphones,
  ExternalLink,
  Package,
  Gamepad2,
  Presentation,
  Award,
} from 'lucide-react'
import type { HotspotDTO } from '../../../shared/types/api.types'

interface EquipmentHotspotProps {
  hotspot: HotspotDTO
  isActive: boolean
  onSelect: (hotspot: HotspotDTO | null) => void
  onOpenSystemModal?: (hotspot: HotspotDTO) => void
  compact?: boolean
}

export function EquipmentHotspot({
  hotspot,
  isActive,
  onSelect,
  onOpenSystemModal,
  compact = false,
}: EquipmentHotspotProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const showPopup = isHovered || isActive
  const isExternalSystem =
    hotspot.category === 'MONITOR' ||
    hotspot.category === 'DESK' ||
    hotspot.category === 'WHITEBOARD' ||
    hotspot.category === 'GRADES'

  const renderIcon = () => {
    switch (hotspot.category) {
      case 'COFFEE_MACHINE':
        return <Coffee className="h-4 w-4 text-[#80EAFF]" />
      case 'FRIDGE':
        return <Refrigerator className="h-4 w-4 text-[#80EAFF]" />
      case 'DISPENSER':
        return <Droplets className="h-4 w-4 text-[#80EAFF]" />
      case 'PROJECTOR':
      case 'MONITOR':
        return <Monitor className="h-4 w-4 text-[#80EAFF]" />
      case 'WHITEBOARD':
        return <Presentation className="h-4 w-4 text-[#80EAFF]" />
      case 'GRADES':
        return <Award className="h-4 w-4 text-[#80EAFF]" />
      case 'DESK':
        return <ClipboardList className="h-4 w-4 text-white" />
      case 'MEDKIT':
        return <HeartPulse className="h-4 w-4 text-rose-400" />
      case 'ELEVATOR':
        return <Building2 className="h-4 w-4 text-[#80EAFF]" />
      case 'BAR':
        return <Dumbbell className="h-4 w-4 text-[#80EAFF]" />
      case 'CABINE':
        return <Headphones className="h-4 w-4 text-[#80EAFF]" />
      case 'STOCK':
        return <Package className="h-4 w-4 text-[#80EAFF]" />
      case 'GAME_TABLE':
        return <Gamepad2 className="h-4 w-4 text-[#80EAFF]" />
      case 'VIEWPOINT':
        return <Eye className="h-4 w-4 text-[#80EAFF]" />
      default:
        return <Projector className="h-4 w-4 text-[#80EAFF]" />
    }
  }

  const getBadgeColors = () => {
    if (hotspot.category === 'MEDKIT') {
      return showPopup
        ? 'border-rose-400 bg-[#3A2429] text-white scale-105'
        : 'border-[#2F4045] bg-[#233134]/95 text-white hover:scale-105'
    }
    if (isExternalSystem) {
      return showPopup
        ? 'border-[#80EAFF]/70 bg-[#80EAFF] text-[#0D1A1D] scale-105'
        : 'border-[#80EAFF]/40 bg-[#153640]/95 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] hover:scale-105'
    }
    return showPopup
      ? 'border-[#80EAFF]/70 bg-[#153640] text-white scale-105'
      : 'border-[#2F4045] bg-[#233134]/95 text-white hover:scale-105'
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
          if (isExternalSystem && onOpenSystemModal) {
            onOpenSystemModal(hotspot)
            return
          }
          onSelect(isActive ? null : hotspot)
        }}
        className={`group relative flex items-center gap-2 rounded-[6px] border text-xs font-bold shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition-all duration-200 cursor-pointer ${
          compact ? 'h-9 w-9 justify-center !rounded-full' : 'px-3.5 py-2'
        } ${getBadgeColors()}`}
      >
        {renderIcon()}
        {!compact && <span>{hotspot.title}</span>}
        {!compact && isExternalSystem && <ExternalLink className="h-3 w-3 opacity-75" />}
      </div>

      {showPopup && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-72 sm:w-80 rounded-xl border border-[#2F4045] bg-[#233134] p-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.24)] overflow-hidden transition-all duration-150 pointer-events-none ${
            openBelow ? 'top-full mt-3' : 'bottom-full mb-3'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#80EAFF]" />
          <div className="flex items-center justify-between gap-2 border-b border-[#2F4045] pb-2 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
              {renderIcon()}
              {hotspot.title}
            </span>
            <span className="rounded-[4px] bg-[#153640] border border-[#80EAFF]/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#80EAFF]">
              {hotspot.category === 'MONITOR'
                ? 'WEEKLY SCHEDULE'
                : hotspot.category === 'WHITEBOARD'
                  ? 'WHITEBOARD TASKS'
                  : hotspot.category === 'GRADES'
                    ? 'STUDENT GRADES'
                    : hotspot.category === 'DESK'
                      ? 'LMS TASKS'
                      : hotspot.category.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-[#9DB0B4] whitespace-pre-line leading-relaxed">
            {hotspot.content}
          </p>
          {isExternalSystem && (
            <p className="mt-2.5 inline-block rounded-[4px] bg-[#80EAFF] px-2.5 py-1 text-[11px] font-bold text-[#0D1A1D]">
              Click to open{' '}
              {hotspot.category === 'MONITOR'
                ? 'Weekly Schedule'
                : hotspot.category === 'GRADES'
                  ? 'Student Grades'
                  : 'LMS Tasks'}{' '}
              →
            </p>
          )}
        </div>
      )}
    </div>
  )
}
