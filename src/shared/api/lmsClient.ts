export type LmsRole = 'student' | 'mentor' | 'lecturer' | 'admin'

export interface LmsUser {
  id: number
  name: string
  email: string
  roles: LmsRole[]
  roleUntil?: Partial<Record<LmsRole, string>>
}

export interface LmsTokens {
  accessToken: string
  refreshToken: string
}

export type LmsTaskStatus = 'overdue' | 'open' | 'submitted' | 'graded'

export interface LmsTaskItem {
  id: string
  moduleId: string
  modulePosition: number
  moduleTitle: string
  title: string
  description: string
  dueAt: string
  status: LmsTaskStatus
  submittedAt?: string
  gradedAt?: string
  feedback?: string
}

export type LmsStandingLevel = 'green' | 'yellow' | 'red'

export interface LmsWeekStanding {
  week: number
  moduleTitle: string
  level: LmsStandingLevel
  effective: LmsStandingLevel
  escalated: boolean
  assessedAt: string
  note?: string
}

export interface LmsTeamMemberStanding {
  studentId: number
  studentName: string
  studentEmail: string
  current: LmsStandingLevel | null
  weeks: LmsWeekStanding[]
}

export interface LmsGradesData {
  mode: 'student' | 'staff'
  current: LmsStandingLevel | null
  counts: { green: number; yellow: number; red: number; total: number }
  alert: { tone: 'warning' | 'danger'; text: string } | null
  totalWeeks: number
  weeks: LmsWeekStanding[]
  gradedTasks: LmsTaskItem[]
  teamName?: string
  teamMembers?: LmsTeamMemberStanding[]
}

export type LmsEventKind = 'lecture' | 'meeting' | 'off-campus' | 'deadline'

export interface LmsCalendarEvent {
  id: string
  title: string
  kind: LmsEventKind
  startsAt: string
  endsAt: string
  allDay?: boolean
  location?: string
  meetingUrl?: string
  description?: string
  moduleTitle?: string
}

const USER_STORAGE_KEY = 'auth_user'
const TOKENS_STORAGE_KEY = 'auth_tokens'
const LMS_ORIGIN_KEY = 'lms_origin'
const LMS_API_URL_KEY = 'lms_api_url'
const EXPLORER_USER_ID_KEY = 'xsolla_explorer_student_id'

const KNOWN_ROLES: readonly LmsRole[] = ['student', 'mentor', 'lecturer', 'admin']

function normalizeRoles(raw: unknown): LmsRole[] {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : []
  const out = new Set<LmsRole>()
  for (const r of list) {
    if (typeof r !== 'string') continue
    const name = r.trim().toLowerCase()
    if (name === 'teacher') {
      out.add('mentor')
      out.add('lecturer')
    } else if ((KNOWN_ROLES as readonly string[]).includes(name)) {
      out.add(name as LmsRole)
    }
  }
  if (out.size > 1) out.delete('student')
  return out.size > 0 ? KNOWN_ROLES.filter((r) => out.has(r)) : ['student']
}

function normalizeUser(raw: unknown): LmsUser | null {
  if (!raw || typeof raw !== 'object') return null
  const u = raw as Partial<LmsUser> & { role?: unknown }
  if (typeof u.id !== 'number' && typeof u.id !== 'string') return null
  const roleUntil: Partial<Record<LmsRole, string>> = {}
  if (u.roleUntil && typeof u.roleUntil === 'object') {
    for (const [role, val] of Object.entries(u.roleUntil as Record<string, unknown>)) {
      if ((KNOWN_ROLES as readonly string[]).includes(role) && typeof val === 'string' && !Number.isNaN(Date.parse(val))) {
        roleUntil[role as LmsRole] = val
      }
    }
  }
  return {
    id: Number(u.id),
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    roles: normalizeRoles(u.roles ?? u.role),
    ...(Object.keys(roleUntil).length > 0 ? { roleUntil } : {}),
  }
}

export function syncExplorerUuidWithLmsUser(user: LmsUser | null): void {
  try {
    if (!user) return
    const num = Math.max(1, Math.abs(Number(user.id) || 1))
    const hex = num.toString(16).padStart(12, '0').slice(-12)
    localStorage.setItem(EXPLORER_USER_ID_KEY, `00000000-0000-0000-0000-${hex}`)
  } catch {
    return
  }
}

