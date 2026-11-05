import type { HotspotDTO } from '../types/api.types'

export interface RoomSceneConfig {
  id: string
  label: string
  imageUrl: string
  is360?: boolean
  hotspots?: HotspotDTO[]
}

export const ROOM_SCENES_REGISTRY: Record<string, RoomSceneConfig[]> = {
  zone_lecturezone_open_space_1: [
    {
      id: 'open_space_1_main',
      label: 'Angle 1 · Main 360° Panorama',
      imageUrl: '/assets/rooms/open_space_1.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hotspot_dispenser_1',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'DISPENSER',
          x_percent: 64.5,
          y_percent: 56.0,
          title: 'Water Dispenser (School Workspace)',
          content:
            '1. Place your cup or bottle under the nozzle.\n2. Press the blue button for chilled filtered water or white button for ambient water.\n3. Please report empty 19L bottles to office management.',
          is_claimed: false,
        },
      ],
    },
    {
      id: 'open_space_1_desks',
      label: 'Angle 2 · Student Desks & Game Room Glass',
      imageUrl: '/assets/rooms/open_space_1.jpg',
      is360: false,
      hotspots: [
        {
          id: 'hotspot_dispenser_1_close',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'DISPENSER',
          x_percent: 64.5,
          y_percent: 58.0,
          title: 'Water Dispenser',
          content:
            'Dispenses cold and room-temperature filtered water for Xsolla School students.',
          is_claimed: false,
        },
      ],
    },
  ],
  zone_kitchen: [
    {
      id: 'kitchen_main',
      label: 'Photo 1 · Espresso & Coffee Bar',
      imageUrl: '/assets/rooms/kitchen.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hotspot_kitchen_coffee',
          zone_id: 'zone_kitchen',
          category: 'COFFEE_MACHINE',
          x_percent: 32.0,
          y_percent: 52.0,
          title: 'Coffee Machine',
          content:
            '1. Check that water and coffee beans are topped up.\n2. Place your mug under the spout.\n3. Select Espresso, Americano, or Cappuccino on the touch panel.',
          is_claimed: false,
        },
        {
          id: 'hotspot_dispenser_3',
          zone_id: 'zone_kitchen',
          category: 'DISPENSER',
          x_percent: 68.0,
          y_percent: 54.0,
          title: 'Kitchen Water Dispenser',
          content:
            'Chilled, ambient, and hot filtered water. Hold the safety lock for 2 seconds to dispense hot water.',
          is_claimed: false,
        },
      ],
    },
    {
      id: 'kitchen_storage',
      label: 'Photo 2 · Refrigerator & Dining Area',
      imageUrl: '/assets/rooms/kitchen_2.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hotspot_kitchen_fridge',
          zone_id: 'zone_kitchen',
          category: 'FRIDGE',
          x_percent: 55.0,
          y_percent: 50.0,
          title: 'Community Refrigerator',
          content:
            '• Label your lunch containers with your name and date.\n• Unlabeled containers are cleared every Friday at 18:00.',
          is_claimed: false,
        },
      ],
    },
  ],
}

export function resolveRoomScenes(
  zoneId: string,
  defaultMediaUrl?: string,
  backendHotspots: HotspotDTO[] = [],
): RoomSceneConfig[] {
  const configured = ROOM_SCENES_REGISTRY[zoneId]
  const equipmentFromBackend = backendHotspots.filter(
    (h) => h.category !== 'EASTER_EGG',
  )

  if (configured && configured.length > 0) {
    return configured.map((scene, index) => ({
      ...scene,
      hotspots:
        scene.hotspots && scene.hotspots.length > 0
          ? scene.hotspots
          : index === 0
            ? equipmentFromBackend
            : [],
    }))
  }

  const urls = (defaultMediaUrl || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (urls.length === 0) {
    return [
      {
        id: `${zoneId}_scene_1`,
        label: 'View 1 · Main Room View',
        imageUrl: `/assets/rooms/${zoneId}.jpg`,
        is360: true,
        hotspots: equipmentFromBackend,
      },
    ]
  }

  return urls.map((url, idx) => ({
    id: `${zoneId}_scene_${idx + 1}`,
    label: `Photo ${idx + 1}`,
    imageUrl: url,
    is360: true,
    hotspots: idx === 0 ? equipmentFromBackend : [],
  }))
}
