import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle,
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  X,
} from 'lucide-react'
import {
  fetchLiveStudentReminders,
  isLmsStudent,
  redirectToLmsApp,
  type LmsStudentRemindersData,
  type LmsUser,
} from '../../../shared/api/lmsClient'

interface StudentReminderButtonProps {
  user: LmsUser | null
}

function formatDueRemaining(isoDate?: string | null): {
  label: string
  isOverdue: boolean
  isUrgent: boolean
} {
  if (!isoDate) {
    return { label: 'Open', isOverdue: false, isUrgent: false }
  }
  const diffMs = new Date(isoDate).getTime() - Date.now()
  const diffHours = Math.round(diffMs / 3_600_000)
  if (diffMs < 0) {
    const overdueDays = Math.max(1, Math.ceil(Math.abs(diffMs) / 86_400_000))
    return {
      label: `${overdueDays}d overdue`,
      isOverdue: true,
      isUrgent: true,
    }
  }
  if (diffHours < 24) {
    return {
      label: `${Math.max(1, diffHours)}h left`,
      isOverdue: false,
      isUrgent: true,
    }
  }
  const days = Math.ceil(diffMs / 86_400_000)
  return {
    label: `${days} ${days === 1 ? 'day' : 'days'} left`,
    isOverdue: false,
    isUrgent: days <= 3,
  }
}