export function captureLmsSessionFromUrl(): void {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
    const rawSession = hashParams.get('lms_session') || url.searchParams.get('lms_session')
    if (!rawSession) return

    const decoded = JSON.parse(decodeURIComponent(atob(rawSession))) as {
      user?: unknown
      tokens?: unknown
      origin?: string
      apiUrl?: string
      standings?: unknown
      courseEdits?: unknown
      eventEdits?: unknown
      submissions?: unknown
    }

    const normalized = normalizeUser(decoded.user)
    if (normalized) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized))
      syncExplorerUuidWithLmsUser(normalized)
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }

    if (
      decoded.tokens &&
      typeof decoded.tokens === 'object' &&
      typeof (decoded.tokens as LmsTokens).accessToken === 'string'
    ) {
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(decoded.tokens))
    }

    if (typeof decoded.origin === 'string' && decoded.origin.trim()) {
      localStorage.setItem(LMS_ORIGIN_KEY, decoded.origin.trim().replace(/\/+$/, ''))
    }

    if (typeof decoded.apiUrl === 'string') {
      if (decoded.apiUrl.trim()) {
        localStorage.setItem(LMS_API_URL_KEY, decoded.apiUrl.trim().replace(/\/+$/, ''))
      } else {
        localStorage.removeItem(LMS_API_URL_KEY)
      }
    }

    if (decoded.standings && typeof decoded.standings === 'object') {
      localStorage.setItem('standings', JSON.stringify(decoded.standings))
    }
    if (decoded.courseEdits && typeof decoded.courseEdits === 'object') {
      localStorage.setItem('course_edits', JSON.stringify(decoded.courseEdits))
    }
    if (decoded.eventEdits && typeof decoded.eventEdits === 'object') {
      localStorage.setItem('event_edits', JSON.stringify(decoded.eventEdits))
    }
    if (decoded.submissions && typeof decoded.submissions === 'object') {
      localStorage.setItem('submissions', JSON.stringify(decoded.submissions))
    }

    url.searchParams.delete('lms_session')
    hashParams.delete('lms_session')
    const nextHash = hashParams.toString()
    window.history.replaceState({}, '', url.pathname + url.search + (nextHash ? `#${nextHash}` : ''))
  } catch {
    return
  }
}

captureLmsSessionFromUrl()

export function getLmsUser(): LmsUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? normalizeUser(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function getLmsTokens(): LmsTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LmsTokens>
    if (typeof parsed.accessToken === 'string' && typeof parsed.refreshToken === 'string') {
      return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken }
    }
    return null
  } catch {
    return null
  }
}

export function clearLmsSession(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKENS_STORAGE_KEY)
  } catch {
    return
  }
}

export function getLmsOrigin(): string {
  const envOrigin = (import.meta.env.VITE_LMS_APP_URL as string | undefined)?.trim()
  if (envOrigin) return envOrigin.replace(/\/+$/, '')
  try {
    const stored = localStorage.getItem(LMS_ORIGIN_KEY)
    if (stored && stored.trim()) return stored.trim().replace(/\/+$/, '')
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    if (window.location.port === '5174') return 'http://localhost:5173'
    if (window.location.port === '5173') return 'http://localhost:5174'
  }
  return 'http://localhost:5173'
}

export function getLmsApiUrl(): string {
  const envApi = (import.meta.env.VITE_LMS_API_URL as string | undefined)?.trim()
  if (envApi) return envApi.replace(/\/+$/, '')
  try {
    const stored = localStorage.getItem(LMS_API_URL_KEY)
    if (stored && stored.trim()) return stored.trim().replace(/\/+$/, '')
  } catch {
    // ignore
  }
  return ''
}

export function hasLmsRole(user: LmsUser | null | undefined, role: LmsRole, now: Date = new Date()): boolean {
  if (!user || !user.roles.includes(role)) return false
  const until = user.roleUntil?.[role]
  return !until || new Date(until) > now
}

export const isLmsStudent = (user: LmsUser | null | undefined) => hasLmsRole(user, 'student')
export const isLmsAdmin = (user: LmsUser | null | undefined) => hasLmsRole(user, 'admin')
export const canLmsMentor = (user: LmsUser | null | undefined) => hasLmsRole(user, 'mentor')
export const canLmsAuthor = (user: LmsUser | null | undefined) =>
  hasLmsRole(user, 'lecturer') || hasLmsRole(user, 'admin')

