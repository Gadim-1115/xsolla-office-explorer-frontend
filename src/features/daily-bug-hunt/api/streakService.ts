import { httpRequest } from '../../../shared/api/httpClient'
import { getLmsRoleLabel, type LmsUser } from '../../../shared/api/lmsClient'
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
}

export interface UserStreakStatus {
  userId: string
  userName: string
  userRole: string
  streak: number
  solvedToday: boolean
  lastSolvedDate: string | null
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userRole: string
  streak: number
  solvedToday: boolean
  lastSolvedDate: string | null
}

const STREAK_STORAGE_KEY = 'xsolla_explorer_daily_bug_streaks_v1'
export const STREAK_UPDATED_EVENT = 'xsolla:streak-updated'

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
    map[r.userId] = r
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
    return { ...defaults, ...parsed }
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
  }
}

export function getUserStreakStatus(user: LmsUser | null): UserStreakStatus | null {
  if (!user) return null
  const userId = `lms-${user.id}`
  const map = readRecordsMap()
  const existing = map[userId]
  if (!existing) {
    return {
      userId,
      userName: user.name,
      userRole: getLmsRoleLabel(user),
      streak: 0,
      solvedToday: false,
      lastSolvedDate: null,
    }
  }
  return normalizeStreakStatus({
    ...existing,
    userName: user.name || existing.userName,
    userRole: getLmsRoleLabel(user) || existing.userRole,
  })
}

export async function syncUserStreakFromBackend(user: LmsUser | null): Promise<UserStreakStatus | null> {
  if (!user) return null
  const userId = `lms-${user.id}`
  try {
    const remote = await httpRequest<{
      user_id: string
      user_name: string
      user_role: string
      streak: number
      last_solved_date: string | null
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
      }
      writeRecordsMap(map)
      window.dispatchEvent(new CustomEvent(STREAK_UPDATED_EVENT))
    }
  } catch {
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
  const map = readRecordsMap()
  const existing = map[userId]

  if (existing && existing.lastSolvedDate === today) {
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

  try {
    const remoteRows = await httpRequest<
      {
        user_id: string
        user_name: string
        user_role: string
        streak: number
        last_solved_date: string | null
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
          }
        }
      }
      writeRecordsMap(map)
    }
  } catch (err) {
    void err
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
  }))
}
