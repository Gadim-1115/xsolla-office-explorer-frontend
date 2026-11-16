import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Crown, Flame, User, X } from 'lucide-react'
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

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function LeaderboardAvatar({
  entry,
  sizeClass,
  iconClass,
}: {
  entry: LeaderboardEntry
  sizeClass: string
  iconClass: string
}) {
  const [imgFailed, setImgFailed] = useState<boolean>(false)
  const src = !imgFailed ? entry.avatarUrl : null

  return (
    <div className={`relative overflow-hidden rounded-full ${sizeClass}`}>
      {src ? (
        <img
          src={src}
          alt={entry.userName}
          onError={() => setImgFailed(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#153640] text-xs font-extrabold text-[#80EAFF]">
          {entry.userName ? getInitials(entry.userName) : <User className={iconClass} />}
        </div>
      )}
    </div>
  )
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

  const first = entries[0] ?? null
  const second = entries[1] ?? null
  const third = entries[2] ?? null
  const rest = entries.slice(3, 10)

  const renderPodiumSide = (
    entry: LeaderboardEntry | null,
    placeLabel: string,
    ringClass: string,
  ) => {
    if (!entry) {
      return <div className="w-24 sm:w-28" />
    }
    const isMe = currentUserId !== null && entry.userId === currentUserId
    return (
      <div className="flex w-24 sm:w-28 flex-col items-center text-center mt-5">
        <span className="mb-1.5 text-xs sm:text-sm font-extrabold tracking-tight text-white">
          {placeLabel}
        </span>
        <div
          className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-[3px] bg-[#1B2C30] shadow-lg ${ringClass}`}
        >
          <LeaderboardAvatar
            entry={entry}
            sizeClass="h-full w-full"
            iconClass="h-7 w-7 sm:h-8 sm:w-8 text-[#80EAFF]"
          />
          <Flame
            className={`absolute -bottom-1 -right-1 z-10 h-4 w-4 rounded-full bg-[#0F191C] p-0.5 ${
              entry.solvedToday
                ? 'fill-amber-400 text-orange-400'
                : 'text-[#6A7F84]'
            }`}
          />
        </div>
        <p className="mt-2 w-full truncate text-xs font-bold text-white">
          {entry.userName}
        </p>
        {isMe && (
          <span className="mt-0.5 rounded bg-[#80EAFF] px-1.5 py-0.2 text-[9px] font-black uppercase text-[#0D1A1D]">
            You
          </span>
        )}
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9DB0B4]">
          Streak
        </span>
        <span className="text-base sm:text-lg font-black text-[#80EAFF]">
          {entry.streak}
        </span>
      </div>
    )
  }

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#2F4045] bg-[#1B2628] shadow-[0_28px_90px_rgba(0,0,0,0.75)]"
      >
        <div className="relative bg-gradient-to-b from-[#10242A] via-[#132930] to-[#0E1B1F] pt-5 pb-8 px-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Leaderboard"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#2F4045] bg-[#1B2A2E]/80 text-[#9DB0B4] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="text-center text-lg sm:text-xl font-black uppercase tracking-[0.14em] text-white">
            LEADERBOARD
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#9DB0B4]">
              Loading Top 10 Streak Champions...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9DB0B4]">
              No active streaks recorded yet. Solve today’s Daily Bug Hunt in Open Space 2 to claim 1st place!
            </div>
          ) : (
            <div className="mt-3 flex items-start justify-center gap-3 sm:gap-5">
              {renderPodiumSide(second, '2 nd', 'border-[#80EAFF]')}

              {first ? (
                <div className="flex w-32 sm:w-36 flex-col items-center text-center">
                  <div className="relative mb-1 flex flex-col items-center">
                    <div className="flex items-center gap-1 rounded-t-lg bg-gradient-to-b from-amber-300 to-amber-500 px-3 py-0.5 text-[11px] font-black text-[#0D1A1D] shadow-[0_0_15px_rgba(251,191,36,0.45)]">
                      <Crown className="h-3.5 w-3.5 fill-[#0D1A1D]" />
                      <span>1 st</span>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div
                      className="pointer-events-none absolute -inset-3 rounded-full opacity-45"
                      style={{
                        background:
                          'repeating-conic-gradient(from 0deg, rgba(128,234,255,0.35) 0deg 6deg, transparent 6deg 20deg)',
                      }}
                    />
                    <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-[#153640] shadow-[0_0_28px_rgba(251,191,36,0.35)]">
                      <LeaderboardAvatar
                        entry={first}
                        sizeClass="h-full w-full"
                        iconClass="h-10 w-10 sm:h-12 sm:w-12 text-white"
                      />
                      <Flame
                        className={`absolute -bottom-1 -right-1 z-10 h-5 w-5 rounded-full bg-[#0F191C] p-0.5 ${
                          first.solvedToday
                            ? 'fill-amber-400 text-orange-400'
                            : 'text-[#6A7F84]'
                        }`}
                      />
                    </div>
                  </div>

                  <p className="mt-2.5 w-full truncate text-xs sm:text-sm font-extrabold text-white">
                    {first.userName}
                  </p>
                  {currentUserId !== null && first.userId === currentUserId && (
                    <span className="mt-0.5 rounded bg-[#80EAFF] px-1.5 py-0.2 text-[9px] font-black uppercase text-[#0D1A1D]">
                      You
                    </span>
                  )}
                  <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9DB0B4]">
                    Streak
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-300">
                    {first.streak}
                  </span>
                </div>
              ) : null}

              {renderPodiumSide(third, '3 rd', 'border-amber-500/80')}
            </div>
          )}

          <svg
            viewBox="0 0 400 28"
            preserveAspectRatio="none"
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 w-full text-[#1B2628]"
          >
            <path
              d="M0,0 Q200,28 400,0 L400,28 L0,28 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="px-4 pt-1 pb-4 flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-12 items-center rounded-t-lg border border-[#2F4045] bg-[#141E20] px-4 py-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#80EAFF]">
            <span className="col-span-2 text-left">RANK</span>
            <span className="col-span-6 text-left">NAME</span>
            <span className="col-span-4 text-right">HIGHEST STREAK</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#2F4045]/70 rounded-b-lg border-x border-b border-[#2F4045]">
            {rest.length === 0 ? (
              <div className="bg-[#233134] px-4 py-6 text-center text-xs text-[#9DB0B4]">
                Ranks 4–10 will appear here as more players build daily streaks.
              </div>
            ) : (
              rest.map((item, idx) => {
                const isMe = currentUserId !== null && item.userId === currentUserId
                return (
                  <div
                    key={item.userId}
                    className={`grid grid-cols-12 items-center px-4 py-2.5 transition ${
                      isMe
                        ? 'bg-[#153640] text-white'
                        : idx % 2 === 0
                          ? 'bg-[#233134] text-white'
                          : 'bg-[#1E2B2E] text-white'
                    }`}
                  >
                    <div className="col-span-2 text-left text-base sm:text-lg font-black text-[#80EAFF]">
                      {item.rank}
                    </div>

                    <div className="col-span-6 flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#80EAFF]/50 bg-[#153640]">
                        <LeaderboardAvatar
                          entry={item}
                          sizeClass="h-full w-full"
                          iconClass="h-4 w-4 text-[#80EAFF]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-bold text-white">
                          {item.userName}
                        </p>
                        {isMe && (
                          <span className="inline-block rounded bg-[#80EAFF] px-1.5 py-0.2 text-[9px] font-black uppercase text-[#0D1A1D]">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-4 flex items-center justify-end gap-1.5 text-right">
                      <Flame
                        className={`h-4 w-4 shrink-0 ${
                          item.solvedToday
                            ? 'fill-amber-400 text-orange-400'
                            : 'text-[#62777C] opacity-65'
                        }`}
                      />
                      <span className="text-base sm:text-lg font-black text-white">
                        {item.streak}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
