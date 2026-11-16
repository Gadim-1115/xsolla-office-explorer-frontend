import type { APIEnvelope } from '../types/api.types'
import {
  captureLmsSessionFromUrl,
  getLmsUser,
  syncExplorerUuidWithLmsUser,
} from './lmsClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const STORAGE_USER_ID_KEY = 'xsolla_explorer_student_id'
const LMS_UUID_PREFIX = '00000000-0000-0000-'

function getOrCreateStudentId(): string {
  captureLmsSessionFromUrl()
  const lmsUser = getLmsUser()
  if (lmsUser) {
    syncExplorerUuidWithLmsUser(lmsUser)
    const synced = localStorage.getItem(STORAGE_USER_ID_KEY)
    if (synced) return synced
  }

  const existing = localStorage.getItem(STORAGE_USER_ID_KEY)
  if (existing && !existing.startsWith(LMS_UUID_PREFIX)) {
    return existing
  }

  const generated = crypto.randomUUID
    ? crypto.randomUUID()
    : `10000000-0000-4000-8000-${Math.floor(Math.random() * 0xffffffffffff)
        .toString(16)
        .padStart(12, '0')}`
  localStorage.setItem(STORAGE_USER_ID_KEY, generated)
  return generated
}

export class APIClientError extends Error {
  public readonly code: string
  public readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'APIClientError'
    this.code = code
    this.status = status
  }
}

export async function httpRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('X-User-ID', getOrCreateStudentId())

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const envelope = (await response.json()) as APIEnvelope<T>

  if (!response.ok || !envelope.success || envelope.data === null) {
    const code = envelope.error?.code || 'UNKNOWN_ERROR'
    const message = envelope.error?.message || 'Request failed'
    throw new APIClientError(code, message, response.status)
  }

  return envelope.data
}
