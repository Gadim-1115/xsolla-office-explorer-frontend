import { httpRequest } from '../../../shared/api/httpClient'
import {
  fetchLmsDirectoryAvatars,
  fetchLmsMyProfileAvatar,
  getLmsRoleLabel,
  resolveLmsAvatarUrl,
  type LmsUser,
} from '../../../shared/api/lmsClient'
import {
  getTodayDateKey,
  getYesterdayDateKey,
} from '../../../shared/constants/dailyBugChallenges'

export interface UserStreakRecord {
  userId: string
  userName: string
  userRole: string
  streak: number
  lastSolvedDate: string | null
  avatarUrl?: string | null
}

export interface UserStreakStatus {
  userId: string
  userName: string
  userRole: string
  streak: number
  solvedToday: boolean
  lastSolvedDate: string | null
  avatarUrl: string | null
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userRole: string
  streak: number
  solvedToday: boolean
  lastSolvedDate: string | null
  avatarUrl: string | null
}

const STREAK_STORAGE_KEY = 'xsolla_explorer_daily_bug_streaks_v1'
export const STREAK_UPDATED_EVENT = 'xsolla:streak-updated'

function makePortraitDataUri(name: string, bgHex: string, shirtHex: string, hairHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="${bgHex}"/><circle cx="60" cy="48" r="22" fill="#F8FAFC"/><path d="M24 114c4-24 20-34 36-34s32 10 36 34" fill="${shirtHex}"/><path d="M54 80h12l-3 18h-6z" fill="#80EAFF"/><path d="M38 44c0-16 10-25 23-25 12 0 21 8 21 23-5-5-11-7-20-6-9 1-17 5-24 8z" fill="${hairHex}"/><title>${name}</title></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function getDefaultCohortAvatar(userId: string, userName: string): string {
  const palette: Record<string, [string, string, string]> = {
    'seed-101': ['#163B45', '#0D2228', '#1E293B'],
    'seed-102': ['#1E3A5F', '#0F172A', '#0F172A'],
    'seed-103': ['#2A244D', '#161233', '#312E81'],
    'seed-104': ['#143832', '#0B211D', '#134E4A'],
    'seed-111': ['#3B233A', '#1F1120', '#4C1D95'],
    'seed-112': ['#1C3545', '#0E1D26', '#1E293B'],
    'seed-113': ['#243B2E', '#112018', '#14532D'],
    'seed-114': ['#362B1E', '#1E170F', '#451A03'],
    'seed-115': ['#1E2F4D', '#101A2E', '#1E3A8A'],
    'seed-116': ['#2D263E', '#171324', '#3B0764'],
  }
  const colors = palette[userId] ?? ['#153640', '#0D1A1D', '#1E293B']
  return makePortraitDataUri(userName, colors[0], colors[1], colors[2])
}

function buildDefaultCohortRecords(): Record<string, UserStreakRecord> {
  const today = getTodayDateKey()
  const yesterday = getYesterdayDateKey()
  const records: UserStreakRecord[] = [
    { userId: 'seed-101', userName: 'Leyla Hasanova', userRole: 'Student', streak: 14, lastSolvedDate: today },
    { userId: 'seed-102', userName: 'Murad Guliyev', userRole: 'Student', streak: 12, lastSolvedDate: today },
    { userId: 'seed-103', userName: 'Nigar Ismayilova', userRole: 'Student', streak: 11, lastSolvedDate: yesterday },
    { userId: 'seed-104', userName: 'Tural Karimov', userRole: 'Student', streak: 9, lastSolvedDate: today },
    { userId: 'seed-111', userName: 'Aynur Babayeva', userRole: 'Student', streak: 8, lastSolvedDate: today },
    { userId: 'seed-112', userName: 'Kamran Rzayev', userRole: 'Student', streak: 7, lastSolvedDate: yesterday },
    { userId: 'seed-113', userName: 'Sabina Valiyeva', userRole: 'Student', streak: 6, lastSolvedDate: today },
    { userId: 'seed-114', userName: 'Orkhan Mustafayev', userRole: 'Student', streak: 5, lastSolvedDate: yesterday },
    { userId: 'seed-115', userName: 'Gunel Ahmadova', userRole: 'Student', streak: 4, lastSolvedDate: today },
    { userId: 'seed-116', userName: 'Farid Mammadov', userRole: 'Student', streak: 3, lastSolvedDate: yesterday },
  ]
  const map: Record<string, UserStreakRecord> = {}
  for (const r of records) {
    map[r.userId] = {
      ...r,
      avatarUrl: getDefaultCohortAvatar(r.userId, r.userName),
    }
  }
  return map
}

function readRecordsMap(): Record<string, UserStreakRecord> {
  const defaults = buildDefaultCohortRecords()
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(defaults))
      return defaults
    }
    const parsed = JSON.parse(raw) as Record<string, UserStreakRecord>
    if (!parsed || typeof parsed !== 'object') {
      return defaults
    }
    const merged: Record<string, UserStreakRecord> = { ...defaults, ...parsed }
    for (const [key, val] of Object.entries(merged)) {
      if (!val.avatarUrl && defaults[key]?.avatarUrl) {
        merged[key] = { ...val, avatarUrl: defaults[key].avatarUrl }
      }
    }
    return merged
  } catch {
    return defaults
  }
}