export function StudentReminderButton({ user }: StudentReminderButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [data, setData] = useState<LmsStudentRemindersData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const isStudent = Boolean(user && isLmsStudent(user))

  const loadReminders = async () => {
    if (!user || !isLmsStudent(user)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchLiveStudentReminders()
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live LMS reminders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isStudent) {
      setData(null)
      setIsOpen(false)
      return
    }
    void loadReminders()
  }, [isStudent, user?.id])

  if (!user || !isStudent) {
    return null
  }

  const actionableCount =
    (data?.pendingTasks.length ?? 0) + (data?.openQuizzes.length ?? 0)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          void loadReminders()
        }}
        title="Open Student LMS Reminders"
        aria-label="Open Student LMS Reminders"
        className={`group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border transition cursor-pointer ${
          actionableCount > 0
            ? 'border-rose-500/80 bg-rose-500/15 text-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.28)] hover:bg-rose-500 hover:text-white'
            : 'border-[#2F4045] bg-[#1D2A2D] text-[#9DB0B4] hover:border-[#80EAFF]/60 hover:text-[#80EAFF]'
        }`}
      >
        {actionableCount > 0 ? (
          <BellRing className="h-4 w-4 transition-transform group-hover:scale-110" />
        ) : (
          <Bell className="h-4 w-4 transition-transform group-hover:scale-110" />
        )}
        {actionableCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-[#141E20] bg-rose-500 px-1 text-[10px] font-extrabold leading-none text-white shadow-sm">
            {actionableCount > 9 ? '9+' : actionableCount}
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[85dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-rose-500/40 bg-[#1B2628] shadow-[0_28px_80px_rgba(0,0,0,0.7)]"
            >
              <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-400 to-[#80EAFF]" />

              <div className="flex items-center justify-between border-b border-[#2F4045] bg-[#141E20] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/50 bg-rose-500/15 text-rose-400">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      Student Daily Briefing · Live LMS
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {user.name}’s Active Reminders
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void loadReminders()}
                    title="Refresh live LMS data"
                    className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#2F4045] bg-[#233134] text-[#9DB0B4] hover:border-[#80EAFF] hover:text-[#80EAFF] transition cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#2F4045] bg-[#233134] text-[#9DB0B4] hover:bg-rose-500 hover:text-white transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {loading && !data ? (
                  <div className="py-12 text-center text-xs text-[#9DB0B4]">
                    Fetching live assignments, quizzes, and schedule from LMS...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-xs text-rose-200">
                    {error}
                  </div>
                ) : !data?.isLiveConnected ? (
                  <div className="rounded-xl border border-amber-400/40 bg-amber-950/25 p-4 text-xs text-amber-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Live LMS Backend Connection Required</span>
                    </div>
                    <p className="text-[#B8CCD0] leading-relaxed">
                      {data?.summaryText ||
                        'Sign in through the live LMS server to view your real-time assignments and quizzes.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-[#80EAFF]/40 bg-[#153640]/80 p-4">
                      <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                        {data.summaryText}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#80EAFF]">
                          <ClipboardList className="h-3.5 w-3.5" />
                          Pending Assignments ({data.pendingTasks.length})
                        </span>
                      </div>

                      {data.pendingTasks.length === 0 ? (
                        <div className="flex items-center gap-2 rounded-xl border border-[#2F4045] bg-[#233134]/60 px-4 py-3 text-xs text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>All open module assignments have been submitted.</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {data.pendingTasks.map((task) => {
                            const dueInfo = formatDueRemaining(task.dueAt)
                            return (
                              <div
                                key={task.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-[#2F4045] bg-[#233134] px-4 py-3"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-xs sm:text-sm font-bold text-white">
                                    {task.title}
                                  </p>
                                  <p className="truncate text-[11px] text-[#9DB0B4]">
                                    Module {task.modulePosition} · {task.moduleTitle}
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                                    dueInfo.isOverdue
                                      ? 'border-rose-400/60 bg-rose-500/20 text-rose-300'
                                      : dueInfo.isUrgent
                                        ? 'border-amber-400/60 bg-amber-500/20 text-amber-300'
                                        : 'border-[#80EAFF]/40 bg-[#153640] text-[#80EAFF]'
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  {dueInfo.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#80EAFF]">
                          <HelpCircle className="h-3.5 w-3.5" />
                          Open Quizzes ({data.openQuizzes.length})
                        </span>
                      </div>

                      {data.openQuizzes.length === 0 ? (
                        <div className="flex items-center gap-2 rounded-xl border border-[#2F4045] bg-[#233134]/60 px-4 py-3 text-xs text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>No unattempted ready quizzes in your open modules.</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {data.openQuizzes.map((quiz) => {
                            const dueInfo = formatDueRemaining(quiz.dueAt)
                            return (
                              <div
                                key={quiz.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-[#2F4045] bg-[#233134] px-4 py-3"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-xs sm:text-sm font-bold text-white">
                                    {quiz.title}
                                  </p>
                                  <p className="truncate text-[11px] text-[#9DB0B4]">
                                    Module {quiz.modulePosition} · {quiz.moduleTitle}
                                    {quiz.questionCount > 0
                                      ? ` · ${quiz.questionCount} questions`
                                      : ''}
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                                    dueInfo.isOverdue
                                      ? 'border-rose-400/60 bg-rose-500/20 text-rose-300'
                                      : dueInfo.isUrgent
                                        ? 'border-amber-400/60 bg-amber-500/20 text-amber-300'
                                        : 'border-[#80EAFF]/40 bg-[#153640] text-[#80EAFF]'
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  {dueInfo.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {data.upcomingEvents.length > 0 && (
                      <div className="space-y-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#80EAFF]">
                          <Calendar className="h-3.5 w-3.5" />
                          Upcoming This Week ({data.upcomingEvents.length})
                        </span>
                        <div className="space-y-2">
                          {data.upcomingEvents.slice(0, 4).map((ev) => (
                            <div
                              key={ev.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-[#2F4045] bg-[#233134] px-4 py-2.5"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-white">
                                  {ev.title}
                                </p>
                                <p className="truncate text-[11px] text-[#9DB0B4]">
                                  {new Date(ev.startsAt).toLocaleString([], {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {ev.location ? ` · ${ev.location}` : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[#2F4045] bg-[#141E20] px-5 py-3">
                <span className="text-[11px] text-[#9DB0B4]">
                  Synced directly from your live LMS student account
                </span>
                <button
                  type="button"
                  onClick={() => redirectToLmsApp()}
                  className="flex items-center gap-1.5 rounded-[6px] bg-[#80EAFF] px-3.5 py-1.5 text-xs font-bold text-[#0D1A1D] hover:bg-[#A6F1FF] transition cursor-pointer"
                >
                  <span>Open in LMS</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
