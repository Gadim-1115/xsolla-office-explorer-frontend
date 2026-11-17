import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flame,
  LogIn,
  LogOut,
  Menu,
  RotateCcw,
  Trophy,
  UserCheck,
} from 'lucide-react'
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
  syncLeaderboardWithLms,
  syncUserStreakFromBackend,
  type UserStreakStatus,
} from '../../daily-bug-hunt/api/streakService'
import { StreakLeaderboardModal } from '../../daily-bug-hunt/components/StreakLeaderboardModal'
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
    openGuideModal,
  } = useExplorer()
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [progressOpen, setProgressOpen] = useState<boolean>(false)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false)
  const [lmsUser, setLmsUser] = useState<LmsUser | null>(() => {
    captureLmsSessionFromUrl()
    return getLmsUser()
  })
  const [streakStatus, setStreakStatus] = useState<UserStreakStatus | null>(() =>
    getUserStreakStatus(getLmsUser()),
  )

  useEffect(() => {
    let syncing = false
    const syncUser = () => {
      captureLmsSessionFromUrl()
      const current = getLmsUser()
      setLmsUser(current)
      setStreakStatus(getUserStreakStatus(current))
      if (current && !syncing) {
        syncing = true
        void syncLeaderboardWithLms()
          .then(({ currentUser: liveUser }) => {
            setLmsUser(liveUser)
            if (liveUser) {
              return syncUserStreakFromBackend(liveUser).then((synced) => {
                setStreakStatus(synced)
              })
            }
            setStreakStatus(null)
            closeRoomModal()
            void refreshMap()
            return undefined
          })
          .finally(() => {
            syncing = false
          })
      }
    }
    const onStreakUpdated = () => {
      const current = getLmsUser()
      setLmsUser(current)
      setStreakStatus(getUserStreakStatus(current))
    }
    syncUser()
    window.addEventListener('hashchange', syncUser)
    window.addEventListener('popstate', syncUser)
    window.addEventListener('focus', syncUser)
    window.addEventListener(STREAK_UPDATED_EVENT, onStreakUpdated)
    return () => {
      window.removeEventListener('hashchange', syncUser)
      window.removeEventListener('popstate', syncUser)
      window.removeEventListener('focus', syncUser)
      window.removeEventListener(STREAK_UPDATED_EVENT, onStreakUpdated)
    }
  }, [closeRoomModal, refreshMap])

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

  useEffect(() => {
    if (!menuOpen) return
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    window.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('keydown', handleEsc)
    }
  }, [menuOpen])

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
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <XsollaLogo className="h-6 shrink-0 text-white sm:h-7" />
            <span className="h-5 w-[1px] shrink-0 bg-[#2F4045]" />
            <span className="font-display truncate text-xs font-bold text-white">
              Xsolla Office
            </span>
          </div>

          {!progressOpen ? (
            <button
              type="button"
              onClick={() => setProgressOpen(true)}
              title="Show exploration progress"
              aria-label="Show exploration progress"
              className="flex h-8 items-center gap-1.5 rounded-[6px] border border-[#2F4045] bg-[#1B2628] px-2.5 text-xs font-semibold text-[#9DB0B4] hover:border-[#80EAFF]/60 hover:text-[#80EAFF] transition cursor-pointer"
            >
              <span className="text-[11px] font-bold text-white">{completion}%</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#80EAFF]" />
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <div className="grid grid-cols-3 gap-2">
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

              <button
                type="button"
                onClick={() => setProgressOpen(false)}
                title="Hide exploration progress"
                aria-label="Hide exploration progress"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#2F4045] bg-[#1B2628] text-[#9DB0B4] hover:border-[#80EAFF] hover:text-[#80EAFF] transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {lmsUser ? (
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
              <span className="max-w-[130px] truncate font-semibold sm:max-w-none">
                {lmsUser.name}
              </span>
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
          ) : (
            <button
              type="button"
              onClick={() => redirectToLmsLogin()}
              title="Sign in with Xsolla School LMS"
              className="flex shrink-0 items-center gap-1.5 rounded-[6px] border border-[#2F4045] bg-[#233134] px-2.5 py-1.5 text-xs font-semibold text-white hover:border-[#80EAFF] hover:text-[#80EAFF] transition cursor-pointer sm:px-3"
            >
              <LogIn className="h-3.5 w-3.5 text-[#80EAFF]" />
              <span>LMS Sign In</span>
            </button>
          )}

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              title={menuOpen ? 'Close menu' : 'Open menu'}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border transition cursor-pointer ${
                menuOpen
                  ? 'border-[#80EAFF] bg-[#153640] text-[#80EAFF]'
                  : 'border-[#2F4045] bg-[#1B2628] text-white hover:border-[#80EAFF]/60 hover:text-[#80EAFF]'
              }`}
            >
              <Menu className="h-4 w-4" />
            </button>

            <div
              className={
                menuOpen
                  ? 'absolute right-0 top-full mt-2 z-50 w-60 rounded-xl border border-[#2F4045] bg-[#141E20] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.6)] flex flex-col gap-1'
                  : 'hidden'
              }
            >
              {lmsUser && !selectedRoomZoneId && (
                <StudentReminderButton
                  user={lmsUser}
                  variant="menu-item"
                  onOpenModal={() => setMenuOpen(false)}
                />
              )}

              {lmsUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    handleStreakClick()
                  }}
                  className="flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D6E3E6] hover:bg-[#1B2628] hover:text-white transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Flame
                      className={`h-4 w-4 ${
                        streakStatus?.solvedToday
                          ? 'fill-amber-400 text-orange-400'
                          : 'text-[#6A7F84]'
                      }`}
                    />
                    <span>Daily Streak</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      streakStatus?.solvedToday
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-[#233134] text-[#9DB0B4]'
                    }`}
                  >
                    {streakStatus?.streak ?? 0}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setIsLeaderboardOpen(true)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/15 transition cursor-pointer"
              >
                <Trophy className="h-4 w-4 shrink-0" />
                <span>Leaderboard</span>
              </button>

              {lmsUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    redirectToLmsApp()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#80EAFF] hover:bg-[#153640] transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>Back to LMS</span>
                </button>
              )}

              <div className="my-1 h-px bg-[#2F4045]" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  openGuideModal()
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D6E3E6] hover:bg-[#1B2628] hover:text-[#80EAFF] transition cursor-pointer"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-[#80EAFF]" />
                <span>Quick Guide</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  void handleResetDemoUser()
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D6E3E6] hover:bg-[#1B2628] hover:text-[#80EAFF] transition cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 shrink-0 text-[#80EAFF]" />
                <span>Reset Session</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <StreakLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </header>
  )
}
