import { RotateCcw } from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import { XsollaLogo } from '../../../shared/ui/XsollaLogo'

export function ProgressHeader() {
  const { progress, notify, refreshMap } = useExplorer()

  const completion = progress?.completion_percentage ?? 0
  const unlockedZones = progress?.unlocked_zones_count ?? 0
  const totalLocked = progress?.total_locked_zones ?? 7
  const foundEggs = progress?.found_eggs_count ?? 0
  const totalEggs = progress?.total_easter_eggs ?? 5

  const handleResetDemoUser = () => {
    localStorage.removeItem('xsolla_explorer_student_id')
    notify('success', 'New Student Session Started', 'All zones reset to initial state.')
    void refreshMap()
  }

  return (
    <header className="w-full border-b border-[#2F4045] bg-[#141E20] px-6 py-2.5 z-30">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <XsollaLogo className="h-7 text-white" />
          <span className="h-5 w-[1px] bg-[#2F4045]" />
          <span className="font-display text-xs font-bold text-white">
            School Baku · 31st Floor Explorer
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-3xl">
          <div className="rounded-[4px] border border-[#2F4045] bg-[#233134] px-3.5 py-2 text-left">
            <p className="text-[11px] text-[#9DB0B4]">Xsolla</p>
            <p className="mt-0.5 text-xs font-semibold text-white truncate">
              All the things to launch, grow, and win
            </p>
          </div>

          <div className="relative rounded-[4px] border border-[#80EAFF]/40 bg-[#153640] px-3.5 py-2 text-left overflow-hidden">
            <div
              className="absolute top-0 left-0 h-[3px] bg-[#80EAFF] transition-all duration-500"
              style={{ width: `${Math.max(12, Math.min(100, completion))}%` }}
            />
            <p className="text-[11px] text-[#9DB0B4]">Exploration Progress</p>
            <p className="mt-0.5 text-xs font-bold text-white">
              {completion}% Office Completed
            </p>
          </div>

          <div className="rounded-[4px] border border-[#2F4045] bg-[#233134] px-3.5 py-2 text-left">
            <p className="text-[11px] text-[#9DB0B4]">Algorithmic Quests</p>
            <p className="mt-0.5 text-xs font-semibold text-white">
              {unlockedZones} / {totalLocked} Zones Unlocked
            </p>
          </div>

          <div className="rounded-[4px] border border-[#2F4045] bg-[#233134] px-3.5 py-2 text-left">
            <p className="text-[11px] text-[#9DB0B4]">Hidden Xsolla Logos</p>
            <p className="mt-0.5 text-xs font-semibold text-white">
              {foundEggs} / {totalEggs} Discovered
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDemoUser}
          title="Start fresh student session"
          className="flex items-center gap-1.5 rounded-[6px] border border-[#80EAFF]/30 bg-[#145B6D] px-4 py-2 text-xs font-semibold text-[#80EAFF] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Session
        </button>
      </div>
    </header>
  )
}
