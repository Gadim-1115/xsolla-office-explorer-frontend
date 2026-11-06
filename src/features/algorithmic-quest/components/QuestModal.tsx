import { Code2, Lock, Play, AlertCircle } from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import { useQuestSolver } from '../hooks/useQuestSolver'
import { SortableCodeList } from './SortableCodeList'

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: 'bg-[#153640] text-[#80EAFF] border-[#80EAFF]/40',
  MEDIUM: 'bg-[#1B2628] text-white border-[#2F4045]',
  MEDIUM_HARD: 'bg-[#3A3220] text-amber-300 border-amber-400/50',
  HARD: 'bg-[#3A2429] text-rose-300 border-rose-400/50',
}

export function QuestModal() {
  const { selectedQuestZoneId, closeQuestModal } = useExplorer()
  const {
    quest,
    blocks,
    isLoading,
    isSubmitting,
    errorMessage,
    reorderBlocks,
    submitSolution,
  } = useQuestSolver(selectedQuestZoneId)

  const isOpen = Boolean(selectedQuestZoneId)

  const difficultyBadge = quest?.difficulty ? (
    <span
      className={`rounded-[4px] border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
        DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.EASY
      }`}
    >
      {quest.difficulty.replace('_', ' ')}
    </span>
  ) : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeQuestModal}
      title={quest ? quest.title : 'Algorithmic Security Lock'}
      subtitle={
        quest
          ? `Unlock ${quest.zone_name} by ordering the Go code blocks below`
          : 'Loading challenge...'
      }
      badge={difficultyBadge}
      maxWidthClass="max-w-2xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#9DB0B4]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#80EAFF]/70 border-t-transparent mb-3" />
          <p className="text-sm font-medium">Loading algorithmic quest...</p>
        </div>
      ) : quest ? (
        <div className="flex flex-col gap-5 text-left">
          <div className="relative rounded-[6px] border border-[#80EAFF]/40 bg-[#153640] p-4 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#80EAFF]" />
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#80EAFF] mb-1.5">
              <Code2 className="h-4 w-4" />
              Problem Statement
            </div>
            <p className="text-sm text-white leading-relaxed font-medium">
              {quest.problem_statement}
            </p>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-medium text-[#9DB0B4]">
              Drag and drop the lines below into the valid Go execution order:
            </p>
            <SortableCodeList blocks={blocks} onReorder={reorderBlocks} />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-[6px] border border-rose-400/50 bg-[#3A2429] px-4 py-3 text-xs font-semibold text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#2F4045] pt-4">
            <div className="flex items-center gap-2 text-xs text-[#9DB0B4]">
              <Lock className="h-3.5 w-3.5 text-[#80EAFF]" />
              <span>Verified server-side against anti-cheat rules</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeQuestModal}
                className="rounded-[6px] bg-[#2F4045] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3B5157] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void submitSolution()}
                className="flex items-center gap-2 rounded-[6px] bg-[#80EAFF] px-5 py-2.5 text-xs font-semibold text-[#0D1A1D] hover:bg-[#A6F1FF] disabled:opacity-50 transition cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isSubmitting ? 'Verifying...' : 'Verify & Unlock Zone'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-rose-400">
          {errorMessage || 'Quest could not be loaded.'}
        </div>
      )}
    </Modal>
  )
}
