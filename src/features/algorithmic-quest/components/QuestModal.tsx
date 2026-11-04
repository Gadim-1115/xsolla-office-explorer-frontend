import { Code2, Lock, Play, AlertCircle } from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import { useQuestSolver } from '../hooks/useQuestSolver'
import { SortableCodeList } from './SortableCodeList'

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  MEDIUM: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  MEDIUM_HARD: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  HARD: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
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
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
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
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3" />
          <p className="text-sm">Loading algorithmic quest...</p>
        </div>
      ) : quest ? (
        <div className="flex flex-col gap-5 text-left">
          <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">
              <Code2 className="h-4 w-4" />
              Problem Statement
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {quest.problem_statement}
            </p>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-medium text-slate-400">
              Drag and drop the lines below into the valid Go execution order:
            </p>
            <SortableCodeList blocks={blocks} onReorder={reorderBlocks} />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Verified server-side against anti-cheat rules</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeQuestModal}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void submitSolution()}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isSubmitting ? 'Verifying...' : 'Verify & Unlock Zone'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-rose-300">
          {errorMessage || 'Quest could not be loaded.'}
        </div>
      )}
    </Modal>
  )
}