function writeRecordsMap(map: Record<string, UserStreakRecord>): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(map))
  } catch {
    return
  }
}

export function normalizeStreakStatus(record: UserStreakRecord): UserStreakStatus {
  const today = getTodayDateKey()
  const yesterday = getYesterdayDateKey()
  const solvedToday = record.lastSolvedDate === today
  const isStreakAlive = solvedToday || record.lastSolvedDate === yesterday
  return {
    userId: record.userId,
    userName: record.userName,
    userRole: record.userRole,
    streak: isStreakAlive ? Math.max(0, record.streak) : 0,
    solvedToday,
    lastSolvedDate: record.lastSolvedDate,
    avatarUrl: resolveLmsAvatarUrl(record.avatarUrl) ?? record.avatarUrl ?? null,
  }
}

export function getUserStreakStatus(user: LmsUser | null): UserStreakStatus | null {
  if (!user) return null
  const userId = `lms-${user.id}`
  const map = readRecordsMap()
  const existing = map[userId]
  const resolvedUserAvatar = resolveLmsAvatarUrl(user.avatarUrl)
  if (!existing) {
    return {
      userId,
      userName: user.name,
      userRole: getLmsRoleLabel(user),
      streak: 0,
      solvedToday: false,
      lastSolvedDate: null,
      avatarUrl: resolvedUserAvatar,
    }
  }
  return normalizeStreakStatus({
    ...existing,
    userName: user.name || existing.userName,
    userRole: getLmsRoleLabel(user) || existing.userRole,
    avatarUrl: resolvedUserAvatar || existing.avatarUrl || null,
  })
}

export async function syncUserStreakFromBackend(user: LmsUser | null): Promise<UserStreakStatus | null> {
  if (!user) return null
  const userId = `lms-${user.id}`
  const liveAvatar = await fetchLmsMyProfileAvatar().catch(() => resolveLmsAvatarUrl(user.avatarUrl))
  try {
    const remote = await httpRequest<{
      user_id: string
      user_name: string
      user_role: string
      streak: number
      last_solved_date: string | null
      avatar_url?: string | null
    }>(`/explorer/streak?user_id=${encodeURIComponent(userId)}`)
    if (remote && typeof remote.streak === 'number') {
      const map = readRecordsMap()
      const local = map[userId]
      const mergedStreak = local ? Math.max(local.streak, remote.streak) : remote.streak
      const mergedDate =
        local?.lastSolvedDate && remote.last_solved_date
          ? local.lastSolvedDate > remote.last_solved_date
            ? local.lastSolvedDate
            : remote.last_solved_date
          : local?.lastSolvedDate || remote.last_solved_date || null
      map[userId] = {
        userId,
        userName: user.name,
        userRole: getLmsRoleLabel(user),
        streak: mergedStreak,
        lastSolvedDate: mergedDate,
        avatarUrl: liveAvatar || resolveLmsAvatarUrl(remote.avatar_url) || local?.avatarUrl || null,
      }
      writeRecordsMap(map)
      window.dispatchEvent(new CustomEvent(STREAK_UPDATED_EVENT))
    }
  } catch {
    if (liveAvatar) {
      const map = readRecordsMap()
      if (map[userId]) {
        map[userId] = { ...map[userId], avatarUrl: liveAvatar }
        writeRecordsMap(map)
      }
    }
    return getUserStreakStatus(user)
  }
  return getUserStreakStatus(user)
}

