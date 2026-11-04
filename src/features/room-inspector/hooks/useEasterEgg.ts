import { useCallback, useState } from 'react'
import { httpRequest } from '../../../shared/api/httpClient'
import type { ProgressDTO } from '../../../shared/types/api.types'
import { useExplorer } from '../../../app/providers/ExplorerProvider'

export function useEasterEgg() {
  const { handleEggClaimed, notify } = useExplorer()
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const claimEgg = useCallback(
    async (hotspotId: string) => {
      try {
        setClaimingId(hotspotId)
        const updatedProgress = await httpRequest<ProgressDTO>(
          `/explorer/easter-eggs/${encodeURIComponent(hotspotId)}/claim`,
          { method: 'POST' },
        )
        handleEggClaimed(hotspotId, updatedProgress)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not claim Easter egg'
        notify('error', 'Easter Egg Error', msg)
      } finally {
        setClaimingId(null)
      }
    },
    [handleEggClaimed, notify],
  )

  return {
    claimEgg,
    claimingId,
  }
}
