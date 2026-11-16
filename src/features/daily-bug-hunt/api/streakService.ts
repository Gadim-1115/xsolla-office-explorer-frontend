import { httpRequest } from '../../../shared/api/httpClient'
import {
  fetchLmsDirectoryAvatars,
  fetchLmsDirectoryNames,
  fetchLmsMyProfileAvatar,
  getLmsRoleLabel,
  getLmsUser,
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
  solvedAt?: string | null
  avatarUrl?: string | null
}

export interface UserStreakStatus {
  userId: string
  userName: string
  userRole: string
  streak: number
  solvedToday: boolean
  lastSolvedDate: string | null
  solvedAt: string | null
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
  solvedAt: string | null
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
    solvedAt: record.solvedAt ?? null,
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
      solvedAt: null,
      avatarUrl: resolvedUserAvatar,
    }
  }
  if (user.name && existing.userName !== user.name) {
    existing.userName = user.name
    existing.userRole = getLmsRoleLabel(user)
    writeRecordsMap(map)
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
  const latestUser = getLmsUser() ?? user
  const latestRole = getLmsRoleLabel(latestUser)
  try {
    const remote = await httpRequest<{
      user_id: string
      user_name: string
      user_role: string
      streak: number
      last_solved_date: string | null
      solved_at?: string | null
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
      const mergedSolvedAt = remote.solved_at || local?.solvedAt || null
      const resolvedAvatar =
        liveAvatar || resolveLmsAvatarUrl(remote.avatar_url) || local?.avatarUrl || null
      map[userId] = {
        userId,
        userName: latestUser.name,
        userRole: latestRole,
        streak: mergedStreak,
        lastSolvedDate: mergedDate,
        solvedAt: mergedSolvedAt,
        avatarUrl: resolvedAvatar,
      }
      writeRecordsMap(map)

      if (
        mergedStreak > 0 &&
        mergedDate &&
        (remote.user_name !== latestUser.name || remote.user_role !== latestRole)
      ) {
        void httpRequest('/explorer/streak/complete', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            user_name: latestUser.name,
            user_role: latestRole,
            date_key: mergedDate,
            avatar_url: resolvedAvatar,
          }),
        }).catch(() => undefined)
      }

      window.dispatchEvent(new CustomEvent(STREAK_UPDATED_EVENT))
    }
  } catch {
    if (liveAvatar) {
      const map = readRecordsMap()
      if (map[userId]) {
        map[userId] = { ...map[userId], userName: latestUser.name, avatarUrl: liveAvatar }
        writeRecordsMap(map)
      }
    }
    return getUserStreakStatus(latestUser)
  }
  return getUserStreakStatus(latestUser)
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
    const nameChanged = existing.userName !== user.name
    const avatarChanged = Boolean(liveAvatar && existing.avatarUrl !== liveAvatar)
    if (nameChanged || avatarChanged) {
      existing.userName = user.name
      existing.userRole = userRole
      if (liveAvatar) existing.avatarUrl = liveAvatar
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
  const solvedAtIso = new Date().toISOString()
  const nextRecord: UserStreakRecord = {
    userId,
    userName: user.name,
    userRole,
    streak: prevStreak + 1,
    lastSolvedDate: today,
    solvedAt: solvedAtIso,
    avatarUrl: liveAvatar || existing?.avatarUrl || null,
  }

  map[userId] = nextRecord
  writeRecordsMap(map)

  try {
    const saved = await httpRequest<{ solved_at?: string | null }>('/explorer/streak/complete', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        user_name: user.name,
        user_role: userRole,
        date_key: today,
        avatar_url: nextRecord.avatarUrl,
      }),
    })
    if (saved?.solved_at) {
      nextRecord.solvedAt = saved.solved_at
      map[userId] = nextRecord
      writeRecordsMap(map)
    }
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
  const [directoryAvatars, directoryNames] = await Promise.all([
    fetchLmsDirectoryAvatars().catch(() => ({} as Record<string, string>)),
    fetchLmsDirectoryNames().catch(() => ({} as Record<string, string>)),
  ])
  const currentUser = getLmsUser()
  const currentUserId = currentUser ? `lms-${currentUser.id}` : null

  try {
    const remoteRows = await httpRequest<
      {
        user_id: string
        user_name: string
        user_role: string
        streak: number
        last_solved_date: string | null
        solved_at?: string | null
        avatar_url?: string | null
      }[]
    >('/explorer/leaderboard')
    if (Array.isArray(remoteRows)) {
      for (const row of remoteRows) {
        if (!row.user_id || row.user_id.startsWith('seed-')) continue
        const local = map[row.user_id]
        const isCurrentUser = Boolean(currentUser && row.user_id === currentUserId)
        const latestName =
          (isCurrentUser ? currentUser?.name : directoryNames[row.user_id]) ||
          row.user_name ||
          local?.userName ||
          'Student'
        const latestRole =
          (isCurrentUser && currentUser ? getLmsRoleLabel(currentUser) : row.user_role) ||
          local?.userRole ||
          'Student'

        if (!local || row.streak >= local.streak) {
          map[row.user_id] = {
            userId: row.user_id,
            userName: latestName,
            userRole: latestRole,
            streak: row.streak,
            lastSolvedDate: row.last_solved_date,
            solvedAt: row.solved_at || local?.solvedAt || null,
            avatarUrl: resolveLmsAvatarUrl(row.avatar_url) || local?.avatarUrl || null,
          }
        }

        if (isCurrentUser && currentUser && row.user_name !== currentUser.name && row.last_solved_date) {
          void httpRequest('/explorer/streak/complete', {
            method: 'POST',
            body: JSON.stringify({
              user_id: row.user_id,
              user_name: currentUser.name,
              user_role: latestRole,
              date_key: row.last_solved_date,
              avatar_url: map[row.user_id]?.avatarUrl ?? null,
            }),
          }).catch(() => undefined)
        }
      }
      writeRecordsMap(map)
    }
  } catch (err) {
    void err
  }

  for (const [id, rec] of Object.entries(map)) {
    const isCurrentUser = Boolean(currentUser && id === currentUserId)
    const updatedName =
      (isCurrentUser ? currentUser?.name : directoryNames[id]) || rec.userName
    const updatedRole =
      isCurrentUser && currentUser ? getLmsRoleLabel(currentUser) : rec.userRole
    const byId = directoryAvatars[id]
    const byName = updatedName ? directoryAvatars[updatedName.trim().toLowerCase()] : undefined
    const lmsAvatar = byId || byName
    map[id] = {
      ...rec,
      userName: updatedName,
      userRole: updatedRole,
      ...(lmsAvatar ? { avatarUrl: lmsAvatar } : {}),
    }
  }
  writeRecordsMap(map)

  const normalized = Object.values(map)
    .map(normalizeStreakStatus)
    .filter((entry) => entry.streak > 0)
    .sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak
      if (a.solvedToday !== b.solvedToday) return a.solvedToday ? -1 : 1
      if (a.lastSolvedDate !== b.lastSolvedDate) {
        return (b.lastSolvedDate || '').localeCompare(a.lastSolvedDate || '')
      }
      const timeA = a.solvedAt ? Date.parse(a.solvedAt) : Number.MAX_SAFE_INTEGER
      const timeB = b.solvedAt ? Date.parse(b.solvedAt) : Number.MAX_SAFE_INTEGER
      if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
        return timeA - timeB
      }
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
    solvedAt: entry.solvedAt,
    avatarUrl: entry.avatarUrl,
  }))
}
