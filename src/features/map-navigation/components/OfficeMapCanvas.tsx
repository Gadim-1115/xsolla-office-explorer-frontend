import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock } from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import { useMapInteraction } from '../hooks/useMapInteraction'
import { CrescentFloorSvg } from './CrescentFloorSvg'
import { MapHotspotPin } from './MapHotspotPin'
import { useEasterEgg } from '../../room-inspector/hooks/useEasterEgg'
import { ZONE_LABEL_POSITIONS } from '../../../shared/constants/mapIds'

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
  const { claimEgg } = useEasterEgg()

  const [divingZoneId, setDivingZoneId] = useState<string | null>(null)

  const hoveredZone = hoveredZoneId ? zones[hoveredZoneId] : null

  const triggerZoneClick = (zoneId: string) => {
    const zone = zones[zoneId]
    if (!zone) return

    if (zone.status === 'LOCKED') {
      openQuestModal(zoneId)
      return
    }

    setDivingZoneId(zoneId)
    setTimeout(() => {
      openRoomModal(zoneId)
      setTimeout(() => {
        setDivingZoneId(null)
      }, 250)
    }, 850)
  }

  const divePos = divingZoneId ? ZONE_LABEL_POSITIONS[divingZoneId] : null
  const originX = divePos ? `${((divePos.cx / 1920) * 100).toFixed(1)}%` : '50%'
  const originY = divePos ? `${((divePos.cy / 1080) * 100).toFixed(1)}%` : '50%'

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#0d0d1a] text-slate-300">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent mb-3" />
        <p className="text-sm font-medium">Initializing 31st-Floor Oval Office Map...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#0d0d1a] p-6 text-center">
        <div className="max-w-md rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6">
          <p className="text-base font-bold text-rose-300">Backend Connection Error</p>
          <p className="mt-2 text-xs text-slate-300">{error}</p>
          <p className="mt-3 text-[11px] text-slate-400">
            Make sure the Go server is running on{' '}
            <code className="text-indigo-300">http://localhost:8080</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-[#0d0d1a]">
      <TransformWrapper
        initialScale={1}
        minScale={0.65}
        maxScale={3.5}
        centerOnInit
        wheel={{ step: 0.12 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <div className="rounded-xl border border-white/10 bg-[#141428]/90 px-4 py-3 backdrop-blur-md text-left shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Map Legend
                </p>
                <div className="mt-2 flex flex-col gap-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm border border-amber-400 bg-[#1b1833]" />
                    <span>Locked Zone (Click to solve Go Quest)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm border border-emerald-400 bg-[#252542]" />
                    <span>Unlocked Zone (Click to dive into 360° room)</span>
                  </div>
                </div>
              </div>

              {hoveredZone && !divingZoneId && (
                <div className="rounded-xl border border-indigo-500/40 bg-[#181832]/95 px-4 py-3 backdrop-blur-md text-left shadow-xl">
                  <div className="flex items-center gap-2">
                    {hoveredZone.status === 'LOCKED' ? (
                      <Lock className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Unlock className="h-4 w-4 text-emerald-400" />
                    )}
                    <span className="text-sm font-bold text-white">
                      {hoveredZone.name}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {hoveredZone.status === 'LOCKED'
                      ? `Locked (${hoveredZone.difficulty?.replace('_', ' ')}) — Click to solve algorithmic quest`
                      : 'Unlocked — Click to enter 360° panoramic room view'}
                  </p>
                </div>
              )}
            </div>

            <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#141428]/90 p-1.5 backdrop-blur-md shadow-xl">
              <button
                type="button"
                onClick={() => zoomIn()}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => zoomOut()}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => resetTransform()}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                title="Reset View"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  transformOrigin: `${originX} ${originY}`,
                  transitionDuration: divingZoneId ? '900ms' : '500ms',
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className={`relative aspect-video w-[1280px] max-w-none shadow-2xl transition-all ${
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
                {mapHotspots.map((hotspot) => (
                  <MapHotspotPin
                    key={hotspot.id}
                    hotspot={hotspot}
                    onSelect={openMapHotspot}
                    onClaimEgg={(id) => void claimEgg(id)}
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
