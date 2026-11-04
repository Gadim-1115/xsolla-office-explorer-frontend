import { Compass, Sparkles, Unlock, RotateCcw } from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'

export function ProgressHeader() {
  const { progress, notify, refreshMap } = useExplorer()

  const completion = progress?.completion_percentage ?? 0
  const unlockedZones = progress?.unlocked_zones_count ?? 0
  const totalLocked = progress?.total_locked_zones ?? 15
  const foundEggs = progress?.found_eggs_count ?? 0
  const totalEggs = progress?.total_easter_eggs ?? 5

  const handleResetDemoUser = () => {
    localStorage.removeItem('xsolla_explorer_student_id')
    notify('success', 'New Student Session Started', 'All zones reset to initial state.')
    void refreshMap()
  }

  return (
    <header className="w-full border-b border-indigo-500/20 bg-[#121224]/95 backdrop-blur-md px-6 py-3.5 z-30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <Compass className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Xsolla School Baku
              </span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                31st Floor · Crescent
              </span>
            </div>
            <h1 className="text-base font-bold text-white">Interactive Office Explorer</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-2 border border-white/10">
            <Unlock className="h-4 w-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Quests Solved
              </p>
              <p className="text-xs font-bold text-white">
                {unlockedZones} / {totalLocked} Zones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-2 border border-white/10">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Easter Eggs
              </p>
              <p className="text-xs font-bold text-white">
                {foundEggs} / {totalEggs} Found
              </p>
            </div>
          </div>

          <div className="w-48 text-left">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Exploration</span>
              <span className="font-bold text-indigo-400">{completion}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, completion)}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDemoUser}
            title="Start fresh student session"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Session
          </button>
        </div>
      </div>
    </header>
  )
}
