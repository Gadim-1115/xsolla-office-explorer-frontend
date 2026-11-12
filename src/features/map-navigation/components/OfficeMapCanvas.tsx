import { useRef, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock, DoorOpen, Info, X } from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import { useMapInteraction } from '../hooks/useMapInteraction'
import { CrescentFloorSvg } from './CrescentFloorSvg'
import { MapHotspotPin } from './MapHotspotPin'
import {
  ELEVATOR_ENTRANCES,
  MAP_ZONE_IDS,
  ZONE_LABEL_POSITIONS,
} from '../../../shared/constants/mapIds'
import type { HotspotDTO } from '../../../shared/types/api.types'

const MAP_WIDTH = 'min(141vw, calc((100dvh - var(--explorer-header-h, 65px)) * 2.64))'
const DRAG_THRESHOLD_PX = 5

const STOCK_INFO_HOTSPOT: HotspotDTO = {
  id: 'info_stock',
  zone_id: MAP_ZONE_IDS.STOCK,
  category: 'STOCK',
  x_percent: 0,
  y_percent: 0,
  title: 'Stock Room',
  content: 'Office storage and equipment supply room.',
  is_claimed: false,
}

export function OfficeMapCanvas() {
  const {
    zones,
    mapHotspots,
    openMapHotspot,
    openRoomModal,
    openQuestModal,
    selectedRoomZoneId,
    isLoading,
    error,
  } = useExplorer()
  const { hoveredZoneId, setHoveredZoneId } = useMapInteraction()

  const [divingZoneId, setDivingZoneId] = useState<string | null>(null)
  const [legendOpen, setLegendOpen] = useState<boolean>(false)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  const wasDragged = useRef<boolean>(false)

  const hoveredZone = hoveredZoneId ? zones[hoveredZoneId] : null

  const triggerZoneClick = (zoneId: string, sceneId?: string) => {
    if (wasDragged.current) {
      wasDragged.current = false
      return
    }

    const zone = zones[zoneId]
    if (!zone) return

    if (zoneId === MAP_ZONE_IDS.STOCK) {
      openMapHotspot(STOCK_INFO_HOTSPOT)
      return
    }

    if (zone.status === 'LOCKED') {
      openQuestModal(zoneId)
      return
    }

    setDivingZoneId(zoneId)
    setTimeout(() => {
      openRoomModal(zoneId, sceneId)
      setTimeout(() => {
        setDivingZoneId(null)
      }, 250)
    }, 850)
  }

  const handleSelectHotspot = (hotspot: HotspotDTO) => {
    if (wasDragged.current) {
      wasDragged.current = false
      return
    }
    openMapHotspot(hotspot)
  }

  const divePos = divingZoneId ? ZONE_LABEL_POSITIONS[divingZoneId] : null
  const originX = divePos ? `${((divePos.cx / 1920) * 100).toFixed(1)}%` : '50%'
  const originY = divePos ? `${((divePos.cy / 1080) * 100).toFixed(1)}%` : '50%'

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#1B2628] text-[#9DB0B4]">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#80EAFF]/70 border-t-transparent mb-3" />
        <p className="text-sm font-semibold text-white">
          Initializing Xsolla 31st-Floor Oval Office Map...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#1B2628] p-6 text-center">
        <div className="max-w-md rounded-xl border border-rose-400/50 bg-[#233134] p-6 shadow-lg">
          <p className="text-base font-bold text-rose-400">
            Backend Connection Error
          </p>
          <p className="mt-2 text-xs text-[#9DB0B4]">{error}</p>
          <p className="mt-3 text-[11px] text-[#9DB0B4]">
            Make sure the Go server is running on{' '}
            <code className="text-[#80EAFF] font-semibold">http://localhost:8080</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-[#1B2628]">
      <TransformWrapper
        initialScale={1}
        minScale={0.65}
        maxScale={3.5}
        centerOnInit
        wheel={{ step: 0.002 }}
        onPanning={() => {
          wasDragged.current = true
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-3 left-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-col items-start gap-2 sm:top-4 sm:left-4">
              <button
                type="button"
                onClick={() => setLegendOpen((v) => !v)}
                title={legendOpen ? 'Hide legend' : 'Show legend'}
                className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#2F4045] bg-[#233134] text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
              >
                {legendOpen ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              </button>

              {legendOpen && (
                <div className="rounded-xl border border-[#2F4045] bg-[#233134] px-4 py-3 text-left shadow-[0_12px_36px_rgba(0,0,0,0.25)]">
                  <div className="flex flex-col gap-2 text-xs text-[#9DB0B4]">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-[3px] border border-rose-400 bg-[#3A2429]" />
                      <span>Locked</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-[3px] border border-[#80EAFF]/70 bg-[#153640]" />
                      <span>Unlocked</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full bg-[#80EAFF] border border-[#80EAFF]/70" />
                      <span>Elevator entrance</span>
                    </div>
                  </div>
                </div>
              )}

              {hoveredZone && !divingZoneId && (
                <div className="flex items-center gap-2 rounded-[6px] border border-[#80EAFF]/40 bg-[#153640] px-3 py-1.5">
                  {hoveredZone.status === 'LOCKED' ? (
                    <Lock className="h-3.5 w-3.5 text-rose-400" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5 text-[#80EAFF]" />
                  )}
                  <span className="text-xs font-bold text-white">
                    {hoveredZone.name}
                  </span>
                </div>
              )}
            </div>

            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 sm:bottom-5 sm:left-5 rounded-xl border border-[#2F4045] bg-[#233134] p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={() => zoomIn()}
                className="rounded-[6px] bg-[#2F4045] p-2 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => zoomOut()}
                className="rounded-[6px] bg-[#2F4045] p-2 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => resetTransform()}
                className="rounded-[6px] bg-[#2F4045] p-2 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
                title="Reset View"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{
                width: MAP_WIDTH,
                aspectRatio: '16 / 9',
              }}
            >
              <div
                style={{
                  transformOrigin: `${originX} ${originY}`,
                  transitionDuration: divingZoneId ? '900ms' : '500ms',
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  left: '-4.95%',
                }}
                onPointerDownCapture={(e) => {
                  pointerDownPos.current = { x: e.clientX, y: e.clientY }
                  wasDragged.current = false
                }}
                onPointerMoveCapture={(e) => {
                  if (!pointerDownPos.current) return
                  const dx = e.clientX - pointerDownPos.current.x
                  const dy = e.clientY - pointerDownPos.current.y
                  if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
                    wasDragged.current = true
                  }
                }}
                onPointerUpCapture={() => {
                  pointerDownPos.current = null
                }}
                onPointerCancelCapture={() => {
                  pointerDownPos.current = null
                }}
                onClickCapture={(e) => {
                  if (wasDragged.current) {
                    e.stopPropagation()
                    e.preventDefault()
                    wasDragged.current = false
                  }
                }}
                className={`relative h-full w-full max-w-none cursor-grab active:cursor-grabbing transition-all ${
                  divingZoneId
                    ? 'scale-[3.1] opacity-10 blur-[4px]'
                    : !selectedRoomZoneId
                      ? 'scale-100 opacity-100 blur-0'
                      : 'scale-110 opacity-25'
                }`}
              >
                <CrescentFloorSvg
                  zones={zones}
                  hoveredZoneId={hoveredZoneId}
                  onHoverZone={setHoveredZoneId}
                  onClickZone={triggerZoneClick}
                />
                {ELEVATOR_ENTRANCES.map((entrance) => (
                  <button
                    key={entrance.id}
                    type="button"
                    style={{
                      left: `${entrance.x_percent}%`,
                      top: `${entrance.y_percent}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      triggerZoneClick(entrance.targetZoneId, entrance.targetSceneId)
                    }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-[#80EAFF]/70 bg-[#80EAFF] text-[#0D1A1D] shadow-[0_0_0_4px_rgba(128,234,255,0.15)] hover:scale-125 hover:bg-[#A6F1FF] transition-all cursor-pointer sm:h-10 sm:w-10 sm:shadow-[0_0_0_6px_rgba(128,234,255,0.15)]"
                    title={entrance.label}
                  >
                    <DoorOpen className="h-4 w-4 shrink-0 stroke-[2.2] sm:h-5 sm:w-5" />
                  </button>
                ))}
                {mapHotspots
                  .filter((hotspot) => hotspot.category !== 'EASTER_EGG')
                  .map((hotspot) => (
                    <MapHotspotPin
                      key={hotspot.id}
                      hotspot={hotspot}
                      onSelect={handleSelectHotspot}
                    />
                  ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
