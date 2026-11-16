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

function readRecordsMap(): Record<string, UserStreakRecord> {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as Record<string, UserStreakRecord>
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }
    const cleaned: Record<string, UserStreakRecord> = {}
    let hadSeeds = false
    for (const [key, val] of Object.entries(parsed)) {
      if (key.startsWith('seed-') || val?.userId?.startsWith('seed-')) {
        hadSeeds = true
        continue
      }
      if (val && typeof val === 'object' && val.userId) {
        cleaned[key] = val
      }
    }
    if (hadSeeds) {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(cleaned))
    }
    return cleaned
  } catch {
    return {}
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
        if (!row.user_id || row.user_id.startsWith('seed-')) continue
        const local = map[row.user_id]
        if (!local || row.streak >= local.streak) {
          map[row.user_id] = {
            userId: row.user_id,
            userName: row.user_name,
            userRole: row.user_role || 'Student',
            streak: row.streak,
            lastSolvedDate: row.last_solved_date,
            avatarUrl: resolveLmsAvatarUrl(row.avatar_url) || local?.avatarUrl || null,
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
