export type Difficulty = 'EASY' | 'MEDIUM' | 'MEDIUM_HARD' | 'HARD'

export type ZoneStatus = 'LOCKED' | 'UNLOCKED'

export type HotspotCategory =
  | 'COFFEE_MACHINE'
  | 'FRIDGE'
  | 'DISPENSER'
  | 'PROJECTOR'
  | 'VIEWPOINT'
  | 'EASTER_EGG'
  | 'MONITOR'
  | 'DESK'
  | 'WHITEBOARD'
  | 'GRADES'
  | 'MEDKIT'
  | 'ELEVATOR'
  | 'BAR'
  | 'CABINE'
  | 'STOCK'
  | 'GAME_TABLE'
  | 'DAILY_BUG'
  | 'LEADERBOARD'

export interface APIError {
  code: string
  message: string
}

export interface APIEnvelope<T> {
  success: boolean
  data: T | null
  error: APIError | null
}

export interface HotspotDTO {
  id: string
  zone_id: string | null
  category: HotspotCategory
  x_percent: number
  y_percent: number
  title: string
  content: string
  is_claimed: boolean
}

export interface ZoneDTO {
  id: string
  name: string
  status: ZoneStatus
  difficulty: Difficulty | null
  media_url?: string
  description?: string
  hotspots: HotspotDTO[]
}

export interface ProgressDTO {
  user_id: string
  unlocked_zones_count: number
  total_locked_zones: number
  found_eggs_count: number
  total_easter_eggs: number
  completion_percentage: number
  unlocked_zone_ids: string[]
  found_egg_ids: string[]
}

export interface InitMapResponseDTO {
  zones: ZoneDTO[]
  map_hotspots: HotspotDTO[]
  progress: ProgressDTO
}

export interface CodeBlockDTO {
  id: string
  code: string
}

export interface QuestDTO {
  id: string
  zone_id: string
  zone_name: string
  difficulty: Difficulty | null
  title: string
  problem_statement: string
  code_blocks: CodeBlockDTO[]
}

export interface VerifyQuestRequestDTO {
  submitted_order: string[]
}

export interface VerifyQuestResponseDTO {
  unlocked_zone: ZoneDTO
  progress: ProgressDTO
}
