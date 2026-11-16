import { Code2, Lock, Play, AlertCircle, Puzzle } from 'lucide-react'
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
    mode,
    setMode,
    quest,
    blocks,
    isLoading,
    isSubmitting,
    errorMessage,
    reorderBlocks,
    submitSolution,
  } = useQuestSolver(selectedQuestZoneId)

  const isOpen = Boolean(selectedQuestZoneId)
  const isPuzzle = mode === 'puzzle'

  const difficultyBadge = quest?.difficulty ? (
    <span
      className={`rounded-[4px] border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
        DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.EASY
      }`}
    >
      {quest.difficulty.replace('_', ' ')}
    </span>
  ) : null

  const modeSwitcher = (
    <div
      role="group"
      aria-label="Challenge mode selector"
      className="inline-flex items-center rounded-[7px] border border-[#2F4045] bg-[#141E20] p-0.5"
    >
      <button
        type="button"
        onClick={() => setMode('algorithm')}
        className={`flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
          !isPuzzle
            ? 'bg-[#80EAFF] text-[#0D1A1D] shadow-sm'
            : 'text-[#9DB0B4] hover:text-white'
        }`}
      >
        <Code2 className="h-3.5 w-3.5" />
        <span>Algorithm</span>
      </button>
      <button
        type="button"
        onClick={() => setMode('puzzle')}
        className={`flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
          isPuzzle
            ? 'bg-violet-400 text-[#120E24] shadow-sm'
            : 'text-[#9DB0B4] hover:text-white'
        }`}
      >
        <Puzzle className="h-3.5 w-3.5" />
        <span>Puzzle</span>
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeQuestModal}
      title={
        quest
          ? quest.title
          : isPuzzle
            ? 'Logic Puzzle Lock'
            : 'Algorithmic Security Lock'
      }
      subtitle={
        quest
          ? isPuzzle
            ? `Unlock ${quest.zone_name} by solving the logic puzzle below (no coding required)`
            : `Unlock ${quest.zone_name} by ordering the Go code blocks below`
          : 'Loading challenge...'
      }
      badge={difficultyBadge}
      headerAction={modeSwitcher}
      maxWidthClass="max-w-2xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#9DB0B4]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#80EAFF]/70 border-t-transparent mb-3" />
          <p className="text-sm font-medium">
            {isPuzzle ? 'Loading logic puzzle...' : 'Loading algorithmic quest...'}
          </p>
        </div>
      ) : quest ? (
        <div className="flex flex-col gap-5 text-left">
          <div
            className={`relative rounded-[6px] border p-4 overflow-hidden ${
              isPuzzle
                ? 'border-violet-400/40 bg-[#1D1B33]'
                : 'border-[#80EAFF]/40 bg-[#153640]'
            }`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-[3px] ${
                isPuzzle ? 'bg-violet-400' : 'bg-[#80EAFF]'
              }`}
            />
            <div
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5 ${
                isPuzzle ? 'text-violet-300' : 'text-[#80EAFF]'
              }`}
            >
              {isPuzzle ? (
                <>
                  <Puzzle className="h-4 w-4" />
                  <span>Puzzle Clues</span>
                </>
              ) : (
                <>
                  <Code2 className="h-4 w-4" />
                  <span>Problem Statement</span>
                </>
              )}
            </div>
            <p className="whitespace-pre-line text-sm text-white leading-relaxed font-medium">
              {quest.problem_statement}
            </p>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-medium text-[#9DB0B4]">
              {isPuzzle
                ? 'Drag and drop the cards below into the correct order from top (#1) to bottom:'
                : 'Drag and drop the lines below into the valid Go execution order:'}
            </p>
            <SortableCodeList
              blocks={blocks}
              onReorder={reorderBlocks}
              mode={mode}
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-[6px] border border-rose-400/50 bg-[#3A2429] px-4 py-3 text-xs font-semibold text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#2F4045] pt-4">
            <div className="flex items-center gap-2 text-xs text-[#9DB0B4]">
              <Lock
                className={`h-3.5 w-3.5 ${
                  isPuzzle ? 'text-violet-300' : 'text-[#80EAFF]'
                }`}
              />
              <span>
                {isPuzzle
                  ? 'Mode saved automatically for all locked rooms'
                  : 'Verified server-side against anti-cheat rules'}
              </span>
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
                className={`flex items-center gap-2 rounded-[6px] px-5 py-2.5 text-xs font-semibold disabled:opacity-50 transition cursor-pointer ${
                  isPuzzle
                    ? 'bg-violet-400 text-[#120E24] hover:bg-violet-300'
                    : 'bg-[#80EAFF] text-[#0D1A1D] hover:bg-[#A6F1FF]'
                }`}
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
