import { useEffect, useState, useRef } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crosshair,
  Images,
  Info,
  Pause,
  Play,
  RotateCw,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import type { HotspotDTO } from '../../../shared/types/api.types'
import { resolveRoomScenes } from '../../../shared/constants/roomScenes'
import { EquipmentHotspot } from './EquipmentHotspot'
import { EasterEggTrigger } from './EasterEggTrigger'
import { useEasterEgg } from '../hooks/useEasterEgg'

function getRoomAtmosphereGradient(zoneId: string): string {
  if (zoneId.startsWith('zone_gameroom')) {
    return 'from-[#1f1138] via-[#131638] to-[#0a192f]'
  }
  if (zoneId === 'zone_kitchen') {
    return 'from-[#23192d] via-[#162032] to-[#0f172a]'
  }
  if (zoneId.includes('open_space')) {
    return 'from-[#111c38] via-[#152238] to-[#0c1324]'
  }
  if (zoneId === 'zone_session') {
    return 'from-[#1e153a] via-[#171830] to-[#0d1021]'
  }
  return 'from-[#171936] via-[#121528] to-[#0b0d19]'
}

export function RoomModal() {
  const {
    zones,
    selectedRoomZoneId,
    closeRoomModal,
    activeMapHotspot,
    closeMapHotspot,
  } = useExplorer()
  const { claimEgg, claimingId } = useEasterEgg()

  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0)
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDTO | null>(null)
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({})

  const [yawDeg, setYawDeg] = useState<number>(0)
  const [pitchDeg, setPitchDeg] = useState<number>(0)
  const [fovZoom, setFovZoom] = useState<number>(1)
  const [autoRotate, setAutoRotate] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [calibrateMode, setCalibrateMode] = useState<boolean>(false)
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(
    null,
  )

  const stageRef = useRef<HTMLDivElement | null>(null)
  const dragStart = useRef<{ x: number; y: number; yaw: number; pitch: number }>({
    x: 0,
    y: 0,
    yaw: 0,
    pitch: 0,
  })

  const zone = selectedRoomZoneId ? zones[selectedRoomZoneId] : null

  useEffect(() => {
    setActiveSceneIndex(0)
    setSelectedHotspot(null)
    setYawDeg(0)
    setPitchDeg(0)
    setFovZoom(1)
    setAutoRotate(false)
  }, [selectedRoomZoneId])

  useEffect(() => {
    setSelectedHotspot(null)
    setYawDeg(0)
    setPitchDeg(0)
    setFovZoom(1)
  }, [activeSceneIndex])

  useEffect(() => {
    if (!zone || !autoRotate || isDragging) return
    const id = window.setInterval(() => {
      setYawDeg((prev) => (prev + 0.35) % 360)
    }, 16)
    return () => window.clearInterval(id)
  }, [zone, autoRotate, isDragging])

  useEffect(() => {
    if (!zone) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeRoomModal()
      } else if (e.key === 'ArrowLeft') {
        setYawDeg((prev) => (prev - 12 + 360) % 360)
      } else if (e.key === 'ArrowRight') {
        setYawDeg((prev) => (prev + 12) % 360)
      } else if (e.key === 'ArrowUp') {
        setPitchDeg((prev) => Math.max(-18, prev - 4))
      } else if (e.key === 'ArrowDown') {
        setPitchDeg((prev) => Math.min(18, prev + 4))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [zone, closeRoomModal])

  if (activeMapHotspot && !zone) {
    return (
      <Modal
        isOpen={Boolean(activeMapHotspot)}
        onClose={closeMapHotspot}
        title={activeMapHotspot.title}
        subtitle={`Category: ${activeMapHotspot.category.replace('_', ' ')}`}
        maxWidthClass="max-w-lg"
      >
        <div className="rounded-xl border border-indigo-500/25 bg-[#121224] p-5 text-left">
          <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
            {activeMapHotspot.content}
          </p>
        </div>
      </Modal>
    )
  }

  if (!zone) return null

  const scenes = resolveRoomScenes(zone.id, zone.media_url, zone.hotspots)
  const safeIndex = Math.min(activeSceneIndex, scenes.length - 1)
  const currentScene = scenes[safeIndex]
  const currentUrl = currentScene.imageUrl
  const isImageBroken = Boolean(failedUrls[currentUrl])
  const is360Mode = currentScene.is360 !== false

  const sceneEquipment = currentScene.hotspots || []
  const easterEggs =
    safeIndex === 0 ? zone.hotspots.filter((h) => h.category === 'EASTER_EGG') : []
  const atmosphereClass = getRoomAtmosphereGradient(zone.id)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: yawDeg,
      pitch: pitchDeg,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (calibrateMode && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect()
      const xPct = ((e.clientX - rect.left) / rect.width) * 100
      const yPct = ((e.clientY - rect.top) / rect.height) * 100
      setCursorCoords({
        x: Math.max(0, Math.min(100, Number(xPct.toFixed(1)))),
        y: Math.max(0, Math.min(100, Number(yPct.toFixed(1)))),
      })
    }

    if (!isDragging || !is360Mode) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const nextYaw = (dragStart.current.yaw - dx * 0.22 + 360) % 360
    const nextPitch = Math.max(-20, Math.min(20, dragStart.current.pitch + dy * 0.08))
    setYawDeg(nextYaw)
    setPitchDeg(nextPitch)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    setFovZoom((prev) => Math.max(1, Math.min(2.1, Number((prev + delta).toFixed(2)))))
  }

  const normalizedYaw = ((yawDeg % 360) + 360) % 360
  const shiftPercent = is360Mode ? (normalizedYaw / 360) * 100 : 0

  const computeWrappedX = (originalXPercent: number): number => {
    if (!is360Mode) return originalXPercent
    const shifted = originalXPercent - shiftPercent
    return (shifted + 100) % 100
  }

  return (
    <div className="fixed inset-0 top-[65px] z-40 flex flex-col bg-[#070712] animate-room-dive-in select-none overflow-hidden">
      <img
        key={currentUrl}
        src={currentUrl}
        alt=""
        className="hidden"
        onLoad={() =>
          setFailedUrls((prev) => {
            if (!prev[currentUrl]) return prev
            const next = { ...prev }
            delete next[currentUrl]
            return next
          })
        }
        onError={() =>
          setFailedUrls((prev) => ({
            ...prev,
            [currentUrl]: true,
          }))
        }
      />

      <div className="absolute top-5 left-6 right-6 z-30 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
          <button
            type="button"
            onClick={closeRoomModal}
            className="flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-[#121228]/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-md hover:bg-indigo-600 hover:border-indigo-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to 31st-Floor Map
          </button>

          <div className="rounded-xl border border-white/10 bg-[#121228]/90 px-4 py-2 backdrop-blur-md shadow-xl text-left">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white">{zone.name}</h2>
              <span className="rounded-md bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                {is360Mode ? '360° Panorama' : 'Room Photo'}
              </span>
            </div>
          </div>

          {scenes.length > 1 && (
            <div className="flex items-center gap-1 rounded-xl border border-indigo-400/30 bg-[#121228]/90 p-1 backdrop-blur-md shadow-xl">
              <button
                type="button"
                onClick={() =>
                  setActiveSceneIndex((i) => (i - 1 + scenes.length) % scenes.length)
                }
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                title="Previous Photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-bold text-indigo-300">
                {safeIndex + 1} / {scenes.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveSceneIndex((i) => (i + 1) % scenes.length)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                title="Next Photo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-[#121228]/90 px-3.5 py-2 text-xs text-slate-200 backdrop-blur-md shadow-xl">
          {is360Mode && (
            <>
              <Compass className="h-4 w-4 text-indigo-400" />
              <span className="font-mono text-[11px] font-bold text-indigo-300 w-10">
                {Math.round(normalizedYaw)}°
              </span>

              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                  autoRotate
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {autoRotate ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                360° Spin
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() =>
              setFovZoom((z) => Math.min(2.1, Number((z + 0.2).toFixed(2))))
            }
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setFovZoom((z) => Math.max(1, Number((z - 0.2).toFixed(2))))
            }
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setYawDeg(0)
              setPitchDeg(0)
              setFovZoom(1)
            }}
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
            title="Reset View"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCalibrateMode((v) => !v)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
              calibrateMode
                ? 'border-amber-400/60 bg-amber-500/20 text-amber-300'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
            title="Show cursor X/Y % coordinates for placing new equipment pins"
          >
            <Crosshair className="h-3.5 w-3.5" />
            {calibrateMode && cursorCoords
              ? `X:${cursorCoords.x}% Y:${cursorCoords.y}%`
              : 'Pin Coords'}
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative flex-1 w-full overflow-hidden ${
          is360Mode
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
      >
        {!isImageBroken ? (
          <div
            style={
              is360Mode
                ? {
                    transform: `scale(${fovZoom}) translateY(${pitchDeg * 4}px)`,
                    backgroundImage: `url("${currentUrl}")`,
                    backgroundRepeat: 'repeat-x',
                    backgroundSize: '200% 100%',
                    backgroundPosition: `${-normalizedYaw * 0.55}% center`,
                  }
                : {
                    transform: `scale(${fovZoom})`,
                    backgroundImage: `url("${currentUrl}")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
            }
            className="relative h-full w-full transition-transform duration-75 ease-out"
          >
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(7,7,18,0.7)]" />

            {sceneEquipment.map((hotspot) => {
              const wrappedHotspot: HotspotDTO = {
                ...hotspot,
                x_percent: computeWrappedX(hotspot.x_percent),
                y_percent: Math.max(
                  12,
                  Math.min(88, hotspot.y_percent + (is360Mode ? pitchDeg * 0.4 : 0)),
                ),
              }
              return (
                <EquipmentHotspot
                  key={hotspot.id}
                  hotspot={wrappedHotspot}
                  isActive={selectedHotspot?.id === hotspot.id}
                  onSelect={setSelectedHotspot}
                />
              )
            })}

            {easterEggs.map((egg) => {
              const wrappedEgg: HotspotDTO = {
                ...egg,
                x_percent: computeWrappedX(egg.x_percent),
                y_percent: Math.max(
                  12,
                  Math.min(88, egg.y_percent + (is360Mode ? pitchDeg * 0.4 : 0)),
                ),
              }
              return (
                <EasterEggTrigger
                  key={egg.id}
                  hotspot={wrappedEgg}
                  onClaim={(id) => void claimEgg(id)}
                  isClaiming={claimingId === egg.id}
                />
              )
            })}
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${fovZoom}) translate(${((180 - normalizedYaw) / 180) * 120}px, ${pitchDeg * 3}px)`,
            }}
            className={`relative h-full w-[130%] -left-[15%] bg-gradient-to-br ${atmosphereClass} transition-transform duration-75 ease-out`}
          >
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(99,102,241,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.22) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                transform: 'perspective(700px) rotateX(55deg) scale(1.6)',
                transformOrigin: 'center bottom',
              }}
            />

            <div className="absolute inset-x-[14%] inset-y-[18%] rounded-3xl border border-indigo-500/20 bg-[#0b0d1d]/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center shadow-[0_0_120px_rgba(99,102,241,0.15)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-400 mb-4">
                <Compass className="h-9 w-9 animate-pulse" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400 mb-1">
                {currentScene.label}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {zone.name}
              </h3>
              <p className="mt-2 max-w-xl text-sm text-slate-300 leading-relaxed">
                {zone.description}
              </p>
              <p className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] text-slate-400">
                Place image at <code className="text-indigo-300">public{currentUrl}</code>
              </p>
            </div>

            {sceneEquipment.map((hotspot) => (
              <EquipmentHotspot
                key={hotspot.id}
                hotspot={hotspot}
                isActive={selectedHotspot?.id === hotspot.id}
                onSelect={setSelectedHotspot}
              />
            ))}

            {easterEggs.map((egg) => (
              <EasterEggTrigger
                key={egg.id}
                hotspot={egg}
                onClaim={(id) => void claimEgg(id)}
                isClaiming={claimingId === egg.id}
              />
            ))}
          </div>
        )}
      </div>

      <div className="z-30 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#101022]/95 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3 text-left">
          <Info className="h-4 w-4 shrink-0 text-indigo-400" />
          <p className="text-xs text-slate-300">
            <span className="font-semibold text-white">{zone.name}:</span>{' '}
            {zone.description} ·{' '}
            <span className="text-emerald-300">
              Hover over any equipment pin on the image to view usage instructions
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {scenes.length > 1 && (
            <div className="flex items-center gap-1.5 mr-2 border-r border-white/10 pr-3">
              <Images className="h-3.5 w-3.5 text-indigo-400" />
              {scenes.map((scene, idx) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    safeIndex === idx
                      ? 'border-indigo-400 bg-indigo-600 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {scene.label}
                </button>
              ))}
            </div>
          )}

          {sceneEquipment.length === 0 && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Search the room view for hidden Xsolla emblems
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
