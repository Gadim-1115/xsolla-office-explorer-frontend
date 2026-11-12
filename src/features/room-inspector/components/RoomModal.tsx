import { useCallback, useEffect, useState, useRef } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crosshair,
  Images,
  Info,
  Maximize2,
  Minimize2,
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
import {
  resolveRoomScenes,
  type StreetViewLink,
} from '../../../shared/constants/roomScenes'
import {
  checkLmsPermission,
  getLmsUser,
  redirectToLmsLogin,
  type LmsSurfaceCategory,
} from '../../../shared/api/lmsClient'
import { EquipmentHotspot } from './EquipmentHotspot'
import { EasterEggTrigger } from './EasterEggTrigger'
import { StreetViewArrow } from './StreetViewArrow'
import { LmsSurfaceModal } from './LmsSurfaceModal'
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
    progress,
    selectedRoomZoneId,
    selectedSceneId,
    openRoomModal,
    openQuestModal,
    closeRoomModal,
    activeMapHotspot,
    closeMapHotspot,
  } = useExplorer()
  const { claimEgg, claimingId } = useEasterEgg()

  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0)
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDTO | null>(null)
  const [systemModalHotspot, setSystemModalHotspot] = useState<HotspotDTO | null>(null)
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({})
  const [isWalking, setIsWalking] = useState<boolean>(false)

  const [yawDeg, setYawDeg] = useState<number>(0)
  const [pitchDeg, setPitchDeg] = useState<number>(0)
  const [fovZoom, setFovZoom] = useState<number>(1)
  const [autoRotate, setAutoRotate] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [calibrateMode, setCalibrateMode] = useState<boolean>(false)
  const [immersive, setImmersive] = useState<boolean>(false)
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

  const exitImmersive = useCallback(() => {
    setImmersive(false)
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined)
    }
  }, [])

  const enterImmersive = () => {
    setImmersive(true)
    void document.documentElement.requestFullscreen?.().catch(() => undefined)
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setImmersive(false)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (!zone && immersive) exitImmersive()
  }, [zone, immersive, exitImmersive])

  useEffect(() => {
    if (!zone) {
      setActiveSceneIndex(0)
      return
    }
    const zoneScenes = resolveRoomScenes(zone.id, zone.media_url, zone.hotspots)
    if (selectedSceneId) {
      const idx = zoneScenes.findIndex((s) => s.id === selectedSceneId)
      setActiveSceneIndex(idx >= 0 ? idx : 0)
    } else {
      setActiveSceneIndex(0)
    }
    setSelectedHotspot(null)
    setYawDeg(0)
    setPitchDeg(0)
    setFovZoom(1)
    setAutoRotate(false)
  }, [zone, selectedRoomZoneId, selectedSceneId])

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
        if (immersive) {
          exitImmersive()
          return
        }
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
  }, [zone, closeRoomModal, immersive, exitImmersive])

  if (activeMapHotspot && !zone) {
    return (
      <Modal
        isOpen={Boolean(activeMapHotspot)}
        onClose={closeMapHotspot}
        title={activeMapHotspot.title}
        subtitle={
          activeMapHotspot.id.startsWith('info_')
            ? 'Room info'
            : `Category: ${activeMapHotspot.category.replace('_', ' ')}`
        }
        maxWidthClass="max-w-lg"
      >
        <div className="rounded-lg border border-[#2F4045] bg-[#1B2628] p-5 text-left">
          <p className="text-sm text-white whitespace-pre-line leading-relaxed">
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

  const allSceneHotspots = currentScene.hotspots || []
  const sceneEquipment = allSceneHotspots.filter((h) => h.category !== 'EASTER_EGG')
  const easterEggs = allSceneHotspots
    .filter((h) => h.category === 'EASTER_EGG')
    .map((h) => ({
      ...h,
      is_claimed: Boolean(progress?.found_egg_ids?.includes(h.id)),
    }))
  const sceneLinks = currentScene.links || []
  const atmosphereClass = getRoomAtmosphereGradient(zone.id)

  const handleOpenSystemModal = (hotspot: HotspotDTO) => {
    const surface = hotspot.category as LmsSurfaceCategory
    const perm = checkLmsPermission(getLmsUser(), surface)
    if (!perm.allowed) {
      redirectToLmsLogin(perm.reason === 'forbidden')
      return
    }
    setSystemModalHotspot(hotspot)
  }

  const handleNavigateLink = (link: StreetViewLink) => {
    const targetZone = zones[link.targetZoneId]
    if (targetZone && targetZone.status === 'LOCKED') {
      openQuestModal(link.targetZoneId)
      return
    }

    setIsWalking(true)
    window.setTimeout(() => {
      if (link.targetZoneId === zone.id && link.targetSceneId) {
        const nextIdx = scenes.findIndex((s) => s.id === link.targetSceneId)
        if (nextIdx >= 0) {
          setActiveSceneIndex(nextIdx)
        }
      } else {
        openRoomModal(link.targetZoneId, link.targetSceneId)
      }
      if (typeof link.targetYaw === 'number') {
        setYawDeg(link.targetYaw)
      }
      setIsWalking(false)
    }, 300)
  }

  // Pointer events cover mouse, touch and pen; the stage has touch-none so a finger drag turns
  // the view instead of scrolling the page.
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: yawDeg,
      pitch: pitchDeg,
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !is360Mode) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const nextYaw = (dragStart.current.yaw - dx * 0.22 + 360) % 360
    const nextPitch = Math.max(-20, Math.min(20, dragStart.current.pitch + dy * 0.08))
    setYawDeg(nextYaw)
    setPitchDeg(nextPitch)
  }

  const handleTileMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!calibrateMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100
    setCursorCoords({
      x: Math.max(0, Math.min(100, Number(xPct.toFixed(1)))),
      y: Math.max(0, Math.min(100, Number(yPct.toFixed(1)))),
    })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    setFovZoom((prev) => Math.max(1, Math.min(2.1, Number((prev + delta).toFixed(2)))))
  }

  const normalizedYaw = ((yawDeg % 360) + 360) % 360
  const shiftInTile = (((normalizedYaw / 360) + 0.3) % 1 + 1) % 1
  const trackShiftPercent = shiftInTile * 50

  return (
    <div className={`fixed inset-0 flex flex-col bg-[#0F1719] animate-room-dive-in select-none overflow-hidden ${immersive ? 'top-0 z-[60]' : 'top-[var(--explorer-header-h,65px)] z-40'}`}>
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

      {/* Below lg: one solid two-row bar (back · room · photo switcher, then the toolbar);
          the floating chips wrap into a messy stack there. lg+: the floating chips, as before. */}
      <div className={`absolute top-0 left-0 right-0 z-30 flex flex-wrap items-center justify-between border-b border-[#2F4045] bg-[#141E20]/95 backdrop-blur-md pointer-events-auto lg:top-5 lg:left-6 lg:right-6 lg:gap-4 lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:pointer-events-none ${immersive ? 'hidden' : ''}`}>
        <div className="flex w-full min-w-0 items-center gap-2 px-2 py-2 pointer-events-auto sm:px-4 lg:w-auto lg:flex-wrap lg:gap-3 lg:p-0">
          <button
            type="button"
            onClick={closeRoomModal}
            aria-label="Back to 31st-Floor Map"
            title="Back to 31st-Floor Map"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#80EAFF] text-xs font-bold text-[#0D1A1D] shadow-md hover:bg-[#A6F1FF] transition-all cursor-pointer sm:h-auto sm:w-auto sm:justify-start sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Back to 31st-Floor Map</span>
          </button>

          <div className="min-w-0 flex-1 text-left lg:flex-none lg:rounded-lg lg:border lg:border-[#2F4045] lg:bg-[#233134]/95 lg:px-4 lg:py-2 lg:shadow-md lg:backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#80EAFF]" />
              <h2 className="truncate text-sm font-bold text-white">
                {/* phones drop the bracketed part: "Open Space 1 (Xsolla School Students)" -> "Open Space 1" */}
                <span className="sm:hidden">{zone.name.replace(/\s*\([^)]*\)\s*$/, '')}</span>
                <span className="hidden sm:inline">{zone.name}</span>
              </h2>
              <span className="hidden shrink-0 rounded-[4px] bg-[#153640] border border-[#80EAFF]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#80EAFF] sm:inline">
                {is360Mode ? '360° Panorama' : 'Room Photo'}
              </span>
            </div>
          </div>

          {scenes.length > 1 && (
            <div className="flex shrink-0 items-center gap-1 lg:rounded-lg lg:border lg:border-[#2F4045] lg:bg-[#233134]/95 lg:p-1 lg:shadow-md lg:backdrop-blur-md">
              <button
                type="button"
                onClick={() =>
                  setActiveSceneIndex((i) => (i - 1 + scenes.length) % scenes.length)
                }
                className="rounded-[4px] bg-[#2F4045] p-1.5 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
                title="Previous Photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-bold text-white">
                {safeIndex + 1} / {scenes.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveSceneIndex((i) => (i + 1) % scenes.length)}
                className="rounded-[4px] bg-[#2F4045] p-1.5 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
                title="Next Photo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex w-full items-center justify-between gap-1.5 overflow-x-auto scrollbar-none border-t border-[#2F4045] px-3 py-1.5 text-xs text-white sm:justify-start sm:gap-2 sm:px-4 lg:w-auto lg:max-w-full lg:rounded-lg lg:border lg:bg-[#233134]/95 lg:px-3.5 lg:py-2 lg:shadow-md lg:backdrop-blur-md">
          {is360Mode && (
            <>
              <span className="flex shrink-0 items-center gap-1.5">
                <Compass className="h-4 w-4 shrink-0 text-[#80EAFF]" />
                <span className="w-10 shrink-0 font-mono text-[11px] font-bold text-white">
                  {Math.round(normalizedYaw)}°
                </span>
              </span>

              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                title="360° Spin"
                aria-label="360° Spin"
                className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-[6px] px-2.5 py-2 text-[11px] font-semibold transition cursor-pointer sm:py-1 ${
                  autoRotate
                    ? 'bg-[#80EAFF] text-[#0D1A1D]'
                    : 'bg-[#2F4045] text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D]'
                }`}
              >
                {autoRotate ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">360° Spin</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() =>
              setFovZoom((z) => Math.min(2.1, Number((z + 0.2).toFixed(2))))
            }
            className="shrink-0 rounded-[6px] bg-[#2F4045] p-2 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer sm:p-1.5"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setFovZoom((z) => Math.max(1, Number((z - 0.2).toFixed(2))))
            }
            className="shrink-0 rounded-[6px] bg-[#2F4045] p-2 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer sm:p-1.5"
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
            className="shrink-0 rounded-[6px] bg-[#2F4045] p-2 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer sm:p-1.5"
            title="Reset View"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={enterImmersive}
            className="shrink-0 rounded-[6px] bg-[#2F4045] p-2 text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer sm:p-1.5"
            title="Full screen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCalibrateMode((v) => !v)}
            // pin-placement helper for the team: it reads the mouse position, so desktop only
            className={`hidden shrink-0 items-center gap-1 whitespace-nowrap rounded-[6px] px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer md:flex ${
              calibrateMode
                ? 'bg-[#80EAFF] text-[#0D1A1D]'
                : 'bg-[#2F4045] text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D]'
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

      {immersive && (
        <button
          type="button"
          onClick={exitImmersive}
          title="Exit full screen"
          className="absolute top-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      )}

      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className={`relative flex-1 w-full overflow-hidden touch-none ${
          is360Mode
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
      >
        {!isImageBroken ? (
          is360Mode ? (
            <div
              style={{
                transform: `scale(${isWalking ? fovZoom * 1.38 : fovZoom}) translateY(${pitchDeg * 3.2}px)`,
              }}
              className={`relative -top-[8%] h-[116%] w-full ${
                isWalking
                  ? 'transition-all duration-300 ease-in opacity-45 blur-[2px]'
                  : 'transition-opacity duration-200'
              }`}
            >
              <div
                style={{
                  transform: `translate3d(-${trackShiftPercent}%, 0, 0)`,
                }}
                className="flex h-full w-[500%] will-change-transform"
              >
                {[0, 1].map((tileIdx) => (
                  <div
                    key={tileIdx}
                    onMouseMove={handleTileMouseMove}
                    style={{
                      backgroundImage: `url("${currentUrl}")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                    }}
                    className="relative h-full w-1/2 shrink-0"
                  >
                    {sceneEquipment.map((hotspot) => (
                      <EquipmentHotspot
                        key={`${tileIdx}_${hotspot.id}`}
                        hotspot={hotspot}
                        compact={immersive}
                        isActive={selectedHotspot?.id === hotspot.id}
                        onSelect={setSelectedHotspot}
                        onOpenSystemModal={handleOpenSystemModal}
                      />
                    ))}

                    {sceneLinks.map((link) => (
                      <StreetViewArrow
                        key={`${tileIdx}_${link.id}`}
                        link={link}
                        compact={immersive}
                        isLocked={zones[link.targetZoneId]?.status === 'LOCKED'}
                        onNavigate={handleNavigateLink}
                      />
                    ))}

                    {easterEggs.map((egg) => (
                      <EasterEggTrigger
                        key={`${tileIdx}_${egg.id}`}
                        hotspot={egg}
                        onClaim={(id) => void claimEgg(id)}
                        isClaiming={claimingId === egg.id}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(7,7,18,0.7)]" />
            </div>
          ) : (
            <div
              onMouseMove={handleTileMouseMove}
              style={{
                transform: `scale(${fovZoom})`,
                backgroundImage: `url("${currentUrl}")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              className="relative h-full w-full transition-transform duration-75 ease-out"
            >
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(7,7,18,0.7)]" />

              {sceneEquipment.map((hotspot) => (
                <EquipmentHotspot
                  key={hotspot.id}
                  hotspot={hotspot}
                  compact={immersive}
                  isActive={selectedHotspot?.id === hotspot.id}
                  onSelect={setSelectedHotspot}
                  onOpenSystemModal={handleOpenSystemModal}
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
          )
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
                compact={immersive}
                isActive={selectedHotspot?.id === hotspot.id}
                onSelect={setSelectedHotspot}
                onOpenSystemModal={handleOpenSystemModal}
              />
            ))}

            {sceneLinks.map((link) => (
              <StreetViewArrow
                key={link.id}
                link={link}
                compact={immersive}
                isLocked={zones[link.targetZoneId]?.status === 'LOCKED'}
                onNavigate={handleNavigateLink}
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

      <div className={`z-30 flex flex-wrap items-center justify-between gap-2 border-t border-[#2F4045] bg-[#233134] px-3 py-2 sm:gap-4 sm:px-6 sm:py-3 ${immersive ? 'hidden' : ''}`}>
        <div className="flex items-center gap-3 text-left">
          <Info className="hidden h-4 w-4 shrink-0 text-[#80EAFF] sm:block" />
          <p className="line-clamp-2 text-xs text-[#9DB0B4] sm:line-clamp-none">
            <span className="font-bold text-white">{zone.name}:</span>{' '}
            {zone.description}
            {/* the hint mentions hovering, which phones cannot do */}
            <span className="hidden md:inline">
              {' · '}
              <span className="font-semibold text-[#80EAFF]">
                Click floor arrows to walk through the office or hover pins for details
              </span>
            </span>
          </p>
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-2">
          {scenes.length > 1 && (
            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto scrollbar-none sm:mr-2 sm:border-r sm:border-[#2F4045] sm:pr-3">
              <Images className="h-3.5 w-3.5 shrink-0 text-[#80EAFF]" />
              {scenes.map((scene, idx) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`shrink-0 whitespace-nowrap rounded-[6px] px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    safeIndex === idx
                      ? 'bg-[#80EAFF] text-[#0D1A1D]'
                      : 'bg-[#2F4045] text-white hover:bg-[#3B5157]'
                  }`}
                >
                  {scene.label}
                </button>
              ))}
            </div>
          )}

          <span className="hidden items-center gap-1.5 text-xs font-medium text-[#9DB0B4] sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-[#80EAFF]" />
            Spot hidden Xsolla logos in the 360° view
          </span>
        </div>
      </div>

      <LmsSurfaceModal
        hotspot={systemModalHotspot}
        onClose={() => setSystemModalHotspot(null)}
      />
    </div>
  )
}
