import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
      setProgress(updatedProgress)
      setSelectedQuestZoneId(null)
      setSelectedRoomZoneId((prevRoomId) => prevRoomId ?? unlockedZone.id)
      notify(
        'achievement',
        `Zone Unlocked: ${unlockedZone.name}`,
        `Exploration progress is now ${updatedProgress.completion_percentage}%!`,
      )
    },
    [notify],
  )

  const handleEggClaimed = useCallback(
    (hotspotId: string, updatedProgress: ProgressDTO) => {
      setProgress(updatedProgress)
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
    [notify],
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
