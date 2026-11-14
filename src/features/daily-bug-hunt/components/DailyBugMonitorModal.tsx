import { useEffect, useState } from 'react'
import {
  Bug,
  CheckCircle2,
  Flame,
  Power,
  Sparkles,
  Terminal,
  Trophy,
  X,
  AlertTriangle,
} from 'lucide-react'
import { getLmsUser, type LmsUser } from '../../../shared/api/lmsClient'
import {
  getDailyBugChallenge,
  getTodayDateKey,
} from '../../../shared/constants/dailyBugChallenges'
import {
  getUserStreakStatus,
  recordDailyBugSolved,
  STREAK_UPDATED_EVENT,
  syncUserStreakFromBackend,
  type UserStreakStatus,
} from '../api/streakService'

interface DailyBugMonitorModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenLeaderboard?: () => void
}

const GUEST_SOLVED_STORAGE_KEY = 'xsolla_explorer_guest_daily_bug_solved_date'

export function DailyBugMonitorModal({
  isOpen,
  onClose,
  onOpenLeaderboard,
}: DailyBugMonitorModalProps) {
  const todayKey = getTodayDateKey()
  const challenge = getDailyBugChallenge(todayKey)

  const [lmsUser, setLmsUser] = useState<LmsUser | null>(() => getLmsUser())
  const [streakStatus, setStreakStatus] = useState<UserStreakStatus | null>(() =>
    getUserStreakStatus(getLmsUser()),
  )
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [wrongLineAttempt, setWrongLineAttempt] = useState<number | null>(null)
  const [isSolvedSession, setIsSolvedSession] = useState<boolean>(false)
  const [justIncremented, setJustIncremented] = useState<boolean>(false)
  const [entered, setEntered] = useState<boolean>(false)

  useEffect(() => {
    if (!isOpen) {
      setEntered(false)
      return
    }
    const raf = requestAnimationFrame(() => {
      setEntered(true)
    })
    const currentUser = getLmsUser()
    setLmsUser(currentUser)
    const status = getUserStreakStatus(currentUser)
    setStreakStatus(status)
    setWrongLineAttempt(null)
    setJustIncremented(false)

    if (currentUser) {
      const alreadySolved = Boolean(status?.solvedToday)
      setIsSolvedSession(alreadySolved)
      setSelectedLine(alreadySolved ? challenge.buggyLineIndex : null)
      void syncUserStreakFromBackend(currentUser).then((synced) => {
        setStreakStatus(synced)
        if (synced?.solvedToday) {
          setIsSolvedSession(true)
          setSelectedLine(challenge.buggyLineIndex)
        }
      })
    } else {
      const guestSolvedDate = localStorage.getItem(GUEST_SOLVED_STORAGE_KEY)
      const guestSolvedToday = guestSolvedDate === todayKey
      setIsSolvedSession(guestSolvedToday)
      setSelectedLine(guestSolvedToday ? challenge.buggyLineIndex : null)
    }

    return () => cancelAnimationFrame(raf)
  }, [isOpen, todayKey, challenge.buggyLineIndex])

  useEffect(() => {
    const syncHandler = () => {
      const u = getLmsUser()
      setLmsUser(u)
      setStreakStatus(getUserStreakStatus(u))
    }
    window.addEventListener(STREAK_UPDATED_EVENT, syncHandler)
    return () => window.removeEventListener(STREAK_UPDATED_EVENT, syncHandler)
  }, [])

  if (!isOpen) return null

  const handleLineClick = async (lineIdx: number) => {
    if (isSolvedSession) return

    setSelectedLine(lineIdx)
    if (lineIdx !== challenge.buggyLineIndex) {
      setWrongLineAttempt(lineIdx)
      return
    }

    setWrongLineAttempt(null)
    setIsSolvedSession(true)

    if (lmsUser) {
      const res = await recordDailyBugSolved(lmsUser)
      setStreakStatus(res.streakStatus)
      setJustIncremented(res.incremented)
    } else {
      try {
        localStorage.setItem(GUEST_SOLVED_STORAGE_KEY, todayKey)
      } catch (err) {
        void err
      }
    }
  }

  const isLit = Boolean(lmsUser && (streakStatus?.solvedToday || isSolvedSession))
  const streakCount = streakStatus?.streak ?? 0

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center p-2 sm:p-5 transition-all duration-500 ${
        entered
          ? 'bg-[#070D0F]/85 backdrop-blur-md opacity-100'
          : 'bg-black/0 backdrop-blur-none opacity-0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative flex w-full max-w-4xl flex-col items-center transition-all duration-500 ${
          entered
            ? 'scale-100 translate-y-0 opacity-100'
            : 'scale-50 translate-y-10 opacity-0'
        }`}
      >
        <div className="relative w-full rounded-[20px] border-[10px] border-[#1B2528] bg-[#0B1315] shadow-[0_32px_90px_rgba(0,0,0,0.85),0_0_0_2px_rgba(128,234,255,0.22),0_0_60px_rgba(128,234,255,0.12)] overflow-hidden">
          <div className="flex items-center justify-center bg-[#151E21] py-1 border-b border-[#243338]">
            <span className="h-2 w-2 rounded-full bg-[#090E10] ring-1 ring-[#354950]" />
          </div>

          <div
            className="relative flex max-h-[78dvh] flex-col overflow-hidden bg-[#0D171A]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 0%, rgba(128,234,255,0.07) 0%, transparent 70%)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#223338] bg-[#122024] px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="h-4 w-[1px] bg-[#26383E]" />
                <div className="flex items-center gap-1.5 rounded bg-[#0B1417] border border-[#26383E] px-2.5 py-1 text-xs font-mono text-[#80EAFF]">
                  <Terminal className="h-3.5 w-3.5 text-[#80EAFF]" />
                  <span>{challenge.fileName}</span>
                </div>
                <span className="rounded bg-[#153640] border border-[#80EAFF]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#80EAFF]">
                  {challenge.language}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {lmsUser && (
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 ${
                      isLit
                        ? 'border-amber-400/70 bg-amber-500/20 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.28)]'
                        : 'border-[#2F4045] bg-[#1A2629] text-[#7A8E93]'
                    }`}
                    title={
                      isLit
                        ? 'Daily streak is active and lit today!'
                        : 'Solve today’s bug to light up your daily streak!'
                    }
                  >
                    <Flame
                      className={`h-4 w-4 transition-all duration-300 ${
                        isLit
                          ? 'fill-amber-400 text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.9)] animate-pulse'
                          : 'text-[#5E7277] opacity-60'
                      }`}
                    />
                    <span>{streakCount} Day Streak</span>
                    <span
                      className={`ml-0.5 rounded px-1.5 py-0.2 text-[9px] uppercase tracking-wider ${
                        isLit
                          ? 'bg-amber-400/25 text-amber-200'
                          : 'bg-[#253438] text-[#7A8E93]'
                      }`}
                    >
                      {isLit ? 'LIT' : 'UNLIT'}
                    </span>
                  </div>
                )}

                {onOpenLeaderboard && (
                  <button
                    type="button"
                    onClick={onOpenLeaderboard}
                    className="flex items-center gap-1.5 rounded-[6px] border border-[#2F4045] bg-[#1B2A2E] px-2.5 py-1 text-xs font-semibold text-[#80EAFF] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Top 10</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  title="Exit Workstation Monitor"
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#2F4045] bg-[#1B2A2E] text-[#9DB0B4] hover:border-rose-400 hover:bg-rose-500/20 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#24373D] bg-[#132226] p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-[#80EAFF]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#80EAFF]">
                      Daily Bug Hunt · Workstation OS2-3
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {challenge.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9DB0B4] leading-relaxed">
                    {challenge.description}
                  </p>
                </div>
                <div className="shrink-0 rounded-lg border border-[#2B4046] bg-[#0D181B] px-3 py-2 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8E93]">
                    Target Action
                  </p>
                  <p className="text-xs font-bold text-[#80EAFF]">
                    Click the buggy line
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#24373D] bg-[#091114] overflow-hidden shadow-inner">
                <div className="flex items-center justify-between border-b border-[#1A2A2F] bg-[#0E191D] px-4 py-2 text-[11px] font-mono text-[#7A8E93]">
                  <span>
                    {isSolvedSession
                      ? 'STATUS: PATCH VERIFIED & DEPLOYED'
                      : 'STATUS: 1 DEFECT DETECTED — CLICK A LINE TO INSPECT & PATCH'}
                  </span>
                  <span>UTF-8 · {challenge.language}</span>
                </div>

                <div className="divide-y divide-[#142227] font-mono text-xs sm:text-sm">
                  {challenge.lines.map((lineText, idx) => {
                    const isBuggyLine = idx === challenge.buggyLineIndex
                    const isFixedNow = isSolvedSession && isBuggyLine
                    const isWrongClicked = wrongLineAttempt === idx && !isSolvedSession

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isSolvedSession}
                        onClick={() => void handleLineClick(idx)}
                        className={`group flex w-full items-start gap-3 px-4 py-2.5 text-left transition-all ${
                          isFixedNow
                            ? 'bg-emerald-500/15 text-emerald-200 border-l-4 border-l-emerald-400'
                            : isWrongClicked
                              ? 'bg-rose-500/15 text-rose-200 border-l-4 border-l-rose-400'
                              : selectedLine === idx
                                ? 'bg-[#153640]/70 text-white'
                                : 'hover:bg-[#13262C] text-[#D4E4E8] cursor-pointer'
                        }`}
                      >
                        <span className="w-6 shrink-0 select-none text-right text-xs text-[#546A70] group-hover:text-[#80EAFF]">
                          {idx + 1}
                        </span>
                        <div className="flex-1 overflow-x-auto">
                          {isFixedNow ? (
                            <div className="space-y-1">
                              <div className="line-through text-rose-400/80 text-xs">
                                - {lineText}
                              </div>
                              <div className="font-semibold text-emerald-300">
                                + {challenge.fixedLine}
                              </div>
                            </div>
                          ) : (
                            <pre className="whitespace-pre font-mono">{lineText}</pre>
                          )}
                        </div>
                        {!isSolvedSession && (
                          <span className="shrink-0 rounded bg-[#16292F] px-2 py-0.5 text-[10px] font-semibold text-[#80EAFF] opacity-0 group-hover:opacity-100 transition">
                            Inspect Line
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {wrongLineAttempt !== null && !isSolvedSession && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-400/50 bg-rose-950/40 px-4 py-3 text-xs sm:text-sm text-rose-200">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold text-white">
                      Line {wrongLineAttempt + 1} is not the root cause.
                    </span>{' '}
                    Check the problem statement and inspect another line in the monitor!
                  </div>
                </div>
              )}

              {isSolvedSession && (
                <div className="rounded-xl border border-emerald-400/50 bg-emerald-950/30 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {lmsUser
                          ? justIncremented
                            ? `Daily Bug Fixed! Your Streak is Now ${streakCount} ${streakCount === 1 ? 'Day' : 'Days'}!`
                            : `Today's Bug Challenge Completed (${streakCount} Day Streak Active)`
                          : 'Congratulations! You spotted and fixed today’s bug!'}
                      </h4>
                    </div>

                    {lmsUser ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                        <Flame className="h-4 w-4 fill-amber-400 text-orange-400" />
                        <span>Streak Lit Today</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#80EAFF]/50 bg-[#153640] px-3 py-1 text-xs font-bold text-[#80EAFF]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Daily Challenge Solved</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#B8CCD0] leading-relaxed">
                    <span className="font-bold text-emerald-300">Why this fix works: </span>
                    {challenge.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#243338] bg-[#141D20] px-5 py-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#667B80]">
              XSOLLA DEVSYNC 27″ · WORKSTATION MONITOR
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] text-[#7A8E93]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                ONLINE
              </span>
              <button
                type="button"
                onClick={onClose}
                title="Power off / Exit monitor"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#2F4045] bg-[#1E2B2F] text-[#80EAFF] hover:bg-rose-500 hover:border-rose-400 hover:text-white transition cursor-pointer"
              >
                <Power className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-5 w-28 bg-gradient-to-b from-[#172124] to-[#0F1719] border-x border-[#26353A]" />
        <div className="h-2.5 w-56 rounded-t-xl bg-[#1A2528] border-t border-x border-[#2B3C42] shadow-lg" />
      </div>
    </div>
  )
}
