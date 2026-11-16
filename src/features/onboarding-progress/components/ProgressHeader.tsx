import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Flame, LogIn, LogOut, RotateCcw, UserCheck } from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import { httpRequest } from '../../../shared/api/httpClient'
import {
  bumpLmsExplorerSessionReset,
  captureLmsSessionFromUrl,
  clearLmsSession,
  getLmsRoleLabel,
  getLmsUser,
  redirectToLmsApp,
  redirectToLmsLogin,
  type LmsUser,
} from '../../../shared/api/lmsClient'
import {
  getUserStreakStatus,
  STREAK_UPDATED_EVENT,
  syncUserStreakFromBackend,
  type UserStreakStatus,
} from '../../daily-bug-hunt/api/streakService'
import { StudentReminderButton } from './StudentReminderButton'
import { XsollaLogo } from '../../../shared/ui/XsollaLogo'

export function ProgressHeader() {
  const {
    zones,
    progress,
    selectedRoomZoneId,
    notify,
    refreshMap,
    openRoomModal,
    closeRoomModal,
    openQuestModal,
  } = useExplorer()
  const headerRef = useRef<HTMLElement>(null)
  const [lmsUser, setLmsUser] = useState<LmsUser | null>(() => {
    captureLmsSessionFromUrl()
    return getLmsUser()
  })
  const [streakStatus, setStreakStatus] = useState<UserStreakStatus | null>(() =>
    getUserStreakStatus(getLmsUser()),
  )

  useEffect(() => {
    const syncUser = () => {
      captureLmsSessionFromUrl()
      const current = getLmsUser()
      setLmsUser(current)
      setStreakStatus(getUserStreakStatus(current))
      if (current) {
        void syncUserStreakFromBackend(current).then((synced) => {
          setStreakStatus(synced)
        })
      }
    }
    syncUser()
    window.addEventListener('hashchange', syncUser)
    window.addEventListener('popstate', syncUser)
    window.addEventListener('focus', syncUser)
    window.addEventListener(STREAK_UPDATED_EVENT, syncUser)
    return () => {
      window.removeEventListener('hashchange', syncUser)
      window.removeEventListener('popstate', syncUser)
      window.removeEventListener('focus', syncUser)
      window.removeEventListener(STREAK_UPDATED_EVENT, syncUser)
    }
  }, [])

  const completion = progress?.completion_percentage ?? 0
  const unlockedZones = progress?.unlocked_zones_count ?? 0
  const totalLocked = progress?.total_locked_zones ?? 7
  const foundEggs = progress?.found_eggs_count ?? 0
  const totalEggs = progress?.total_easter_eggs ?? 5

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const publish = () =>
      document.documentElement.style.setProperty(
        '--explorer-header-h',
        `${Math.ceil(el.getBoundingClientRect().height)}px`,
      )
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleResetDemoUser = async () => {
    await httpRequest('/explorer/reset', { method: 'POST' }).catch(() => undefined)
    bumpLmsExplorerSessionReset(getLmsUser())
    closeRoomModal()
    notify('success', 'Session Reset', 'All zones and progress reset to initial state.')
    void refreshMap()
  }

  const handleLmsSignOut = () => {
    clearLmsSession()
    setLmsUser(null)
    setStreakStatus(null)
    closeRoomModal()
    void refreshMap()
    notify('success', 'Signed Out of LMS', 'Session reset to guest mode and locked zones restored.')
  }

  const handleStreakClick = () => {
    const os2 = zones['zone_open_space_2']
    if (os2 && os2.status === 'LOCKED') {
      openQuestModal('zone_open_space_2')
      return
    }
    openRoomModal('zone_open_space_2', 'zone_open_space_2_3')
  }

  const tileClass = 'min-w-0 rounded-[4px] border px-2.5 py-1.5 text-left sm:px-3.5 sm:py-2'
  const labelClass = 'truncate text-[10px] text-[#9DB0B4] sm:text-[11px]'

  return (
    <header
      ref={headerRef}
      className="w-full border-b border-[#2F4045] bg-[#141E20] px-4 py-2 sm:px-6 sm:py-2.5 z-30"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-2 xl:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <XsollaLogo className="h-6 shrink-0 text-white sm:h-7" />
          <span className="h-5 w-[1px] shrink-0 bg-[#2F4045]" />
          <span className="font-display truncate text-xs font-bold text-white">
            Xsolla Office
          </span>
        </div>

        <div className="order-3 grid w-full grid-cols-3 gap-2 xl:order-2 xl:w-auto xl:max-w-2xl xl:flex-1">
          <div className={`${tileClass} relative overflow-hidden border-[#80EAFF]/40 bg-[#153640]`}>
            <div
              className="absolute top-0 left-0 h-[3px] bg-[#80EAFF] transition-all duration-500"
              style={{ width: `${Math.max(12, Math.min(100, completion))}%` }}
            />
            <p className={labelClass}>
              <span className="sm:hidden">Explored</span>
              <span className="hidden sm:inline">Exploration Progress</span>
            </p>
            <p className="mt-0.5 truncate text-xs font-bold text-white">
              {completion}%<span className="hidden sm:inline"> Office Completed</span>
            </p>
          </div>

          <div className={`${tileClass} border-[#2F4045] bg-[#233134]`}>
            <p className={labelClass}>
              <span className="sm:hidden">Zones</span>
              <span className="hidden sm:inline">Algorithmic Quests</span>
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-white">
              {unlockedZones} / {totalLocked}
              <span className="hidden sm:inline"> Zones Unlocked</span>
            </p>
          </div>

          <div className={`${tileClass} border-[#2F4045] bg-[#233134]`}>
            <p className={labelClass}>
              <span className="sm:hidden">Logos</span>
              <span className="hidden sm:inline">Hidden Xsolla Logos</span>
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-white">
              {foundEggs} / {totalEggs}
              <span className="hidden sm:inline"> Discovered</span>
            </p>
          </div>
        </div>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-2 xl:order-3 xl:ml-0">
          {lmsUser ? (
            <>
              {!selectedRoomZoneId && <StudentReminderButton user={lmsUser} />}

              <button
                type="button"
                onClick={handleStreakClick}
                title={
                  streakStatus?.solvedToday
                    ? `${streakStatus.streak} Day Streak Active Today! Click to visit Daily Bug Hunt monitor.`
                    : `Daily Streak Unlit (${streakStatus?.streak ?? 0} days). Click to solve today’s bug in Open Space 2!`
                }
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-[6px] border px-2.5 text-xs font-bold transition cursor-pointer ${
                  streakStatus?.solvedToday
                    ? 'border-amber-400/70 bg-amber-500/20 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.22)] hover:bg-amber-500/30'
                    : 'border-[#2F4045] bg-[#1D2A2D] text-[#7D9196] hover:border-[#80EAFF]/50 hover:text-white'
                }`}
              >
                <Flame
                  className={`h-4 w-4 transition-all ${
                    streakStatus?.solvedToday
                      ? 'fill-amber-400 text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.85)]'
                      : 'text-[#5A6E73] opacity-55'
                  }`}
                />
                <span>{streakStatus?.streak ?? 0}</span>
              </button>

              <button
                type="button"
                onClick={() => redirectToLmsApp()}
                title="Return to Xsolla School LMS"
                className="flex shrink-0 items-center gap-1.5 rounded-[6px] border border-[#80EAFF]/40 bg-[#153640] px-2.5 py-2 text-xs font-semibold text-[#80EAFF] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer sm:px-3"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to LMS</span>
              </button>
              <div className="flex items-center gap-1.5 rounded-[6px] border border-[#2F4045] bg-[#233134] px-2.5 py-1.5 text-xs text-white">
                {streakStatus?.avatarUrl || lmsUser.avatarUrl ? (
                  <img
                    src={streakStatus?.avatarUrl || lmsUser.avatarUrl || ''}
                    alt={lmsUser.name}
                    className="h-5 w-5 rounded-full object-cover border border-[#80EAFF]/50"
                  />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 text-[#80EAFF]" />
                )}
                <span className="hidden md:inline font-semibold">{lmsUser.name}</span>
                <span className="rounded bg-[#153640] px-1.5 py-0.5 text-[10px] font-bold text-[#80EAFF]">
                  {getLmsRoleLabel(lmsUser)}
                </span>
                <button
                  type="button"
                  onClick={handleLmsSignOut}
                  title="Sign out of LMS session"
                  className="ml-1 rounded p-0.5 text-[#9DB0B4] hover:bg-[#2F4045] hover:text-white transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => redirectToLmsLogin()}
              title="Sign in with Xsolla School LMS"
              className="flex shrink-0 items-center gap-1.5 rounded-[6px] border border-[#2F4045] bg-[#233134] px-2.5 py-2 text-xs font-semibold text-white hover:border-[#80EAFF] hover:text-[#80EAFF] transition cursor-pointer sm:px-3"
            >
              <LogIn className="h-3.5 w-3.5 text-[#80EAFF]" />
              <span className="hidden sm:inline">LMS Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetDemoUser}
            title="Reset Session"
            aria-label="Reset Session"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#80EAFF]/30 bg-[#145B6D] text-[#80EAFF] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
