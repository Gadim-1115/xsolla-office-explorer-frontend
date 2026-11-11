import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { httpRequest } from '../../shared/api/httpClient'
import type {
  HotspotDTO,
  InitMapResponseDTO,
  ProgressDTO,
  ZoneDTO,
} from '../../shared/types/api.types'
import { ToastContainer, type ToastMessage } from '../../shared/ui/Toast'

interface ExplorerContextValue {
  zones: Record<string, ZoneDTO>
  zoneList: ZoneDTO[]
  mapHotspots: HotspotDTO[]
  progress: ProgressDTO | null
  isLoading: boolean
  error: string | null
  selectedQuestZoneId: string | null
  selectedRoomZoneId: string | null
  selectedSceneId: string | null
  activeMapHotspot: HotspotDTO | null
  isCelebrationOpen: boolean
  closeCelebration: () => void
  openQuestModal: (zoneId: string) => void
  closeQuestModal: () => void
  openRoomModal: (zoneId: string, sceneId?: string) => void
  closeRoomModal: () => void
  openMapHotspot: (hotspot: HotspotDTO) => void
  closeMapHotspot: () => void
  handleZoneUnlocked: (unlockedZone: ZoneDTO, updatedProgress: ProgressDTO) => void
  handleEggClaimed: (hotspotId: string, updatedProgress: ProgressDTO) => void
  notify: (type: ToastMessage['type'], title: string, description?: string) => void
  refreshMap: () => Promise<void>
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null)

/** Every locked zone is unlocked and every hidden Xsolla logo is found. */
function isExplorationComplete(p: ProgressDTO): boolean {
  return p.unlocked_zones_count >= p.total_locked_zones && p.found_eggs_count >= p.total_easter_eggs
}

export function ExplorerProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<Record<string, ZoneDTO>>({})
  const [mapHotspots, setMapHotspots] = useState<HotspotDTO[]>([])
  const [progress, setProgress] = useState<ProgressDTO | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedQuestZoneId, setSelectedQuestZoneId] = useState<string | null>(null)
  const [selectedRoomZoneId, setSelectedRoomZoneId] = useState<string | null>(null)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [activeMapHotspot, setActiveMapHotspot] = useState<HotspotDTO | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false)
  // latest progress, readable inside the stable callbacks below
  const progressRef = useRef<ProgressDTO | null>(null)

  /**
   * Progress from an unlock or an egg claim. Celebrates only the step that crosses into 100%,
   * so a student who finished earlier is not celebrated again on every page load.
   */
  const applyProgress = useCallback((updated: ProgressDTO) => {
    const before = progressRef.current
    if (before && !isExplorationComplete(before) && isExplorationComplete(updated)) {
      setIsCelebrationOpen(true)
    }
    progressRef.current = updated
    setProgress(updated)
  }, [])

  const closeCelebration = useCallback(() => setIsCelebrationOpen(false), [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (type: ToastMessage['type'], title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev, { id, type, title, description }])
      setTimeout(() => {
        dismissToast(id)
      }, 4500)
    },
    [dismissToast],
  )

  const refreshMap = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await httpRequest<InitMapResponseDTO>('/explorer/init')
      const zoneMap: Record<string, ZoneDTO> = {}
      for (const z of data.zones) {
        zoneMap[z.id] = z
      }
      setZones(zoneMap)
      setMapHotspots(data.map_hotspots)
      progressRef.current = data.progress
      setProgress(data.progress)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize office map'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshMap()
  }, [refreshMap])

  const handleZoneUnlocked = useCallback(
    (unlockedZone: ZoneDTO, updatedProgress: ProgressDTO) => {
      setZones((prev) => ({
        ...prev,
        [unlockedZone.id]: unlockedZone,
      }))
      applyProgress(updatedProgress)
      setSelectedQuestZoneId(null)
      setSelectedRoomZoneId((prevRoomId) => prevRoomId ?? unlockedZone.id)
      notify(
        'achievement',
        `Zone Unlocked: ${unlockedZone.name}`,
        `Exploration progress is now ${updatedProgress.completion_percentage}%!`,
      )
    },
    [applyProgress, notify],
  )

  const handleEggClaimed = useCallback(
    (hotspotId: string, updatedProgress: ProgressDTO) => {
      applyProgress(updatedProgress)
      setZones((prev) => {
        const next: Record<string, ZoneDTO> = {}
        for (const [k, z] of Object.entries(prev)) {
          next[k] = {
            ...z,
            hotspots: z.hotspots.map((h) =>
              h.id === hotspotId ? { ...h, is_claimed: true } : h,
            ),
          }
        }
        return next
      })
      setMapHotspots((prev) =>
        prev.map((h) => (h.id === hotspotId ? { ...h, is_claimed: true } : h)),
      )
      notify(
        'achievement',
        'Hidden Xsolla Crest Discovered!',
        `Easter Eggs found: ${updatedProgress.found_eggs_count} / ${updatedProgress.total_easter_eggs}`,
      )
    },
    [applyProgress, notify],
  )

  const zoneList = useMemo(() => Object.values(zones), [zones])

  const value = useMemo<ExplorerContextValue>(
    () => ({
      zones,
      zoneList,
      mapHotspots,
      progress,
      isLoading,
      error,
      selectedQuestZoneId,
      selectedRoomZoneId,
      selectedSceneId,
      activeMapHotspot,
      isCelebrationOpen,
      closeCelebration,
      openQuestModal: (zoneId: string) => setSelectedQuestZoneId(zoneId),
      closeQuestModal: () => setSelectedQuestZoneId(null),
      openRoomModal: (zoneId: string, sceneId?: string) => {
        setSelectedRoomZoneId(zoneId)
        setSelectedSceneId(sceneId || null)
      },
      closeRoomModal: () => {
        setSelectedRoomZoneId(null)
        setSelectedSceneId(null)
      },
      openMapHotspot: (hotspot: HotspotDTO) => setActiveMapHotspot(hotspot),
      closeMapHotspot: () => setActiveMapHotspot(null),
      handleZoneUnlocked,
      handleEggClaimed,
      notify,
      refreshMap,
    }),
    [
      zones,
      zoneList,
      mapHotspots,
      progress,
      isLoading,
      error,
      selectedQuestZoneId,
      selectedRoomZoneId,
      selectedSceneId,
      activeMapHotspot,
      isCelebrationOpen,
      closeCelebration,
      handleZoneUnlocked,
      handleEggClaimed,
      notify,
      refreshMap,
    ],
  )

  return (
    <ExplorerContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ExplorerContext.Provider>
  )
}

export function useExplorer(): ExplorerContextValue {
  const ctx = useContext(ExplorerContext)
  if (!ctx) {
    throw new Error('useExplorer must be used within an ExplorerProvider')
  }
  return ctx
}