export async function recordDailyBugSolved(user: LmsUser | null): Promise<{
  isGuest: boolean
  streakStatus: UserStreakStatus | null
  incremented: boolean
}> {
  if (!user) {
    return {
      isGuest: true,
      streakStatus: null,
      incremented: false,
    }
  }

  const today = getTodayDateKey()
  const yesterday = getYesterdayDateKey()
  const userId = `lms-${user.id}`
  const userRole = getLmsRoleLabel(user)
  const liveAvatar = await fetchLmsMyProfileAvatar().catch(() => resolveLmsAvatarUrl(user.avatarUrl))
  const map = readRecordsMap()
  const existing = map[userId]

  if (existing && existing.lastSolvedDate === today) {
    if (liveAvatar && existing.avatarUrl !== liveAvatar) {
      existing.avatarUrl = liveAvatar
      writeRecordsMap(map)
    }
    return {
      isGuest: false,
      streakStatus: normalizeStreakStatus(existing),
      incremented: false,
    }
  }

  const prevStreak =
    existing && existing.lastSolvedDate === yesterday ? Math.max(0, existing.streak) : 0
  const nextRecord: UserStreakRecord = {
    userId,
    userName: user.name,
    userRole,
    streak: prevStreak + 1,
    lastSolvedDate: today,
    avatarUrl: liveAvatar || existing?.avatarUrl || null,
  }

  map[userId] = nextRecord
  writeRecordsMap(map)

  try {
    await httpRequest('/explorer/streak/complete', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        user_name: user.name,
        user_role: userRole,
        date_key: today,
        avatar_url: nextRecord.avatarUrl,
      }),
    })
  } catch (err) {
    void err
  }

  const status = normalizeStreakStatus(nextRecord)
  window.dispatchEvent(new CustomEvent(STREAK_UPDATED_EVENT))

  return {
    isGuest: false,
    streakStatus: status,
    incremented: true,
  }
}

export async function fetchStreakLeaderboard(): Promise<LeaderboardEntry[]> {
  const map = readRecordsMap()
  const directoryAvatars = await fetchLmsDirectoryAvatars().catch(() => ({} as Record<string, string>))

  try {
    const remoteRows = await httpRequest<
      {
        user_id: string
        user_name: string
        user_role: string
        streak: number
        last_solved_date: string | null
        avatar_url?: string | null
      }[]
    >('/explorer/leaderboard')
    if (Array.isArray(remoteRows)) {
      for (const row of remoteRows) {
        if (!row.user_id) continue
        const local = map[row.user_id]
        if (!local || row.streak >= local.streak) {
          map[row.user_id] = {
            userId: row.user_id,
            userName: row.user_name,
            userRole: row.user_role || 'Student',
            streak: row.streak,
            lastSolvedDate: row.last_solved_date,
            avatarUrl:
              resolveLmsAvatarUrl(row.avatar_url) ||
              local?.avatarUrl ||
              getDefaultCohortAvatar(row.user_id, row.user_name),
          }
        }
      }
      writeRecordsMap(map)
    }
  } catch (err) {
    void err
  }

  for (const [id, rec] of Object.entries(map)) {
    const byId = directoryAvatars[id]
    const byName = rec.userName ? directoryAvatars[rec.userName.trim().toLowerCase()] : undefined
    const lmsAvatar = byId || byName
    if (lmsAvatar) {
      map[id] = { ...rec, avatarUrl: lmsAvatar }
    } else if (!rec.avatarUrl) {
      map[id] = { ...rec, avatarUrl: getDefaultCohortAvatar(id, rec.userName) }
    }
  }

  const normalized = Object.values(map)
    .map(normalizeStreakStatus)
    .filter((entry) => entry.streak > 0)
    .sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak
      if (a.solvedToday !== b.solvedToday) return a.solvedToday ? -1 : 1
      return a.userName.localeCompare(b.userName)
    })
    .slice(0, 10)

  return normalized.map((entry, idx) => ({
    rank: idx + 1,
    userId: entry.userId,
    userName: entry.userName,
    userRole: entry.userRole,
    streak: entry.streak,
    solvedToday: entry.solvedToday,
    lastSolvedDate: entry.lastSolvedDate,
    avatarUrl: entry.avatarUrl,
  }))
}
