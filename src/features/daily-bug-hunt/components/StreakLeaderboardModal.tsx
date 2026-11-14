import { useEffect, useState } from 'react'
import { Award, Flame, Medal, Trophy, X } from 'lucide-react'
import { getLmsUser } from '../../../shared/api/lmsClient'
import {
  fetchStreakLeaderboard,
  STREAK_UPDATED_EVENT,
  type LeaderboardEntry,
} from '../api/streakService'

interface StreakLeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StreakLeaderboardModal({
  isOpen,
  onClose,
}: StreakLeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const currentUser = getLmsUser()
  const currentUserId = currentUser ? `lms-${currentUser.id}` : null

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setLoading(true)
    fetchStreakLeaderboard()
      .then((rows) => {
        if (!cancelled) {
          setEntries(rows)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    const refresh = () => {
      void fetchStreakLeaderboard().then((rows) => {
        if (!cancelled) setEntries(rows)
      })
    }
    window.addEventListener(STREAK_UPDATED_EVENT, refresh)
    return () => {
      cancelled = true
      window.removeEventListener(STREAK_UPDATED_EVENT, refresh)
    }
  }, [isOpen])

  if (!isOpen) return null

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 font-bold text-xs shadow-[0_0_12px_rgba(251,191,36,0.3)]">
          <Trophy className="h-3.5 w-3.5" />
        </span>
      )
    }
    if (rank === 2) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300/20 border border-slate-300 text-slate-200 font-bold text-xs">
          <Medal className="h-3.5 w-3.5" />
        </span>
      )
    }
    if (rank === 3) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700/25 border border-amber-500/70 text-amber-400 font-bold text-xs">
          <Award className="h-3.5 w-3.5" />
        </span>
      )
    }
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#182629] border border-[#2F4045] text-[#9DB0B4] font-mono text-xs font-bold">
        {rank}
      </span>
    )
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[85dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#2F4045] bg-[#1B2628] shadow-[0_28px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-[#80EAFF] to-amber-400" />

        <div className="flex items-center justify-between border-b border-[#2F4045] bg-[#141E20] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-500/15 text-amber-300">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Game Room 1 · Trophy Cabinet
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Daily Bug Hunt · Top 10 Streak Leaderboard
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#2F4045] bg-[#233134] text-[#9DB0B4] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#9DB0B4]">
              Loading Top 10 Streak Champions...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#9DB0B4]">
              No active streaks recorded yet. Solve today’s bug in Open Space 2 to claim #1!
            </div>
          ) : (
            entries.map((item) => {
              const isMe = currentUserId !== null && item.userId === currentUserId
              return (
                <div
                  key={item.userId}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                    isMe
                      ? 'border-[#80EAFF] bg-[#153640]/90 shadow-[0_0_20px_rgba(128,234,255,0.18)]'
                      : item.rank <= 3
                        ? 'border-amber-400/30 bg-[#212F33]'
                        : 'border-[#2F4045] bg-[#233134]/80'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {renderRankBadge(item.rank)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-white">
                          {item.userName}
                        </p>
                        {isMe && (
                          <span className="rounded bg-[#80EAFF] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#0D1A1D]">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9DB0B4]">
                        {item.userRole} ·{' '}
                        {item.solvedToday ? 'Solved today’s bug' : 'Pending today’s bug'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                      item.solvedToday
                        ? 'border-amber-400/60 bg-amber-500/20 text-amber-300'
                        : 'border-[#2F4045] bg-[#182326] text-[#9DB0B4]'
                    }`}
                  >
                    <Flame
                      className={`h-4 w-4 ${
                        item.solvedToday
                          ? 'fill-amber-400 text-orange-400'
                          : 'text-[#63777C] opacity-65'
                      }`}
                    />
                    <span>{item.streak}</span>
                    <span className="text-[10px] font-normal opacity-80">
                      {item.streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#2F4045] bg-[#141E20] px-5 py-3 text-[11px] text-[#9DB0B4]">
          <span>Solve the Daily Bug in Open Space 2 (View 3) every day to keep your streak lit.</span>
          <span className="font-semibold text-[#80EAFF]">Top 10</span>
        </div>
      </div>
    </div>
  )
}
