import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, LogIn, LogOut, RotateCcw, UserCheck } from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import {
  captureLmsSessionFromUrl,
  clearLmsSession,
  getLmsRoleLabel,
  getLmsUser,
  redirectToLmsApp,
  redirectToLmsLogin,
  type LmsUser,
} from '../../../shared/api/lmsClient'
import { XsollaLogo } from '../../../shared/ui/XsollaLogo'

export function ProgressHeader() {
  const { progress, notify, refreshMap } = useExplorer()
  const headerRef = useRef<HTMLElement>(null)
  const [lmsUser, setLmsUser] = useState<LmsUser | null>(() => {
    captureLmsSessionFromUrl()
    return getLmsUser()
  })

  useEffect(() => {
    const syncUser = () => {
      captureLmsSessionFromUrl()
      setLmsUser(getLmsUser())
    }
    syncUser()
    window.addEventListener('hashchange', syncUser)
    window.addEventListener('popstate', syncUser)
    window.addEventListener('focus', syncUser)
    return () => {
      window.removeEventListener('hashchange', syncUser)
      window.removeEventListener('popstate', syncUser)
      window.removeEventListener('focus', syncUser)
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

  const handleResetDemoUser = () => {
    localStorage.removeItem('xsolla_explorer_student_id')
    notify('success', 'New Student Session Started', 'All zones reset to initial state.')
    void refreshMap()
  }

  const handleLmsSignOut = () => {
    clearLmsSession()
    setLmsUser(null)
    notify('success', 'Signed Out of LMS', 'Opening LMS tasks, grades, or calendar now requires LMS sign-in.')
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
            <span className="hidden sm:inline">School Baku · </span>31st Floor Explorer
          </span>
        </div>

        <div className="order-3 grid w-full grid-cols-3 gap-2 xl:order-2 xl:w-auto xl:max-w-3xl xl:flex-1 xl:grid-cols-4">
          <div className={`${tileClass} hidden border-[#2F4045] bg-[#233134] xl:block`}>
            <p className={labelClass}>Xsolla</p>
            <p className="mt-0.5 text-xs font-semibold text-white truncate">
              All the things to launch, grow, and win
            </p>
          </div>

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
                <UserCheck className="h-3.5 w-3.5 text-[#80EAFF]" />
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
            title="Start fresh student session"
            aria-label="Reset Session"
            className="flex shrink-0 items-center gap-1.5 rounded-[6px] border border-[#80EAFF]/30 bg-[#145B6D] px-2.5 py-2 text-xs font-semibold text-[#80EAFF] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer sm:px-3.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Session</span>
          </button>
        </div>
      </div>
    </header>
  )
}
