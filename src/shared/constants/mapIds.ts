export const MAP_ZONE_IDS = {
  GAMEROOM_1: 'zone_gameroom_1',
  GAMEROOM_2: 'zone_gameroom_2',
  GAMEROOM_3: 'zone_gameroom_3',
  GAMEROOM_4: 'zone_gameroom_4',
  MEETING_1: 'zone_meeting_1',
  MEETING_2: 'zone_meeting_2',
  MEETING_3: 'zone_meeting_3',
  MEETING_4: 'zone_meeting_4',
  MEETING_5: 'zone_meeting_5',
  MEETING_6: 'zone_meeting_6',
  MEETING_7: 'zone_meeting_7',
  MEETING_8: 'zone_meeting_8',
  MEETING_9: 'zone_meeting_9',
  MEETING_10: 'zone_meeting_10',
  MEETING_11: 'zone_meeting_11',
  OPEN_SPACE_1: 'zone_lecturezone_open_space_1',
  OPEN_SPACE_2: 'zone_open_space_2',
  SESSION: 'zone_session',
  KITCHEN: 'zone_kitchen',
  STOCK: 'zone_stock',
} as const

export type MapZoneId = (typeof MAP_ZONE_IDS)[keyof typeof MAP_ZONE_IDS]

export interface ZoneLabelPosition {
  cx: number
  cy: number
  shortLabel: string
}

export const ZONE_LABEL_POSITIONS: Record<string, ZoneLabelPosition> = {
  zone_gameroom_1: { cx: 553, cy: 442, shortLabel: 'GR 1 · Board Games' },
  zone_gameroom_2: { cx: 621, cy: 355, shortLabel: 'GR 2 · Foosball' },
  zone_gameroom_3: { cx: 732, cy: 282, shortLabel: 'GR 3 · Table Tennis' },
  zone_gameroom_4: { cx: 843, cy: 240, shortLabel: 'GR 4 · PlayStation' },
  zone_meeting_1: { cx: 1198, cy: 290, shortLabel: 'M1' },
  zone_meeting_2: { cx: 1406, cy: 496, shortLabel: 'M2' },
  zone_meeting_3: { cx: 1418, cy: 575, shortLabel: 'M3' },
  zone_meeting_4: { cx: 1408, cy: 655, shortLabel: 'M4' },
  zone_meeting_5: { cx: 602, cy: 722, shortLabel: 'M5' },
  zone_meeting_6: { cx: 528, cy: 658, shortLabel: 'M6' },
  zone_meeting_7: { cx: 512, cy: 572, shortLabel: 'M7' },
  zone_meeting_8: { cx: 518, cy: 508, shortLabel: 'M8' },
  zone_meeting_9: { cx: 1022, cy: 719, shortLabel: 'M9' },
  zone_meeting_10: { cx: 903, cy: 719, shortLabel: 'M10' },
  zone_meeting_11: { cx: 1342, cy: 708, shortLabel: 'M11' },
  zone_lecturezone_open_space_1: { cx: 975, cy: 335, shortLabel: 'Open Space 1 (School)' },
  zone_open_space_2: { cx: 980, cy: 815, shortLabel: 'Open Space 2 (Staff)' },
  zone_session: { cx: 1292, cy: 396, shortLabel: 'Session Hall' },
  zone_kitchen: { cx: 1275, cy: 560, shortLabel: 'Kitchen' },
  zone_stock: { cx: 1275, cy: 483, shortLabel: 'Stock' },
}

export interface ElevatorEntrancePin {
  id: string
  label: string
  x_percent: number
  y_percent: number
  targetZoneId: string
  targetSceneId?: string
}

export const ELEVATOR_ENTRANCES: ElevatorEntrancePin[] = [
  {
    id: 'elevator_entrance_1',
    label: 'Elevator Entrance 1',
    x_percent: 51.8,
    y_percent: 38.8,
    targetZoneId: 'zone_lecturezone_open_space_1',
    targetSceneId: 'zone_lift_1',
  },
  {
    id: 'elevator_entrance_2',
    label: 'Elevator Entrance 2',
    x_percent: 51.8,
    y_percent: 62.2,
    targetZoneId: 'zone_open_space_2',
    targetSceneId: 'zone_lift_2',
  },
]