export function getLmsRoleLabel(user: LmsUser | null | undefined): string {
  if (!user) return 'Guest'
  if (isLmsAdmin(user)) return 'Admin'
  if (canLmsMentor(user) && hasLmsRole(user, 'lecturer')) return 'Mentor & Lecturer'
  if (canLmsMentor(user)) return 'Mentor'
  if (hasLmsRole(user, 'lecturer')) return 'Lecturer'
  if (isLmsStudent(user)) return 'Student'
  return 'Guest'
}

export type LmsSurfaceCategory = 'WHITEBOARD' | 'DESK' | 'GRADES' | 'MONITOR'

export function checkLmsPermission(
  user: LmsUser | null | undefined,
  category: LmsSurfaceCategory,
  now: Date = new Date(),
): { allowed: boolean; reason?: 'unauthenticated' | 'forbidden' } {
  if (!user) {
    return { allowed: false, reason: 'unauthenticated' }
  }
  const hasAnyActiveRole = KNOWN_ROLES.some((r) => hasLmsRole(user, r, now))
  if (!hasAnyActiveRole) {
    return { allowed: false, reason: 'forbidden' }
  }

  if (category === 'WHITEBOARD' || category === 'DESK') {
    const allowed = isLmsStudent(user) || canLmsAuthor(user)
    return allowed ? { allowed: true } : { allowed: false, reason: 'forbidden' }
  }

  if (category === 'GRADES') {
    const allowed = isLmsStudent(user) || canLmsMentor(user) || isLmsAdmin(user)
    return allowed ? { allowed: true } : { allowed: false, reason: 'forbidden' }
  }

  if (category === 'MONITOR') {
    return { allowed: true }
  }

  return { allowed: false, reason: 'forbidden' }
}

export function getLmsLoginUrl(clearExisting = false): string {
  if (clearExisting) {
    clearLmsSession()
  }
  const origin = getLmsOrigin()
  const returnTo =
    typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : ''
  return returnTo
    ? `${origin}/login?returnTo=${encodeURIComponent(returnTo)}`
    : `${origin}/login`
}

export function redirectToLmsLogin(clearExisting = false): void {
  const target = getLmsLoginUrl(clearExisting)
  window.location.assign(target)
}

export function getLmsPageUrl(category: LmsSurfaceCategory, user: LmsUser | null): string {
  const origin = getLmsOrigin()
  if (!user) return getLmsLoginUrl()
  if (category === 'MONITOR') {
    return isLmsAdmin(user) ? `${origin}/admin/calendar` : `${origin}/calendar`
  }
  if (category === 'GRADES') {
    if (isLmsAdmin(user)) return `${origin}/admin/students`
    if (canLmsMentor(user)) return `${origin}/grading`
    return `${origin}/grades`
  }
  if (isLmsAdmin(user)) return `${origin}/admin/modules`
  if (canLmsAuthor(user)) return `${origin}/courses`
  return `${origin}/tasks`
}

