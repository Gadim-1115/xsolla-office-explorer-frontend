import { useState } from 'react'
import { ChevronUp, DoorOpen, Lock } from 'lucide-react'
import type { StreetViewLink } from '../../../shared/constants/roomScenes'

interface StreetViewArrowProps {
  link: StreetViewLink
  isLocked: boolean
  onNavigate: (link: StreetViewLink) => void
  compact?: boolean
}

export function StreetViewArrow({
  link,
  isLocked,
  onNavigate,
  compact = false,
}: StreetViewArrowProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const rotationDeg =
    link.direction === 'backward'
      ? 180
      : link.direction === 'left'
        ? -45
        : link.direction === 'right'
          ? 45
          : 0

  if (isLocked && link.lockedFrame) {
    return (
      <div
        style={{
          left: `${link.lockedFrame.left_percent}%`,
          top: `${link.lockedFrame.top_percent}%`,
          width: `${link.lockedFrame.width_percent}%`,
          height: `${link.lockedFrame.height_percent}%`,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          clipPath: link.lockedFrame.clipPath,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onNavigate(link)
        }}
        title={`${link.label} (Locked)`}
        className="absolute z-10 flex items-center justify-center rounded-2xl cursor-pointer select-none transition-all duration-200"
      >
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur-xs transition-all duration-200 ${
            isHovered
              ? 'bg-black/60 scale-105'
              : 'bg-black/30 opacity-75'
          }`}
        >
          <Lock className="h-3.5 w-3.5 shrink-0 text-white/90" />
          {!compact && isHovered && <span>{link.label}</span>}
        </div>
      </div>
    )
  }

  if (isLocked || link.direction === 'door') {
    return (
      <div
        style={{
          left: `${link.x_percent}%`,
          top: `${link.y_percent}%`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onNavigate(link)
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer select-none"
      >
        <div
          className={`relative flex items-center gap-2.5 rounded-lg border text-xs font-bold ${compact ? 'h-11 w-11 justify-center !rounded-full' : 'px-4 py-2.5'} shadow-[0_12px_32px_rgba(0,0,0,0.28)] overflow-hidden transition-all duration-200 ${
            isLocked
              ? isHovered
                ? 'border-rose-400 bg-[#3A2429] text-rose-100 scale-105'
                : 'border-rose-400/50 bg-[#233134]/95 text-white hover:scale-105'
              : isHovered
                ? 'border-[#80EAFF] bg-[#153640] text-white scale-105'
                : 'border-[#2F4045] bg-[#233134]/95 text-white hover:scale-105'
          }`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] ${
              isLocked ? 'bg-rose-500' : 'bg-[#80EAFF]'
            }`}
          />
          {isLocked ? (
            <Lock className="h-4 w-4 shrink-0 text-rose-400" />
          ) : (
            <DoorOpen className="h-4 w-4 shrink-0 text-[#80EAFF]" />
          )}
          {!compact && (
          <div className="flex flex-col text-left leading-tight">
            <span>{link.label}</span>
            <span className="text-[10px] font-medium text-[#9DB0B4]">
              {isLocked ? 'Locked · Click to solve Go Quest' : 'Click to enter room'}
            </span>
          </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        left: `${link.x_percent}%`,
        top: `${link.y_percent}%`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onNavigate(link)
      }}
      className="group absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center cursor-pointer select-none"
    >
      <div
        style={{
          transform: `perspective(240px) rotateX(56deg) rotateZ(${rotationDeg}deg) scale(${
            isHovered ? 1.18 : 1
          })`,
        }}
        className="relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-[#80EAFF]/80 shadow-[0_14px_30px_rgba(0,0,0,0.45)] backdrop-blur-xs transition-all duration-200 group-hover:bg-[#80EAFF] group-hover:border-[#80EAFF]"
      >
        <div className="flex flex-col items-center justify-center -space-y-3 text-[#0D1A1D]">
          <ChevronUp className="h-7 w-7 stroke-[3.2]" />
          <ChevronUp className="h-7 w-7 stroke-[3.2] opacity-80" />
        </div>
      </div>
    </div>
  )
}
