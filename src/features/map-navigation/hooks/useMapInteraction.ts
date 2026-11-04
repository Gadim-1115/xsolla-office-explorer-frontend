import { useCallback, useState } from 'react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'

export function useMapInteraction() {
  const { zones, openQuestModal, openRoomModal, notify } = useExplorer()
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null)

  const handleZoneClick = useCallback(
    (zoneId: string) => {
      const zone = zones[zoneId]
      if (!zone) {
        notify('error', 'Zone Unavailable', `Zone "${zoneId}" is not registered.`)
        return
      }

      if (zone.status === 'LOCKED') {
        openQuestModal(zoneId)
      } else {
        openRoomModal(zoneId)
      }
    },
    [zones, openQuestModal, openRoomModal, notify],
  )

  return {
    hoveredZoneId,
    setHoveredZoneId,
    handleZoneClick,
  }
}