async function lmsAuthedRequest<T>(path: string): Promise<T> {
  const apiUrl = getLmsApiUrl()
  const tokens = getLmsTokens()
  if (!apiUrl || !tokens?.accessToken) {
    throw new Error('NO_LMS_BACKEND')
  }

  const doFetch = async (accessToken: string) =>
    fetch(`${apiUrl}${path}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

  let res = await doFetch(tokens.accessToken)

  if (res.status === 401 && tokens.refreshToken) {
    const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh_token: tokens.refreshToken }),
    })
    if (refreshRes.ok) {
      const nextTokens = (await refreshRes.json()) as { access_token: string; refresh_token: string }
      const saved: LmsTokens = {
        accessToken: nextTokens.access_token,
        refreshToken: nextTokens.refresh_token,
      }
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(saved))
      res = await doFetch(saved.accessToken)
    } else {
      redirectToLmsLogin(true)
      throw new Error('LMS session expired. Redirecting to Sign In...')
    }
  }

  if (res.status === 401 || res.status === 403) {
    redirectToLmsLogin(true)
    throw new Error('Unauthorized LMS access. Redirecting to Sign In...')
  }

  if (!res.ok) {
    throw new Error(`LMS API error (${res.status})`)
  }

  return (await res.json()) as T
}

const DAY_MS = 86_400_000
const isoOffset = (now: Date, days: number) => new Date(now.getTime() + days * DAY_MS).toISOString()
const dayAt = (now: Date, days: number, h = 0, m = 0) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, h, m).toISOString()

const MODULE_TITLES = [
  'Onboarding & Git',
  'Web Fundamentals',
  'JavaScript',
  'TypeScript',
  'React',
  'Go Basics',
  'Databases & SQL',
  'REST APIs',
  'Docker',
  'Testing',
  'CI/CD',
  'Capstone',
]

const MODULE_TASKS: string[][] = [
  ['Git workflow', 'Team setup'],
  ['Landing page', 'CSS layout kata'],
  ['Algorithms set', 'DOM project', 'Async quiz-task'],
  ['Typed utils', 'Migrate a module'],
  ['Components', 'State management', 'Routing app'],
  ['CLI tool', 'HTTP server'],
  ['Schema design', 'Query practice'],
  ['API design', 'Auth service'],
  ['Dockerise an app', 'Compose stack'],
  ['Unit tests', 'E2E tests'],
  ['Pipeline', 'Deploy'],
  ['MVP', 'Final demo'],
]

const DEMO_FEEDBACK = [
  'Clean structure. Watch naming and add edge-case tests.',
  'Good progress - the error handling needs more care.',
  'Nice work, readable and well organised.',
  'Solid solution. Try to split the larger functions.',
]

function computeTaskStatus(
  dueAt: string,
  submission: { submittedAt?: string; gradedAt?: string; feedback?: string } | undefined,
  now: Date,
): LmsTaskStatus {
  if (submission) {
    if (submission.gradedAt || submission.feedback) return 'graded'
    return 'submitted'
  }
  return new Date(dueAt).getTime() < now.getTime() ? 'overdue' : 'open'
}

function buildFallbackTasks(user: LmsUser, now: Date = new Date()): LmsTaskItem[] {
  const currentIdx = 5
  const isStaffUser = !isLmsStudent(user)

  let storedSubmissions: Record<string, {
    assignmentId: string
    studentId: number
    submittedAt: string
    feedback?: string
    gradedAt?: string
    commentedAt?: string
  }> = {}

  try {
    const raw = localStorage.getItem('submissions')
    if (raw) storedSubmissions = JSON.parse(raw)
  } catch {
    storedSubmissions = {}
  }

  let courseEdits: {
    modules?: Record<string, { title?: string; opensAt?: string }>
    items?: Record<string, {
      id: string
      moduleId: string
      type: string
      title: string
      description?: string
      dueAt?: string
    } | null>
    deletedModules?: string[]
  } = {}

  try {
    const raw = localStorage.getItem('course_edits')
    if (raw) courseEdits = JSON.parse(raw)
  } catch {
    courseEdits = {}
  }

  const deletedSet = new Set(courseEdits.deletedModules ?? [])
  const out: LmsTaskItem[] = []

  MODULE_TITLES.forEach((defaultTitle, idx) => {
    const moduleId = `m${idx + 1}`
    if (deletedSet.has(moduleId)) return
    const weekOffset = (idx - currentIdx) * 7
    const opensAt = courseEdits.modules?.[moduleId]?.opensAt ?? dayAt(now, weekOffset)
    if (!isStaffUser && new Date(opensAt) > now) return

    const moduleTitle = courseEdits.modules?.[moduleId]?.title ?? defaultTitle

    MODULE_TASKS[idx].forEach((taskTitle, t) => {
      const itemId = `${moduleId}-a${t + 1}`
      const edited = courseEdits.items?.[itemId]
      if (edited === null) return

      const dueDays = weekOffset + 2 + t * 2
      const dueAt = edited?.dueAt ?? dayAt(now, dueDays, 18)
      const finalTitle = edited?.title ?? taskTitle
      const finalDesc =
        edited?.description ?? `Complete the "${finalTitle}" task for the ${moduleTitle} module.`

      let submission: { submittedAt: string; gradedAt?: string; feedback?: string } | undefined

      const customSub = storedSubmissions[`${itemId}:${user.id}`]
      if (customSub) {
        submission = {
          submittedAt: customSub.submittedAt,
          gradedAt: customSub.gradedAt ?? customSub.commentedAt,
          feedback: customSub.feedback,
        }
      } else if (!isStaffUser) {
        if (idx < currentIdx) {
          const isOverdueDemo = idx === 3 && t === 1
          if (!isOverdueDemo) {
            const gradedRecently = idx >= currentIdx - 2
            submission = {
              submittedAt: isoOffset(now, dueDays - 1),
              feedback: gradedRecently ? DEMO_FEEDBACK[(idx + t) % DEMO_FEEDBACK.length] : undefined,
              gradedAt: isoOffset(now, dueDays + (gradedRecently ? 1 : 0)),
            }
          }
        } else if (idx === currentIdx && t === 0) {
          submission = { submittedAt: isoOffset(now, -1) }
        }
      }

      const status = computeTaskStatus(dueAt, submission, now)
      out.push({
        id: itemId,
        moduleId,
        modulePosition: idx + 1,
        moduleTitle,
        title: finalTitle,
        description: finalDesc,
        dueAt,
        status,
        submittedAt: submission?.submittedAt,
        gradedAt: submission?.gradedAt,
        feedback: submission?.feedback,
      })
    })
  })

  const priority: Record<LmsTaskStatus, number> = { overdue: 0, open: 1, submitted: 2, graded: 3 }
  return out.sort((a, b) => {
    const p = priority[a.status] - priority[b.status]
    if (p !== 0) return p
    const cmp = a.dueAt.localeCompare(b.dueAt)
    return priority[a.status] <= 1 ? cmp : -cmp
  })
}

export async function fetchLmsTasks(): Promise<LmsTaskItem[]> {
  const user = getLmsUser()
  const perm = checkLmsPermission(user, 'WHITEBOARD')
  if (!perm.allowed || !user) {
    redirectToLmsLogin(perm.reason === 'forbidden')
    throw new Error('Redirecting to LMS Sign In...')
  }

  const now = new Date()
  if (getLmsApiUrl() && getLmsTokens()?.accessToken) {
    interface ApiModule {
      id: number
      title: string
      position: number
      opens_at?: string | null
    }
    interface ApiContentItem {
      id: number
      module_id: number
      type: string
      title: string
      body?: string
      due_at?: string | null
    }
    interface ApiSubmission {
      submitted_at?: string
      created_at?: string
      graded_at?: string | null
      feedback?: string | null
    }

    const modules = await lmsAuthedRequest<ApiModule[]>('/modules')
    const sorted = [...modules].sort((a, b) => a.position - b.position)
    const isStudent = isLmsStudent(user)
    const visible = isStudent
      ? sorted.filter((m) => !m.opens_at || new Date(m.opens_at) <= now)
      : sorted

    const allTasks: LmsTaskItem[] = []
    await Promise.all(
      visible.map(async (m) => {
        const items = await lmsAuthedRequest<ApiContentItem[]>(`/modules/${m.id}/content-items`)
        const assignments = items.filter((i) => i.type === 'assignment')
        await Promise.all(
          assignments.map(async (a) => {
            let sub: { submittedAt?: string; gradedAt?: string; feedback?: string } | undefined
            if (isStudent) {
              try {
                const s = await lmsAuthedRequest<ApiSubmission>(
                  `/modules/${m.id}/content-items/${a.id}/submissions/me`,
                )
                sub = {
                  submittedAt: s.submitted_at ?? s.created_at,
                  gradedAt: s.graded_at ?? undefined,
                  feedback: s.feedback ?? undefined,
                }
              } catch {
                sub = undefined
              }
            }
            const dueAt = a.due_at ?? dayAt(now, 7, 18)
            allTasks.push({
              id: String(a.id),
              moduleId: String(m.id),
              modulePosition: m.position,
              moduleTitle: m.title,
              title: a.title,
              description: a.body?.trim() || `Assignment for Module ${m.position}: ${m.title}`,
              dueAt,
              status: computeTaskStatus(dueAt, sub, now),
              submittedAt: sub?.submittedAt,
              gradedAt: sub?.gradedAt,
              feedback: sub?.feedback,
            })
          }),
        )
      }),
    )

    const priority: Record<LmsTaskStatus, number> = { overdue: 0, open: 1, submitted: 2, graded: 3 }
    return allTasks.sort((a, b) => {
      const p = priority[a.status] - priority[b.status]
      if (p !== 0) return p
      return a.dueAt.localeCompare(b.dueAt)
    })
  }

  return buildFallbackTasks(user, now)
}

function analyseWeeks(
  rawWeeks: { week: number; level: LmsStandingLevel; assessedAt: string; note?: string }[],
): {
  weeks: LmsWeekStanding[]
  current: LmsStandingLevel | null
  counts: { green: number; yellow: number; red: number; total: number }
  alert: { tone: 'warning' | 'danger'; text: string } | null
} {
  const byWeek = new Map<number, { week: number; level: LmsStandingLevel; assessedAt: string; note?: string }>()
  for (const r of rawWeeks) byWeek.set(r.week, r)
  const ordered = [...byWeek.values()].sort((a, b) => a.week - b.week)

  const weeks: LmsWeekStanding[] = []
  const counts = { green: 0, yellow: 0, red: 0, total: 0 }
  let yellowRun = 0
  let redRun = 0
  let previous: number | null = null

  for (const r of ordered) {
    if (previous === null || r.week !== previous + 1) {
      yellowRun = 0
      redRun = 0
    }
    previous = r.week

    let effective: LmsStandingLevel = r.level
    let escalated = false

    if (r.level === 'green') {
      yellowRun = 0
      redRun = 0
    } else if (r.level === 'yellow') {
      redRun = 0
      yellowRun += 1
      if (yellowRun >= 4) {
        effective = 'red'
        escalated = true
        yellowRun = 0
        redRun = 1
      }
    } else {
      yellowRun = 0
      redRun += 1
    }

    counts[effective] += 1
    counts.total += 1
    weeks.push({
      week: r.week,
      moduleTitle: MODULE_TITLES[r.week - 1] ?? `Module ${r.week}`,
      level: r.level,
      effective,
      escalated,
      assessedAt: r.assessedAt,
      note: r.note,
    })
  }

  let alert: { tone: 'warning' | 'danger'; text: string } | null = null
  if (redRun >= 2) {
    alert = {
      tone: 'danger',
      text: '2 red weeks in a row mean removal from the program. Please talk to your mentor.',
    }
  } else if (redRun === 1) {
    const last = weeks[weeks.length - 1]
    alert = {
      tone: 'danger',
      text: `${last?.escalated ? '4 yellow weeks in a row count as red. ' : ''}One more red week in a row means removal from the program.`,
    }
  } else if (yellowRun >= 1) {
    const left = 4 - yellowRun
    alert = {
      tone: 'warning',
      text:
        left === 1
          ? `${yellowRun} yellow weeks in a row. One more yellow week counts as red. You have to step up.`
          : `${yellowRun} yellow ${yellowRun === 1 ? 'week' : 'weeks'} in a row. At 4 in a row it counts as red.`,
    }
  }

  return {
    weeks,
    current: weeks.length > 0 ? weeks[weeks.length - 1].effective : null,
    counts,
    alert,
  }
}

export async function fetchLmsGrades(): Promise<LmsGradesData> {
  const user = getLmsUser()
  const perm = checkLmsPermission(user, 'GRADES')
  if (!perm.allowed || !user) {
    redirectToLmsLogin(perm.reason === 'forbidden')
    throw new Error('Redirecting to LMS Sign In...')
  }

  const now = new Date()
  const tasks = await fetchLmsTasks().catch(() => buildFallbackTasks(user, now))
  const gradedTasks = tasks.filter((t) => t.status === 'graded')

  if (getLmsApiUrl() && getLmsTokens()?.accessToken) {
    interface ApiModule {
      id: number
      title: string
      position: number
    }
    interface ApiEnrollment {
      user_id: number
      grade?: string | null
      created_at: string
    }

    const modules = await lmsAuthedRequest<ApiModule[]>('/modules')
    const sorted = [...modules].sort((a, b) => a.position - b.position)

    if (isLmsStudent(user)) {
      const rawWeeks: { week: number; level: LmsStandingLevel; assessedAt: string }[] = []
      await Promise.all(
        sorted.map(async (m) => {
          const enrollments = await lmsAuthedRequest<ApiEnrollment[]>(`/modules/${m.id}/enrollments`)
          const mine = enrollments.find((e) => e.user_id === user.id)
          const g = mine?.grade?.toLowerCase()
          if (g === 'green' || g === 'yellow' || g === 'red') {
            rawWeeks.push({
              week: m.position,
              level: g,
              assessedAt: mine?.created_at ?? now.toISOString(),
            })
          }
        }),
      )
      const analysed = analyseWeeks(rawWeeks)
      return {
        mode: 'student',
        current: analysed.current,
        counts: analysed.counts,
        alert: analysed.alert,
        totalWeeks: sorted.length || 12,
        weeks: analysed.weeks,
        gradedTasks,
      }
    }
  }

  const defaultSamWeeks: { week: number; level: LmsStandingLevel; assessedAt: string; note?: string }[] = [
    { week: 1, level: 'green', assessedAt: dayAt(now, -28), note: 'Great start. Setup done and you reported on time.' },
    { week: 2, level: 'red', assessedAt: dayAt(now, -21), note: 'No progress report this week. Please tell me in advance if you are away.' },
    { week: 3, level: 'green', assessedAt: dayAt(now, -14), note: 'Back on track, well done.' },
    { week: 4, level: 'yellow', assessedAt: dayAt(now, -7), note: 'Behind on the tasks, but you are catching up.' },
    { week: 5, level: 'yellow', assessedAt: dayAt(now, -1) },
  ]

  let storedStandings: Record<
    string,
    { week: number; level: LmsStandingLevel; assessedAt: string; note?: string; studentId: number }
  > | null = null

  try {
    const raw = localStorage.getItem('standings')
    if (raw) storedStandings = JSON.parse(raw)
  } catch {
    storedStandings = null
  }

  if (!isLmsStudent(user)) {
    const team3Members = [
      { id: 1, name: 'Sam Student', email: 'student@xsolla.school' },
      { id: 101, name: 'Leyla Hasanova', email: 'leyla.hasanova@example.com' },
      { id: 102, name: 'Murad Guliyev', email: 'murad.guliyev@example.com' },
      { id: 103, name: 'Nigar Ismayilova', email: 'nigar.ismayilova@example.com' },
      { id: 104, name: 'Tural Karimov', email: 'tural.karimov@example.com' },
    ]
    const team4Members = [
      { id: 111, name: 'Aynur Babayeva', email: 'aynur.babayeva@example.com' },
      { id: 112, name: 'Kamran Rzayev', email: 'kamran.rzayev@example.com' },
      { id: 113, name: 'Sabina Valiyeva', email: 'sabina.valiyeva@example.com' },
      { id: 114, name: 'Orkhan Mustafayev', email: 'orkhan.mustafayev@example.com' },
      { id: 115, name: 'Gunel Ahmadova', email: 'gunel.ahmadova@example.com' },
    ]
    const othersPattern: LmsStandingLevel[][] = [
      ['green', 'green', 'green', 'green'],
      ['green', 'yellow', 'yellow', 'yellow'],
      ['yellow', 'green', 'green', 'green'],
      ['green', 'green', 'red', 'green'],
      ['green', 'yellow', 'green', 'yellow'],
    ]

    const isTeam3Mentor = user.id === 900 || isLmsAdmin(user)
    const roster = isTeam3Mentor ? team3Members : team4Members
    const teamName = isTeam3Mentor ? 'Team 3' : 'Team 4'

    const teamMembers: LmsTeamMemberStanding[] = roster.map((member, idx) => {
      let rawMemberWeeks: { week: number; level: LmsStandingLevel; assessedAt: string; note?: string }[] = []
      if (storedStandings) {
        rawMemberWeeks = Object.values(storedStandings).filter((s) => s.studentId === member.id)
      }
      if (rawMemberWeeks.length === 0) {
        if (member.id === 1) {
          rawMemberWeeks = defaultSamWeeks
        } else {
          rawMemberWeeks = othersPattern[idx % othersPattern.length].map((lvl, wi) => ({
            week: wi + 1,
            level: lvl,
            assessedAt: dayAt(now, (wi - 5) * 7),
          }))
        }
      }
      const analysed = analyseWeeks(rawMemberWeeks)
      return {
        studentId: member.id,
        studentName: member.name,
        studentEmail: member.email,
        current: analysed.current,
        weeks: analysed.weeks,
      }
    })

    const combinedCounts = { green: 0, yellow: 0, red: 0, total: 0 }
    for (const m of teamMembers) {
      if (m.current) {
        combinedCounts[m.current] += 1
        combinedCounts.total += 1
      }
    }

    const samAnalysed = analyseWeeks(defaultSamWeeks)
    return {
      mode: 'staff',
      current: 'green',
      counts: combinedCounts,
      alert: null,
      totalWeeks: 12,
      weeks: samAnalysed.weeks,
      gradedTasks,
      teamName,
      teamMembers,
    }
  }

  let studentRawWeeks: { week: number; level: LmsStandingLevel; assessedAt: string; note?: string }[] =
    storedStandings
      ? Object.values(storedStandings).filter((s) => s.studentId === user.id)
      : []
  if (studentRawWeeks.length === 0) {
    studentRawWeeks = defaultSamWeeks
  }

  const analysed = analyseWeeks(studentRawWeeks)
  return {
    mode: 'student',
    current: analysed.current,
    counts: analysed.counts,
    alert: analysed.alert,
    totalWeeks: 12,
    weeks: analysed.weeks,
    gradedTasks,
  }
}

export async function fetchLmsCalendar(): Promise<LmsCalendarEvent[]> {
  const user = getLmsUser()
  const perm = checkLmsPermission(user, 'MONITOR')
  if (!perm.allowed || !user) {
    redirectToLmsLogin(perm.reason === 'forbidden')
    throw new Error('Redirecting to LMS Sign In...')
  }

  const now = new Date()
  const tasks = await fetchLmsTasks().catch(() => buildFallbackTasks(user, now))
  const deadlineItems: LmsCalendarEvent[] = tasks.map((t) => ({
    id: `deadline-${t.id}`,
    title: `Due: ${t.title}`,
    kind: 'deadline',
    startsAt: t.dueAt,
    endsAt: t.dueAt,
    moduleTitle: `Module ${t.modulePosition} · ${t.moduleTitle}`,
    description: t.description,
  }))

  if (getLmsApiUrl() && getLmsTokens()?.accessToken) {
    interface ApiEvent {
      id: number
      title: string
      description?: string
      starts_at: string
      ends_at: string
      type?: string | null
      location?: string
      meeting_url?: string
    }
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const to = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59).toISOString()
    const apiEvents = await lmsAuthedRequest<ApiEvent[]>(
      `/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    )
    const mapped: LmsCalendarEvent[] = apiEvents.map((e) => ({
      id: String(e.id),
      title: e.title,
      kind: e.type === 'meeting' || e.type === 'off-campus' ? e.type : 'lecture',
      startsAt: e.starts_at,
      endsAt: e.ends_at,
      location: e.location || undefined,
      meetingUrl: e.meeting_url || undefined,
      description: e.description || undefined,
    }))
    return [...mapped, ...deadlineItems].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  }

  const mondayOffset = -((now.getDay() + 6) % 7)
  const baseEvents: LmsCalendarEvent[] = []

  for (let week = -1; week <= 3; week++) {
    const modIdx = Math.min(11, Math.max(0, 5 + week))
    baseEvents.push({
      id: `lec-${week}`,
      title: `Lecture · ${MODULE_TITLES[modIdx]}`,
      kind: 'lecture',
      startsAt: dayAt(now, mondayOffset + week * 7, 10, 0),
      endsAt: dayAt(now, mondayOffset + week * 7, 12, 0),
      location: 'Session Hall (31st Floor)',
      description: `Weekly live lecture for Module ${modIdx + 1}: ${MODULE_TITLES[modIdx]}.`,
    })
  }

  baseEvents.push(
    {
      id: 'team-1',
      title: 'Team Sync & Sprint Standup',
      kind: 'meeting',
      startsAt: dayAt(now, mondayOffset + 4, 14, 0),
      endsAt: dayAt(now, mondayOffset + 4, 14, 45),
      location: 'Meeting Room 9 / Online',
      description: 'Weekly sync with your mentor and team about current module deliverables.',
    },
    {
      id: 'off-1',
      title: 'Off-Campus Activity Day',
      kind: 'off-campus',
      startsAt: dayAt(now, mondayOffset + 11, 0, 0),
      endsAt: dayAt(now, mondayOffset + 11, 23, 59),
      allDay: true,
      location: 'Off-Campus',
      description: 'No classes — Xsolla School off-site team activity.',
    },
  )

  try {
    const rawEdits = localStorage.getItem('event_edits')
    if (rawEdits) {
      const edits = JSON.parse(rawEdits) as Record<string, LmsCalendarEvent | null>
      const merged: LmsCalendarEvent[] = []
      const seen = new Set<string>()
      for (const ev of baseEvents) {
        seen.add(ev.id)
        const edited = edits[ev.id]
        if (edited === null) continue
        merged.push(edited ?? ev)
      }
      for (const [id, edited] of Object.entries(edits)) {
        if (edited && !seen.has(id)) merged.push(edited)
      }
      return [...merged, ...deadlineItems].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    }
  } catch {
    // ignore
  }

  return [...baseEvents, ...deadlineItems].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}
