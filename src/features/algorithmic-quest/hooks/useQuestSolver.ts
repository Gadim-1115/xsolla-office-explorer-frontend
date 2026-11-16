import { useCallback, useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type {
  CodeBlockDTO,
  QuestChallengeMode,
  QuestDTO,
} from '../../../shared/types/api.types'
import { fetchQuestByZone, verifyQuestSequence } from '../api/questService'
import { useExplorer } from '../../../app/providers/ExplorerProvider'

const QUEST_MODE_STORAGE_KEY = 'xsolla_explorer_quest_mode'

function readStoredQuestMode(): QuestChallengeMode {
  try {
    return localStorage.getItem(QUEST_MODE_STORAGE_KEY) === 'puzzle'
      ? 'puzzle'
      : 'algorithm'
  } catch {
    return 'algorithm'
  }
}

export function useQuestSolver(zoneId: string | null) {
  const { handleZoneUnlocked, notify } = useExplorer()

  const [mode, setModeState] = useState<QuestChallengeMode>(readStoredQuestMode)
  const [quest, setQuest] = useState<QuestDTO | null>(null)
  const [blocks, setBlocks] = useState<CodeBlockDTO[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const setMode = useCallback((nextMode: QuestChallengeMode) => {
    setModeState(nextMode)
    setErrorMessage(null)
    try {
      localStorage.setItem(QUEST_MODE_STORAGE_KEY, nextMode)
    } catch {
      return
    }
  }, [])

  useEffect(() => {
    if (!zoneId) {
      setQuest(null)
      setBlocks([])
      setErrorMessage(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setErrorMessage(null)

    fetchQuestByZone(zoneId, mode)
      .then((data) => {
        if (cancelled) return
        setQuest(data)
        setBlocks(data.code_blocks)
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : 'Failed to load challenge'
        setErrorMessage(msg)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [zoneId, mode])

  const reorderBlocks = useCallback((activeId: string, overId: string) => {
    setErrorMessage(null)
    setBlocks((items) => {
      const oldIndex = items.findIndex((i) => i.id === activeId)
      const newIndex = items.findIndex((i) => i.id === overId)
      if (oldIndex === -1 || newIndex === -1) return items
      return arrayMove(items, oldIndex, newIndex)
    })
  }, [])

  const submitSolution = useCallback(async () => {
    if (!zoneId || blocks.length === 0) return
    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      const submittedIds = blocks.map((b) => b.id)
      const result = await verifyQuestSequence(zoneId, submittedIds, mode)
      handleZoneUnlocked(result.unlocked_zone, result.progress)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : mode === 'puzzle'
            ? 'Incorrect puzzle order. Re-check the clues and try again!'
            : 'Incorrect sequence. Check the execution order and try again!'
      setErrorMessage(msg)
      notify('error', 'Verification Failed', msg)
    } finally {
      setIsSubmitting(false)
    }
  }, [zoneId, blocks, mode, handleZoneUnlocked, notify])

  return {
    mode,
    setMode,
    quest,
    blocks,
    isLoading,
    isSubmitting,
    errorMessage,
    reorderBlocks,
    submitSolution,
  }
}
