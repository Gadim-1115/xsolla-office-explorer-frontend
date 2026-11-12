import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Award,
  Calendar as CalendarIcon,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  User,
  X,
  XCircle,
} from 'lucide-react'
import type { HotspotDTO } from '../../../shared/types/api.types'
import { EXTERNAL_INTEGRATION_URLS } from '../../../shared/constants/roomScenes'
import {
  checkLmsPermission,
  fetchLmsCalendar,
  fetchLmsGrades,
  fetchLmsTasks,
  getLmsPageUrl,
  getLmsRoleLabel,
  getLmsUser,
  redirectToLmsLogin,
  type LmsCalendarEvent,
  type LmsEventKind,
  type LmsGradesData,
  type LmsStandingLevel,
  type LmsSurfaceCategory,
  type LmsTaskItem,
  type LmsTaskStatus,
} from '../../../shared/api/lmsClient'

interface LmsSurfaceModalProps {
  hotspot: HotspotDTO | null
  onClose: () => void
}

type TaskFilterTab = 'all' | 'open' | 'overdue' | 'submitted' | 'graded'

const STANDING_LABELS: Record<LmsStandingLevel, string> = {
  green: 'On track',
  yellow: 'Falling behind',
  red: 'No progress',
}

const STANDING_MEANINGS: Record<LmsStandingLevel, string> = {
  green: 'You are on track or exceeding expectations. All good, keep it up!',
  yellow: 'You are falling behind but putting in effort to catch up. Step up this week.',
  red: 'No meaningful progress was made, or no progress report was given without notice.',
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTimeRange(startsAt: string, endsAt: string, allDay?: boolean): string {
  if (allDay) return 'All day'
  const s = new Date(startsAt)
  const e = new Date(endsAt)
  if (Number.isNaN(s.getTime())) return ''
  const sStr = s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (Number.isNaN(e.getTime()) || startsAt === endsAt) return sStr
  const eStr = e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${sStr} – ${eStr}`
}

function StandingPillBadge({ level, small = false }: { level: LmsStandingLevel; small?: boolean }) {
  const styles: Record<LmsStandingLevel, string> = {
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    yellow: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    red: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider ${
        small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${styles[level]}`}
    >
      {level === 'green' && <CheckCircle2 className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      {level === 'yellow' && <Clock className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      {level === 'red' && <XCircle className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      {STANDING_LABELS[level]}
    </span>
  )
}

function TaskStatusPill({ status, lightMode = false }: { status: LmsTaskStatus; lightMode?: boolean }) {
  if (lightMode) {
    const map: Record<LmsTaskStatus, { label: string; cls: string }> = {
      overdue: { label: 'Overdue', cls: 'bg-rose-100 text-rose-700 border-rose-300' },
      open: { label: 'To do', cls: 'bg-sky-100 text-sky-800 border-sky-300' },
      submitted: { label: 'Submitted', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
      graded: { label: 'Graded', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    }
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status].cls}`}>
        {map[status].label}
      </span>
    )
  }
  const map: Record<LmsTaskStatus, { label: string; cls: string }> = {
    overdue: { label: 'Overdue', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    open: { label: 'To do', cls: 'bg-[#153640] text-[#80EAFF] border-[#80EAFF]/40' },
    submitted: { label: 'Submitted', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    graded: { label: 'Graded', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status].cls}`}>
      {map[status].label}
    </span>
  )
}

export function LmsSurfaceModal({ hotspot, onClose }: LmsSurfaceModalProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<LmsTaskItem[]>([])
  const [grades, setGrades] = useState<LmsGradesData | null>(null)
  const [events, setEvents] = useState<LmsCalendarEvent[]>([])

  const [taskFilter, setTaskFilter] = useState<TaskFilterTab>('all')
  const [deskTab, setDeskTab] = useState<'grades' | 'tasks'>('grades')
  const [eventFilter, setEventFilter] = useState<LmsEventKind | 'all'>('all')
  const [reloadTick, setReloadTick] = useState<number>(0)

  const surfaceCategory: LmsSurfaceCategory | null = useMemo(() => {
    if (!hotspot) return null
    if (hotspot.category === 'WHITEBOARD') return 'WHITEBOARD'
    if (hotspot.category === 'MONITOR') return 'MONITOR'
    if (hotspot.category === 'GRADES') return 'GRADES'
    if (hotspot.category === 'DESK') return 'DESK'
    return null
  }, [hotspot])

  useEffect(() => {
    if (!hotspot || !surfaceCategory) return
    const currentUser = getLmsUser()
    const canGrades = checkLmsPermission(currentUser, 'GRADES').allowed
    const canTasks = checkLmsPermission(currentUser, 'DESK').allowed
    setTaskFilter('all')
    setEventFilter('all')
    if (surfaceCategory === 'GRADES' && canGrades) {
      setDeskTab('grades')
    } else if (surfaceCategory === 'DESK' && canTasks) {
      setDeskTab('tasks')
    } else if (canGrades) {
      setDeskTab('grades')
    } else {
      setDeskTab('tasks')
    }
  }, [hotspot, surfaceCategory])

  useEffect(() => {
    if (!hotspot || !surfaceCategory) return

    const user = getLmsUser()
    if (!user) {
      redirectToLmsLogin(false)
      return
    }

    const checkCategory: LmsSurfaceCategory =
      surfaceCategory === 'DESK' || surfaceCategory === 'GRADES'
        ? deskTab === 'grades'
          ? 'GRADES'
          : 'DESK'
        : surfaceCategory

    const perm = checkLmsPermission(user, checkCategory)
    if (!perm.allowed) {
      setError(`This section is not available for the ${getLmsRoleLabel(user)} role.`)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const loadData = async () => {
      try {
        if (surfaceCategory === 'WHITEBOARD') {
          const t = await fetchLmsTasks()
          if (!cancelled) setTasks(t)
        } else if (surfaceCategory === 'MONITOR') {
          const ev = await fetchLmsCalendar()
          if (!cancelled) setEvents(ev)
        } else {
          if (deskTab === 'grades') {
            const g = await fetchLmsGrades()
            if (!cancelled) setGrades(g)
          } else {
            const t = await fetchLmsTasks()
            if (!cancelled) setTasks(t)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load LMS data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()
    return () => {
      cancelled = true
    }
  }, [hotspot, surfaceCategory, deskTab, reloadTick])

  if (!hotspot || !surfaceCategory) return null

  const user = getLmsUser()
  const roleLabel = getLmsRoleLabel(user)

  const filteredTasks = tasks.filter((t) => (taskFilter === 'all' ? true : t.status === taskFilter))
  const taskCounts = {
    all: tasks.length,
    open: tasks.filter((t) => t.status === 'open').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    submitted: tasks.filter((t) => t.status === 'submitted').length,
    graded: tasks.filter((t) => t.status === 'graded').length,
  }

  const filteredEvents = events.filter((e) => (eventFilter === 'all' ? true : e.kind === eventFilter))

  if (surfaceCategory === 'WHITEBOARD') {
    const lmsUrl = getLmsPageUrl('WHITEBOARD', user)
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm animate-fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex w-full max-w-5xl flex-col"
        >
          <div className="relative overflow-hidden rounded-xl border-[10px] border-[#CBD5E1] bg-[#F1F5F9] text-[#0F172A] shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_2px_10px_rgba(0,0,0,0.12)]">
            <span className="pointer-events-none absolute top-0 left-0 h-3.5 w-3.5 rounded-br bg-[#64748B]" />
            <span className="pointer-events-none absolute top-0 right-0 h-3.5 w-3.5 rounded-bl bg-[#64748B]" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 rounded-tr bg-[#64748B]" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 rounded-tl bg-[#64748B]" />

            <div
              className="relative flex max-h-[78vh] flex-col p-4 sm:p-6"
              style={{
                backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-300/80 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F172A] text-[#80EAFF] shadow">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                        {hotspot.title}
                      </h3>
                      <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Magnetic Whiteboard
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{hotspot.content}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {user && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      <User className="h-3.5 w-3.5 text-sky-600" />
                      {user.name} · <span className="text-sky-700 font-bold">{roleLabel}</span>
                    </span>
                  )}
                  <a
                    href={lmsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-bold text-[#80EAFF] hover:bg-slate-800 transition shadow-sm"
                  >
                    Open in LMS
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    title="Close Whiteboard"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      ['all', 'All Tasks', taskCounts.all],
                      ['open', 'To Do', taskCounts.open],
                      ['overdue', 'Overdue', taskCounts.overdue],
                      ['submitted', 'Submitted', taskCounts.submitted],
                      ['graded', 'Graded', taskCounts.graded],
                    ] as const
                  ).map(([key, label, count]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTaskFilter(key)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        taskFilter === key
                          ? 'bg-[#0F172A] text-white shadow'
                          : 'bg-white/90 text-slate-700 border border-slate-300 hover:bg-white'
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                          taskFilter === key ? 'bg-[#80EAFF] text-[#0F172A]' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setReloadTick((t) => t + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Sync LMS
                </button>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex h-56 items-center justify-center text-sm font-semibold text-slate-600">
                    Loading tasks from Xsolla School LMS...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-center text-sm text-rose-800">
                    {error}
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/60 p-6 text-center">
                    <p className="text-sm font-bold text-slate-700">No tasks pinned under this filter.</p>
                    <p className="mt-1 text-xs text-slate-500">Switch filters above or open the LMS course board.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 text-left">
                    {filteredTasks.map((task) => {
                      const magnetColor =
                        task.status === 'overdue'
                          ? 'bg-rose-500'
                          : task.status === 'graded'
                            ? 'bg-emerald-500'
                            : task.status === 'submitted'
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                      return (
                        <div
                          key={task.id}
                          className="relative flex flex-col justify-between rounded-lg border border-slate-300 bg-white p-4 shadow-[0_6px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition"
                        >
                          <span
                            className={`absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-white shadow ${magnetColor}`}
                          />
                          <div>
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Module {task.modulePosition} · {task.moduleTitle}
                              </span>
                              <TaskStatusPill status={task.status} lightMode />
                            </div>
                            <h4 className="mt-1.5 text-sm font-extrabold text-slate-900">{task.title}</h4>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                            {task.feedback && (
                              <p className="mt-2 rounded border-l-2 border-emerald-500 bg-emerald-50 px-2.5 py-1.5 text-[11px] italic text-emerald-900">
                                &ldquo;{task.feedback}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                            <span className="font-medium">Due {formatShortDate(task.dueAt)}</span>
                            <a
                              href={lmsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-sky-700 hover:underline"
                            >
                              View task →
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto flex h-5 w-72 items-center justify-center gap-4 rounded-b-lg border-x-4 border-b-4 border-[#94A3B8] bg-gradient-to-b from-[#CBD5E1] to-[#94A3B8] px-4 shadow-lg">
            <span className="h-2 w-12 rounded-full bg-rose-600 shadow-inner" />
            <span className="h-2 w-12 rounded-full bg-sky-600 shadow-inner" />
            <span className="h-2 w-12 rounded-full bg-slate-900 shadow-inner" />
            <span className="h-2.5 w-10 rounded-sm bg-slate-700 border border-slate-500" />
          </div>
        </div>
      </div>
    )
  }

  if (surfaceCategory === 'MONITOR') {
    const lmsCalendarUrl = getLmsPageUrl('MONITOR', user)
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex w-full max-w-5xl flex-col items-center"
        >
          <div className="w-full overflow-hidden rounded-t-2xl border-x-[14px] border-t-[16px] border-[#0E1517] bg-[#141E20] text-white shadow-[0_32px_95px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-center bg-[#0E1517] pb-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1F2E33] ring-1 ring-[#80EAFF]/40" />
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex max-h-[72vh] flex-col p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F4045] pb-3.5">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#80EAFF]/40 bg-[#153640] text-[#80EAFF]">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">{hotspot.title}</h3>
                      <span className="rounded bg-[#153640] border border-[#80EAFF]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#80EAFF]">
                        Live LMS Schedule
                      </span>
                    </div>
                    <p className="text-xs text-[#9DB0B4]">{hotspot.content}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {user && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2F4045] bg-[#233134] px-3 py-1 text-xs font-semibold text-white">
                      <User className="h-3.5 w-3.5 text-[#80EAFF]" />
                      {user.name} · <span className="text-[#80EAFF]">{roleLabel}</span>
                    </span>
                  )}
                  <a
                    href={lmsCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#80EAFF] px-3 py-1.5 text-xs font-bold text-[#0D1A1D] hover:bg-[#A6F1FF] transition"
                  >
                    Open LMS Calendar
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={EXTERNAL_INTEGRATION_URLS.WEEKLY_SCHEDULE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#2F4045] bg-[#233134] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#80EAFF] transition"
                  >
                    Google Calendar
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-[6px] border border-[#2F4045] bg-[#233134] p-1.5 text-[#9DB0B4] hover:text-white transition cursor-pointer"
                    title="Turn Off Display View"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      ['all', 'All Events', 'bg-[#80EAFF]'],
                      ['lecture', 'Lectures', 'bg-sky-400'],
                      ['meeting', 'Team Meetings', 'bg-emerald-400'],
                      ['deadline', 'Task Deadlines', 'bg-rose-400'],
                      ['off-campus', 'Off-Campus', 'bg-amber-400'],
                    ] as const
                  ).map(([kind, label, dotClass]) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setEventFilter(kind)}
                      className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        eventFilter === kind
                          ? 'bg-[#80EAFF] text-[#0D1A1D] font-bold'
                          : 'bg-[#233134] text-white border border-[#2F4045] hover:bg-[#2F4045]'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          eventFilter === kind ? 'bg-[#0D1A1D]' : dotClass
                        }`}
                      />
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setReloadTick((t) => t + 1)}
                  className="inline-flex items-center gap-1 rounded-[6px] border border-[#2F4045] bg-[#233134] px-2.5 py-1 text-xs font-semibold text-[#9DB0B4] hover:text-white cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Feed
                </button>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto pr-1 text-left">
                {loading ? (
                  <div className="flex h-56 items-center justify-center text-sm text-[#9DB0B4]">
                    Syncing schedule from Xsolla School LMS...
                  </div>
                ) : error ? (
                  <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-6 text-center text-sm text-rose-200">
                    {error}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="flex h-56 items-center justify-center rounded-lg border border-[#2F4045] bg-[#1B2628] text-sm text-[#9DB0B4]">
                    No scheduled events match this filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {filteredEvents.map((ev) => {
                      const kindBadge: Record<LmsEventKind, { label: string; cls: string }> = {
                        lecture: { label: 'Lecture', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
                        meeting: { label: 'Meeting', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                        deadline: { label: 'Deadline', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
                        'off-campus': { label: 'Off-Campus', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                      }
                      const badge = kindBadge[ev.kind]
                      return (
                        <div
                          key={ev.id}
                          className="flex flex-col justify-between rounded-lg border border-[#2F4045] bg-[#1B2628] p-4 hover:border-[#80EAFF]/50 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.cls}`}
                              >
                                {badge.label}
                              </span>
                              <span className="text-xs font-semibold text-[#80EAFF]">
                                {formatDateTime(ev.startsAt)}
                              </span>
                            </div>
                            <h4 className="mt-2 text-sm font-bold text-white">{ev.title}</h4>
                            {ev.moduleTitle && (
                              <p className="mt-0.5 text-[11px] font-semibold text-[#80EAFF]">
                                {ev.moduleTitle}
                              </p>
                            )}
                            {ev.description && (
                              <p className="mt-1 text-xs text-[#9DB0B4] line-clamp-2">{ev.description}</p>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#2F4045] pt-2.5 text-[11px] text-[#9DB0B4]">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#80EAFF]" />
                              {formatTimeRange(ev.startsAt, ev.endsAt, ev.allDay)}
                            </span>
                            {ev.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[#80EAFF]" />
                                {ev.location}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex h-8 items-center justify-between border-t border-[#1E2C30] bg-[#0B1113] px-5">
              <span className="text-[10px] font-mono tracking-widest text-[#5E7378]">HDMI-1 · 4K 60Hz</span>
              <span className="text-[11px] font-extrabold tracking-[0.28em] text-[#9DB0B4]">
                XSOLLA DISPLAY
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-[#80EAFF]">
                <span className="h-2 w-2 rounded-full bg-[#80EAFF] shadow-[0_0_8px_#80EAFF]" />
                ONLINE
              </span>
            </div>
          </div>

          <div className="h-5 w-24 bg-gradient-to-b from-[#0E1517] to-[#233134] shadow-inner" />
          <div className="h-2.5 w-64 rounded-t-lg border-t border-[#3B5157] bg-gradient-to-b from-[#2A3B3F] to-[#141E20] shadow-xl" />
        </div>
      </div>
    )
  }

  const activeCategoryForUrl: LmsSurfaceCategory = deskTab === 'grades' ? 'GRADES' : 'DESK'
  const lmsDeskUrl = getLmsPageUrl(activeCategoryForUrl, user)
  const canViewGrades = checkLmsPermission(user, 'GRADES').allowed
  const canViewTasks = checkLmsPermission(user, 'DESK').allowed

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-4xl flex-col items-center"
      >
        <div className="w-full overflow-hidden rounded-t-2xl border-x-[12px] border-t-[14px] border-[#1A2528] bg-[#141E20] text-white shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
          <div className="mx-auto flex h-3.5 w-28 items-center justify-center rounded-b-lg bg-[#0E1517]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2A3E44]" />
          </div>

          <div className="flex items-center justify-between border-b border-[#2F4045] bg-[#1B2628] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-3 w-3 rounded-full bg-rose-500 hover:bg-rose-400 transition cursor-pointer"
                title="Close Workstation"
              />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-xs font-bold text-white truncate">{hotspot.title}</span>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-[#2F4045] bg-[#141E20] p-0.5">
              {canViewGrades && (
                <button
                  type="button"
                  onClick={() => setDeskTab('grades')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition cursor-pointer ${
                    deskTab === 'grades'
                      ? 'bg-[#80EAFF] text-[#0D1A1D]'
                      : 'text-[#9DB0B4] hover:text-white'
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  Student Grades
                </button>
              )}
              {canViewTasks && (
                <button
                  type="button"
                  onClick={() => setDeskTab('tasks')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition cursor-pointer ${
                    deskTab === 'tasks'
                      ? 'bg-[#80EAFF] text-[#0D1A1D]'
                      : 'text-[#9DB0B4] hover:text-white'
                  }`}
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  LMS Tasks
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#2F4045] bg-[#233134] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  <User className="h-3 w-3 text-[#80EAFF]" />
                  {user.name} ({roleLabel})
                </span>
              )}
              <a
                href={lmsDeskUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-[6px] bg-[#80EAFF] px-2.5 py-1 text-[11px] font-bold text-[#0D1A1D] hover:bg-[#A6F1FF] transition"
              >
                Open LMS
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6 text-left">
            {loading ? (
              <div className="flex h-56 items-center justify-center text-sm text-[#9DB0B4]">
                Loading workstation data from Xsolla School LMS...
              </div>
            ) : error ? (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-6 text-center text-sm text-rose-200">
                {error}
              </div>
            ) : deskTab === 'grades' && grades ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#2F4045] bg-[#1B2628] p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#9DB0B4]">
                        {grades.mode === 'staff'
                          ? `${grades.teamName ?? 'Cohort'} Weekly Standings`
                          : 'Current Weekly Standing'}
                      </span>
                      {grades.current && <StandingPillBadge level={grades.current} />}
                    </div>
                    <p className="text-xs text-white/90">
                      {grades.mode === 'staff'
                        ? 'Weekly green / yellow / red progress ratings for students assigned to your team.'
                        : grades.current
                          ? STANDING_MEANINGS[grades.current]
                          : 'Your mentor rates your progress at the end of every week.'}
                    </p>
                    {grades.alert && (
                      <div
                        className={`mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                          grades.alert.tone === 'danger'
                            ? 'border-rose-500/40 bg-rose-500/15 text-rose-200'
                            : 'border-amber-500/40 bg-amber-500/15 text-amber-200'
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{grades.alert.text}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
                      Green: {grades.counts.green}
                    </span>
                    <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-300">
                      Yellow: {grades.counts.yellow}
                    </span>
                    <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-300">
                      Red: {grades.counts.red}
                    </span>
                  </div>
                </div>

                {grades.mode === 'staff' && grades.teamMembers ? (
                  <div className="rounded-xl border border-[#2F4045] bg-[#1B2628] p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#80EAFF] mb-3">
                      {grades.teamName} Student Standings
                    </h4>
                    {grades.teamMembers.length === 0 ? (
                      <p className="rounded-lg border border-[#2F4045] bg-[#141E20] p-4 text-xs text-[#9DB0B4]">
                        No students are assigned to your team yet in the LMS.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {grades.teamMembers.map((member) => (
                          <div
                            key={member.studentId}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2F4045] bg-[#141E20] px-3.5 py-2.5"
                          >
                            <div>
                              <p className="text-xs font-bold text-white">{member.studentName}</p>
                              <p className="text-[11px] text-[#9DB0B4]">{member.studentEmail}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {member.weeks.length === 0 ? (
                                <span className="text-[11px] text-[#9DB0B4]">No weeks rated yet</span>
                              ) : (
                                member.weeks.map((w) => (
                                  <span
                                    key={w.week}
                                    title={`Week ${w.week}: ${STANDING_LABELS[w.effective]}`}
                                    className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${
                                      w.effective === 'green'
                                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                        : w.effective === 'yellow'
                                          ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                                          : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                                    }`}
                                  >
                                    W{w.week}
                                  </span>
                                ))
                              )}
                              {member.current && <StandingPillBadge level={member.current} small />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-[#2F4045] bg-[#1B2628] p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#80EAFF] mb-2.5">
                        Week-by-Week Standing (12 Modules)
                      </h4>
                      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
                        {Array.from({ length: grades.totalWeeks }, (_, i) => {
                          const wNum = i + 1
                          const found = grades.weeks.find((w) => w.week === wNum)
                          const cls = !found
                            ? 'border-[#2F4045] bg-[#141E20] text-[#9DB0B4]'
                            : found.effective === 'green'
                              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                              : found.effective === 'yellow'
                                ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                                : 'border-rose-500/50 bg-rose-500/20 text-rose-300'
                          return (
                            <div
                              key={wNum}
                              className={`flex flex-col items-center justify-center rounded-lg border py-2 text-center ${cls}`}
                            >
                              <span className="text-[10px] font-bold">W{wNum}</span>
                              <span className="mt-0.5 text-[10px] font-extrabold uppercase">
                                {found ? found.effective : '—'}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 space-y-2">
                        {[...grades.weeks].reverse().map((w) => (
                          <div
                            key={w.week}
                            className="flex items-start justify-between gap-3 rounded-lg border border-[#2F4045] bg-[#141E20] p-3"
                          >
                            <div>
                              <p className="text-xs font-bold text-white">
                                Week {w.week} · {w.moduleTitle}
                              </p>
                              <p className="text-[11px] text-[#9DB0B4]">
                                Rated {formatShortDate(w.assessedAt)}
                              </p>
                              {w.note && (
                                <p className="mt-1 text-xs italic text-[#80EAFF]">&ldquo;{w.note}&rdquo;</p>
                              )}
                            </div>
                            <StandingPillBadge level={w.effective} small />
                          </div>
                        ))}
                      </div>
                    </div>

                    {grades.gradedTasks.length > 0 && (
                      <div className="rounded-xl border border-[#2F4045] bg-[#1B2628] p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#80EAFF] mb-2.5">
                          Recent Task Feedback
                        </h4>
                        <div className="space-y-2">
                          {grades.gradedTasks.slice(0, 4).map((t) => (
                            <div
                              key={t.id}
                              className="flex items-start justify-between gap-3 rounded-lg border border-[#2F4045] bg-[#141E20] p-3"
                            >
                              <div>
                                <p className="text-xs font-bold text-white">
                                  {t.title}{' '}
                                  <span className="font-normal text-[#9DB0B4]">
                                    · Module {t.modulePosition} ({t.moduleTitle})
                                  </span>
                                </p>
                                {t.feedback && (
                                  <p className="mt-1 text-xs italic text-emerald-300">
                                    &ldquo;{t.feedback}&rdquo;
                                  </p>
                                )}
                              </div>
                              <TaskStatusPill status="graded" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      ['all', 'All', taskCounts.all],
                      ['open', 'To Do', taskCounts.open],
                      ['overdue', 'Overdue', taskCounts.overdue],
                      ['submitted', 'Submitted', taskCounts.submitted],
                      ['graded', 'Graded', taskCounts.graded],
                    ] as const
                  ).map(([key, label, count]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTaskFilter(key)}
                      className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        taskFilter === key
                          ? 'bg-[#80EAFF] text-[#0D1A1D]'
                          : 'bg-[#233134] text-white border border-[#2F4045] hover:bg-[#2F4045]'
                      }`}
                    >
                      <span>{label}</span>
                      <span className="opacity-80">({count})</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col justify-between rounded-lg border border-[#2F4045] bg-[#1B2628] p-3.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#80EAFF]">
                            Module {t.modulePosition} · {t.moduleTitle}
                          </span>
                          <TaskStatusPill status={t.status} />
                        </div>
                        <h4 className="mt-1.5 text-sm font-bold text-white">{t.title}</h4>
                        <p className="mt-1 text-xs text-[#9DB0B4] line-clamp-2">{t.description}</p>
                        {t.feedback && (
                          <p className="mt-2 rounded border-l-2 border-emerald-400 bg-emerald-500/10 px-2 py-1 text-[11px] italic text-emerald-200">
                            &ldquo;{t.feedback}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-[#2F4045] pt-2 text-[11px] text-[#9DB0B4]">
                        <span>Due {formatShortDate(t.dueAt)}</span>
                        <a
                          href={lmsDeskUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#80EAFF] hover:underline"
                        >
                          Open in LMS →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex h-4 w-[103%] items-start justify-center rounded-b-2xl border-t border-[#3B5157] bg-gradient-to-b from-[#2A3B40] to-[#131C1E] shadow-[0_18px_40px_rgba(0,0,0,0.85)]">
          <span className="h-1.5 w-24 rounded-b-md bg-[#141E20]" />
        </div>
      </div>
    </div>
  )
}
