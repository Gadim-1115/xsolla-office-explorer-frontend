import type { HotspotDTO } from '../types/api.types'

export const EXTERNAL_INTEGRATION_URLS = {
  // Smart boards (MONITOR hotspots) open the student's own Google Calendar. The LMS backend
  // copies events created with sync_to_google into it (students are invited as guests).
  // Switch to the LMS calendar page once the LMS frontend is connected to its backend.
  WEEKLY_SCHEDULE_URL: 'https://calendar.google.com/calendar/r/week',
  LMS_TASKS_URL: '',
}

export interface LockedBlurFrame {
  left_percent: number
  top_percent: number
  width_percent: number
  height_percent: number
  clipPath?: string
}

export interface StreetViewLink {
  id: string
  label: string
  x_percent: number
  y_percent: number
  direction?: 'forward' | 'backward' | 'left' | 'right' | 'door'
  targetZoneId: string
  targetSceneId?: string
  targetYaw?: number
  lockedFrame?: LockedBlurFrame
}

export interface RoomSceneConfig {
  id: string
  label: string
  imageUrl: string
  is360?: boolean
  hotspots?: HotspotDTO[]
  links?: StreetViewLink[]
}

export const ROOM_SCENES_REGISTRY: Record<string, RoomSceneConfig[]> = {
  zone_lecturezone_open_space_1: [
    {
      id: 'zone_open_space_1_start',
      label: 'Open Space 1 · Start',
      imageUrl: '/assets/rooms/zone_open_space_1_start.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_os1_start_dispenser',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'DISPENSER',
          x_percent: 44.0,
          y_percent: 62.0,
          title: 'Water Dispenser',
          content:
            '1. Place your cup or bottle under the nozzle.\n2. Press the blue button for chilled filtered water or the white button for ambient water.\n3. Report empty 19L bottles to office administration.',
          is_claimed: false,
        },
        {
          id: 'hs_os1_start_desk',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'DESK',
          x_percent: 30.5,
          y_percent: 56.0,
          title: 'Student Desk · LMS Tasks',
          content:
            'Student workstation in Xsolla School Open Space 1. Click to view active LMS assignments and sprint tasks.',
          is_claimed: false,
        },
        {
          id: 'hotspot_egg_gameroom_1',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'EASTER_EGG',
          x_percent: 83.5,
          y_percent: 24.0,
          title: 'Hidden Xsolla Logo — Open Space 1',
          content: 'You found a hidden Xsolla logo!',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_os1_start_to_1_2',
          label: 'Open Space 1_2',
          x_percent: 26.0,
          y_percent: 88.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_2',
        },
        {
          id: 'link_os1_start_to_os2_5',
          label: 'Open Space 2',
          x_percent: 76.8,
          y_percent: 85.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_5',
        },
        {
          id: 'link_os1_start_gr3',
          label: 'Game Room 3 · Table Tennis',
          x_percent: 11.2,
          y_percent: 38.0,
          direction: 'door',
          targetZoneId: 'zone_gameroom_3',
          targetSceneId: 'zone_gameroom_3',
          lockedFrame: {
            left_percent: 1.0,
            top_percent: 8.0,
            width_percent: 17.8,
            height_percent: 54.0,
            clipPath: 'polygon(0% 4%, 45% 4%, 100% 18%, 100% 74%, 55% 90%, 0% 100%)',
          },
        },
        {
          id: 'link_os1_start_gr4',
          label: 'Game Room 4 · PlayStation',
          x_percent: 22.4,
          y_percent: 34.0,
          direction: 'door',
          targetZoneId: 'zone_gameroom_4',
          lockedFrame: {
            left_percent: 19.8,
            top_percent: 20.0,
            width_percent: 4.8,
            height_percent: 21.0,
          },
        },
        {
          id: 'link_os1_start_gr1',
          label: 'Game Room 1 · Board Games',
          x_percent: 79.8,
          y_percent: 36.0,
          direction: 'door',
          targetZoneId: 'zone_gameroom_1',
          targetSceneId: 'zone_gameroom_1',
          lockedFrame: {
            left_percent: 76.2,
            top_percent: 24.0,
            width_percent: 8.0,
            height_percent: 22.0,
          },
        },
        {
          id: 'link_os1_start_gr2',
          label: 'Game Room 2 · Foosball',
          x_percent: 92.0,
          y_percent: 36.0,
          direction: 'door',
          targetZoneId: 'zone_gameroom_2',
          targetSceneId: 'zone_gameroom_2',
          lockedFrame: {
            left_percent: 85.5,
            top_percent: 12.0,
            width_percent: 14.0,
            height_percent: 48.0,
            clipPath: 'polygon(0% 14%, 100% 0%, 100% 100%, 22% 92%, 22% 70%, 0% 70%)',
          },
        },
      ],
    },
    {
      id: 'zone_open_space_1_2',
      label: 'Open Space 1 · Center Desks',
      imageUrl: '/assets/rooms/zone_open_space_1_2.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_os1_2_desk_left',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'DESK',
          x_percent: 20.5,
          y_percent: 55.0,
          title: 'School Workstation · LMS Tasks',
          content:
            'Click to open Xsolla School LMS tasks, deadlines, and code review queue for this desk cluster.',
          is_claimed: false,
        },
        {
          id: 'hs_os1_2_desk_right',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'DESK',
          x_percent: 71.0,
          y_percent: 55.0,
          title: 'Team Desk · LMS Tasks',
          content:
            'Click to open team project backlog and active LMS tasks.',
          is_claimed: false,
        },
        {
          id: 'hotspot_egg_gameroom_3',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'EASTER_EGG',
          x_percent: 61.5,
          y_percent: 25.0,
          title: 'Hidden Xsolla Logo — School Lounge',
          content: 'You found a hidden Xsolla logo!',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_os1_2_to_1_3',
          label: 'Open Space 1_3',
          x_percent: 7.5,
          y_percent: 76.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_3',
        },
        {
          id: 'link_os1_2_to_lift1',
          label: 'Elevator 1',
          x_percent: 28.5,
          y_percent: 65.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_lift_1',
        },
        {
          id: 'link_os1_2_to_start',
          label: 'Open Space 1 Start',
          x_percent: 48.2,
          y_percent: 71.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_start',
        },
        {
          id: 'link_os1_2_to_gr2',
          label: 'Game Room 2 · Foosball',
          x_percent: 47.8,
          y_percent: 40.0,
          direction: 'door',
          targetZoneId: 'zone_gameroom_2',
          targetSceneId: 'zone_gameroom_2',
          lockedFrame: {
            left_percent: 46.5,
            top_percent: 32.0,
            width_percent: 2.8,
            height_percent: 16.0,
          },
        },
        {
          id: 'link_os1_2_to_gr3',
          label: 'Game Room 3 · Table Tennis',
          x_percent: 50.8,
          y_percent: 40.0,
          direction: 'door',
          targetZoneId: 'zone_gameroom_3',
          targetSceneId: 'zone_gameroom_3',
          lockedFrame: {
            left_percent: 49.7,
            top_percent: 29.0,
            width_percent: 2.3,
            height_percent: 22.0,
          },
        },
        {
          id: 'link_os1_2_to_gr4',
          label: 'Game Room 4 · PlayStation',
          x_percent: 54.1,
          y_percent: 40.0,
          direction: 'door',
          targetZoneId: 'zone_gameroom_4',
          lockedFrame: {
            left_percent: 52.3,
            top_percent: 18.0,
            width_percent: 3.6,
            height_percent: 42.0,
          },
        },
      ],
    },
    {
      id: 'zone_open_space_1_3',
      label: 'Open Space 1 · Pull-Up Bar & M1',
      imageUrl: '/assets/rooms/zone_open_space_1_3.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_os1_3_bar',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'BAR',
          x_percent: 22.5,
          y_percent: 58.0,
          title: 'Pull-Up & Dip Fitness Bar',
          content:
            'Ergonomic pull-up and dip station for stretching and quick exercise breaks between coding sessions.',
          is_claimed: false,
        },
        {
          id: 'hs_os1_3_cabine',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'CABINE',
          x_percent: 29.8,
          y_percent: 48.0,
          title: 'Meet Cabine · Acoustic Booth',
          content:
            'Soundproof solo call booth equipped with ventilation and power outlet for private online meetings.',
          is_claimed: false,
        },
        {
          id: 'hs_os1_3_desk',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'DESK',
          x_percent: 50.5,
          y_percent: 58.0,
          title: 'Student Desk · LMS Tasks',
          content:
            'Click to open Xsolla School LMS tasks and current module assignments.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_os1_3_to_1_2',
          label: 'Open Space 1_2',
          x_percent: 39.8,
          y_percent: 78.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_2',
        },
        {
          id: 'link_os1_3_to_m1',
          label: 'Meeting Room 1 (M1)',
          x_percent: 60.5,
          y_percent: 48.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_1',
        },
        {
          id: 'link_os1_3_to_session',
          label: 'Session Hall',
          x_percent: 96.8,
          y_percent: 89.0,
          direction: 'forward',
          targetZoneId: 'zone_session',
          targetSceneId: 'zone_session_hall',
        },
      ],
    },
    {
      id: 'zone_lift_1',
      label: 'Elevator Lobby 1 (North Entrance)',
      imageUrl: '/assets/rooms/zone_lift_1.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_lift_1_info',
          zone_id: 'zone_lecturezone_open_space_1',
          category: 'ELEVATOR',
          x_percent: 86.5,
          y_percent: 46.0,
          title: '31st Floor Elevators (North)',
          content:
            'High-speed passenger elevators connecting the Ground Lobby to the 31st floor. Keep your Xsolla badge handy for security access.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_lift1_to_os1_2',
          label: 'Open Space 1_2',
          x_percent: 8.8,
          y_percent: 82.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_2',
        },
        {
          id: 'link_lift1_to_os1_3',
          label: 'Open Space 1_3',
          x_percent: 64.5,
          y_percent: 83.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_3',
        },
      ],
    },
  ],
  zone_session: [
    {
      id: 'zone_session_hall',
      label: 'Session Hall · Main Auditorium',
      imageUrl: '/assets/rooms/zone_session_hall.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_session_monitor',
          zone_id: 'zone_session',
          category: 'MONITOR',
          x_percent: 3.5,
          y_percent: 40.0,
          title: 'Monitor (Projector) · Weekly Schedule',
          content:
            'Session Hall presentation screen. Click to open the live Weekly Lecture & Workshop Schedule.',
          is_claimed: false,
        },
        {
          id: 'hs_session_dispenser',
          zone_id: 'zone_session',
          category: 'DISPENSER',
          x_percent: 18.2,
          y_percent: 48.0,
          title: 'Session Hall Water Dispenser',
          content:
            'Chilled and ambient filtered drinking water station for workshops and town-hall sessions.',
          is_claimed: false,
        },
        {
          id: 'hs_session_medkit',
          zone_id: 'zone_session',
          category: 'MEDKIT',
          x_percent: 94.5,
          y_percent: 40.0,
          title: 'First Aid Med Kit',
          content:
            'Wall-mounted emergency first-aid kit stocked with sterile bandages, antiseptic wipes, and emergency medical supplies.',
          is_claimed: false,
        },
        {
          id: 'hotspot_egg_session',
          zone_id: 'zone_session',
          category: 'EASTER_EGG',
          x_percent: 43.2,
          y_percent: 22.0,
          title: 'Hidden Xsolla Logo — Session Hall',
          content: 'You found a hidden Xsolla logo!',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_session_to_os1_3',
          label: 'Open Space 1_3',
          x_percent: 14.5,
          y_percent: 64.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_3',
        },
        {
          id: 'link_session_to_m2',
          label: 'Meeting Room 2 (M2)',
          x_percent: 88.5,
          y_percent: 45.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_2',
        },
        {
          id: 'link_session_to_k_coridor',
          label: 'Kitchen Corridor',
          x_percent: 90.2,
          y_percent: 61.0,
          direction: 'forward',
          targetZoneId: 'zone_kitchen',
          targetSceneId: 'zone_kitchen_coridor',
        },
      ],
    },
  ],
  zone_kitchen: [
    {
      id: 'zone_kitchen_coridor',
      label: 'Kitchen Corridor 1 · Stock & M2',
      imageUrl: '/assets/rooms/zone_kitchen_coridor.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_kcor1_stock',
          zone_id: 'zone_stock',
          category: 'STOCK',
          x_percent: 46.2,
          y_percent: 55.0,
          title: 'Stock Room',
          content: 'Office storage and equipment supply room.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_kcor1_to_kcor2',
          label: 'Kitchen Corridor 2',
          x_percent: 3.5,
          y_percent: 82.0,
          direction: 'forward',
          targetZoneId: 'zone_kitchen',
          targetSceneId: 'zone_kitchen_coridor_2',
        },
        {
          id: 'link_kcor1_to_session',
          label: 'Session Hall',
          x_percent: 52.8,
          y_percent: 90.0,
          direction: 'forward',
          targetZoneId: 'zone_session',
          targetSceneId: 'zone_session_hall',
        },
        {
          id: 'link_kcor1_to_m2',
          label: 'Meeting Room 2 (M2)',
          x_percent: 64.5,
          y_percent: 55.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_2',
        },
      ],
    },
    {
      id: 'zone_kitchen_coridor_2',
      label: 'Kitchen Corridor 2 · Kitchen & M3–M11',
      imageUrl: '/assets/rooms/zone_kitchen_coridor_2.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hotspot_egg_kitchen',
          zone_id: 'zone_kitchen',
          category: 'EASTER_EGG',
          x_percent: 58.0,
          y_percent: 22.0,
          title: 'Hidden Xsolla Logo — Kitchen Corridor',
          content: 'You found a hidden Xsolla logo!',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_kcor2_to_kitchen',
          label: 'Kitchen & Coffee Bar',
          x_percent: 11.2,
          y_percent: 52.0,
          direction: 'door',
          targetZoneId: 'zone_kitchen',
          targetSceneId: 'kitchen_interior',
        },
        {
          id: 'link_kcor2_to_kcor1',
          label: 'Kitchen Corridor 1',
          x_percent: 21.2,
          y_percent: 75.0,
          direction: 'forward',
          targetZoneId: 'zone_kitchen',
          targetSceneId: 'zone_kitchen_coridor',
        },
        {
          id: 'link_kcor2_to_m3',
          label: 'Meeting Room 3 (M3)',
          x_percent: 31.8,
          y_percent: 52.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_3',
        },
        {
          id: 'link_kcor2_to_m4',
          label: 'Meeting Room 4 (M4)',
          x_percent: 44.0,
          y_percent: 55.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_4',
        },
        {
          id: 'link_kcor2_to_m11',
          label: 'Meeting Room 11 (M11)',
          x_percent: 70.5,
          y_percent: 52.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_11',
        },
        {
          id: 'link_kcor2_to_os2_start',
          label: 'Open Space 2 Start',
          x_percent: 89.0,
          y_percent: 88.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_start',
        },
      ],
    },
    {
      id: 'kitchen_interior',
      label: 'Kitchen Interior · Coffee & Dining',
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
          id: 'hotspot_kitchen_fridge',
          zone_id: 'zone_kitchen',
          category: 'FRIDGE',
          x_percent: 62.0,
          y_percent: 52.0,
          title: 'Community Refrigerator',
          content:
            '• Label your lunch containers with your name and date.\n• Unlabeled containers are cleared every Friday at 18:00.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_kitchen_int_to_kcor2',
          label: 'Back to Kitchen Corridor',
          x_percent: 48.0,
          y_percent: 80.0,
          direction: 'forward',
          targetZoneId: 'zone_kitchen',
          targetSceneId: 'zone_kitchen_coridor_2',
        },
      ],
    },
  ],
  zone_open_space_2: [
    {
      id: 'zone_open_space_2_start',
      label: 'Open Space 2 · Start',
      imageUrl: '/assets/rooms/zone_open_space_2_start.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_os2_start_medkit',
          zone_id: 'zone_open_space_2',
          category: 'MEDKIT',
          x_percent: 64.5,
          y_percent: 40.0,
          title: 'First Aid Med Kit',
          content:
            'Emergency first-aid kit mounted on the central core wall. Equipped with bandages, antiseptic, and emergency supplies.',
          is_claimed: false,
        },
        {
          id: 'hs_os2_start_desk_left',
          zone_id: 'zone_open_space_2',
          category: 'DESK',
          x_percent: 26.0,
          y_percent: 56.0,
          title: 'Staff Workstation · LMS Tasks',
          content:
            'Click to open LMS Tasks & Sprint Board for this workstation cluster.',
          is_claimed: false,
        },
        {
          id: 'hs_os2_start_desk_right',
          zone_id: 'zone_open_space_2',
          category: 'DESK',
          x_percent: 91.5,
          y_percent: 56.0,
          title: 'Engineering Desk · LMS Tasks',
          content:
            'Click to view engineering tasks and code review assignments in LMS.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_os2_start_to_2_2',
          label: 'Open Space 2_2',
          x_percent: 15.6,
          y_percent: 88.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_2',
        },
        {
          id: 'link_os2_start_to_lift2',
          label: 'Elevator 2',
          x_percent: 38.5,
          y_percent: 83.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_lift_2',
        },
        {
          id: 'link_os2_start_to_kcor2',
          label: 'Kitchen Corridor 2',
          x_percent: 73.0,
          y_percent: 71.0,
          direction: 'forward',
          targetZoneId: 'zone_kitchen',
          targetSceneId: 'zone_kitchen_coridor_2',
        },
        {
          id: 'link_os2_start_to_m11',
          label: 'Meeting Room 11 (M11)',
          x_percent: 78.2,
          y_percent: 48.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_11',
        },
      ],
    },
    {
      id: 'zone_open_space_2_2',
      label: 'Open Space 2 · View 2 (Outside M9)',
      imageUrl: '/assets/rooms/zone_open_space_2_2.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_os2_2_desk',
          zone_id: 'zone_open_space_2',
          category: 'DESK',
          x_percent: 54.0,
          y_percent: 60.0,
          title: 'Workstation · LMS Tasks',
          content:
            'Click to open active LMS Tasks and sprint deliverables for this team area.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_os2_2_to_2_3',
          label: 'Open Space 2_3',
          x_percent: 6.5,
          y_percent: 83.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_3',
        },
        {
          id: 'link_os2_2_to_m9',
          label: 'Meeting Room 9 (M9)',
          x_percent: 12.5,
          y_percent: 46.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_9',
          targetSceneId: 'meet_room_9',
        },
        {
          id: 'link_os2_2_to_start',
          label: 'Open Space 2 Start',
          x_percent: 40.8,
          y_percent: 80.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_start',
        },
      ],
    },
    {
      id: 'zone_open_space_2_3',
      label: 'Open Space 2 · View 3 (Outside M10)',
      imageUrl: '/assets/rooms/zone_open_space_2_3.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_os2_3_dispenser',
          zone_id: 'zone_open_space_2',
          category: 'DISPENSER',
          x_percent: 32.3,
          y_percent: 58.0,
          title: 'Water Dispenser',
          content:
            'Chilled and ambient filtered drinking water station near Meeting Room 10.',
          is_claimed: false,
        },
        {
          id: 'hs_os2_3_desk',
          zone_id: 'zone_open_space_2',
          category: 'DESK',
          x_percent: 50.0,
          y_percent: 62.0,
          title: 'Workstation · LMS Tasks',
          content:
            'Click to open LMS Tasks and sprint assignments for this desk cluster.',
          is_claimed: false,
        },
        {
          id: 'hotspot_egg_viewpoint',
          zone_id: 'zone_open_space_2',
          category: 'EASTER_EGG',
          x_percent: 71.5,
          y_percent: 24.0,
          title: 'Hidden Xsolla Logo — Open Space 2',
          content: 'You found a hidden Xsolla logo!',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_os2_3_to_2_5',
          label: 'Open Space 2_5',
          x_percent: 4.3,
          y_percent: 61.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_5',
        },
        {
          id: 'link_os2_3_to_lift2',
          label: 'Elevator 2 Corridor',
          x_percent: 16.2,
          y_percent: 80.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_lift_2',
        },
        {
          id: 'link_os2_3_to_m10',
          label: 'Meeting Room 10 (M10)',
          x_percent: 37.8,
          y_percent: 48.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_10',
          targetSceneId: 'meet_room_10',
        },
        {
          id: 'link_os2_3_to_2_2',
          label: 'Open Space 2_2',
          x_percent: 39.0,
          y_percent: 71.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_2',
        },
      ],
    },
    {
      id: 'zone_open_space_2_5',
      label: 'Open Space 2 · View 5 (Outside M5–M8)',
      imageUrl: '/assets/rooms/zone_open_space_2_5.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_os2_5_medkit',
          zone_id: 'zone_open_space_2',
          category: 'MEDKIT',
          x_percent: 64.2,
          y_percent: 39.0,
          title: 'First Aid Med Kit',
          content:
            'Wall-mounted emergency first-aid kit located between Meeting Room 6 and Meeting Room 7.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_os2_5_to_2_3',
          label: 'Open Space 2_3',
          x_percent: 36.8,
          y_percent: 81.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_3',
        },
        {
          id: 'link_os2_5_to_m5',
          label: 'Meeting Room 5 (M5)',
          x_percent: 46.2,
          y_percent: 49.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_5',
          targetSceneId: 'meet_room_5',
        },
        {
          id: 'link_os2_5_to_m6',
          label: 'Meeting Room 6 (M6)',
          x_percent: 54.8,
          y_percent: 47.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_6',
        },
        {
          id: 'link_os2_5_to_m7',
          label: 'Meeting Room 7 (M7)',
          x_percent: 75.5,
          y_percent: 47.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_7',
        },
        {
          id: 'link_os2_5_to_m8',
          label: 'Meeting Room 8 (M8)',
          x_percent: 85.0,
          y_percent: 48.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_8',
        },
        {
          id: 'link_os2_5_to_os1_start',
          label: 'Open Space 1 Start',
          x_percent: 88.2,
          y_percent: 86.0,
          direction: 'forward',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_start',
        },
      ],
    },
    {
      id: 'zone_lift_2',
      label: 'Elevator Lobby 2 (South Entrance)',
      imageUrl: '/assets/rooms/zone_lift_2.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_lift_2_info',
          zone_id: 'zone_open_space_2',
          category: 'ELEVATOR',
          x_percent: 69.5,
          y_percent: 49.0,
          title: '31st Floor Elevators (South)',
          content:
            'South elevator lobby serving the 31st floor of Crescent Business Center. Use your Xsolla badge at the lobby turnstiles.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_lift2_to_m9',
          label: 'Meeting Room 9 (M9)',
          x_percent: 16.5,
          y_percent: 46.0,
          direction: 'door',
          targetZoneId: 'zone_meeting_9',
          targetSceneId: 'meet_room_9',
        },
        {
          id: 'link_lift2_to_os2_3',
          label: 'Open Space 2_3',
          x_percent: 43.5,
          y_percent: 73.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_3',
        },
        {
          id: 'link_lift2_to_os2_start',
          label: 'Open Space 2 Start',
          x_percent: 94.8,
          y_percent: 76.0,
          direction: 'forward',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_start',
        },
      ],
    },
  ],
  zone_meeting_5: [
    {
      id: 'meet_room_5',
      label: 'Meeting Room 5 (M5)',
      imageUrl: '/assets/rooms/meet_room_5.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_m5_desk',
          zone_id: 'zone_meeting_5',
          category: 'DESK',
          x_percent: 3.5,
          y_percent: 49.0,
          title: 'M5 Whiteboard · LMS Tasks',
          content:
            'Click to open active Sprint Tasks and brainstorming notes assigned in LMS.',
          is_claimed: false,
        },
        {
          id: 'hs_m5_monitor',
          zone_id: 'zone_meeting_5',
          category: 'MONITOR',
          x_percent: 64.5,
          y_percent: 41.0,
          title: 'M5 Display · Weekly Schedule',
          content:
            'Click to open Meeting Room 5 Weekly Booking & Lecture Schedule.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_m5_to_os2_5',
          label: 'Exit to Open Space 2',
          x_percent: 43.0,
          y_percent: 55.0,
          direction: 'door',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_5',
        },
      ],
    },
  ],
  zone_meeting_9: [
    {
      id: 'meet_room_9',
      label: 'Meeting Room 9 (M9 · Boardroom)',
      imageUrl: '/assets/rooms/meet_room_9.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_m9_monitor',
          zone_id: 'zone_meeting_9',
          category: 'MONITOR',
          x_percent: 47.5,
          y_percent: 45.0,
          title: 'Boardroom M9 Display · Weekly Schedule',
          content:
            'Click to open Boardroom M9 Weekly Schedule & Executive Meeting Calendar.',
          is_claimed: false,
        },
        {
          id: 'hs_m9_desk',
          zone_id: 'zone_meeting_9',
          category: 'DESK',
          x_percent: 97.2,
          y_percent: 51.0,
          title: 'Boardroom Whiteboard · LMS Tasks',
          content:
            'Click to open Boardroom sprint tasks and action items in LMS.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_m9_to_os2_2',
          label: 'Exit to Open Space 2',
          x_percent: 39.0,
          y_percent: 47.0,
          direction: 'door',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_2',
        },
        {
          id: 'link_m9_to_lift2',
          label: 'Exit to Elevator 2',
          x_percent: 89.8,
          y_percent: 50.0,
          direction: 'door',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_lift_2',
        },
      ],
    },
  ],
  zone_meeting_10: [
    {
      id: 'meet_room_10',
      label: 'Meeting Room 10 (M10)',
      imageUrl: '/assets/rooms/meet_room_10.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_m10_desk_1',
          zone_id: 'zone_meeting_10',
          category: 'DESK',
          x_percent: 4.5,
          y_percent: 51.0,
          title: 'Whiteboard 1 · LMS Tasks',
          content:
            'Click to open LMS Tasks and sprint planning items.',
          is_claimed: false,
        },
        {
          id: 'hs_m10_desk_2',
          zone_id: 'zone_meeting_10',
          category: 'DESK',
          x_percent: 29.8,
          y_percent: 41.0,
          title: 'Whiteboard 2 · LMS Tasks',
          content:
            'Click to open team tasks and architecture notes in LMS.',
          is_claimed: false,
        },
        {
          id: 'hs_m10_monitor',
          zone_id: 'zone_meeting_10',
          category: 'MONITOR',
          x_percent: 50.5,
          y_percent: 36.0,
          title: 'M10 Display · Weekly Schedule',
          content:
            'Click to open Meeting Room 10 Weekly Schedule & Calendar.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_m10_to_os2_3',
          label: 'Exit to Open Space 2',
          x_percent: 14.5,
          y_percent: 44.0,
          direction: 'door',
          targetZoneId: 'zone_open_space_2',
          targetSceneId: 'zone_open_space_2_3',
        },
      ],
    },
  ],
  zone_gameroom_1: [
    {
      id: 'zone_gameroom_1',
      label: 'Game Room 1 · Board Games',
      imageUrl: '/assets/rooms/zone_gameroom_1.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_gr1_table_games',
          zone_id: 'zone_gameroom_1',
          category: 'GAME_TABLE',
          x_percent: 34.8,
          y_percent: 82.0,
          title: 'Table Games · Board Games',
          content:
            'Board games collection including Monopoly, Tabu, Jenga, and strategy card games for team breaks.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_gr1_to_gr2',
          label: 'Game Room 2 · Foosball',
          x_percent: 43.5,
          y_percent: 72.0,
          direction: 'forward',
          targetZoneId: 'zone_gameroom_2',
          targetSceneId: 'zone_gameroom_2',
          lockedFrame: {
            left_percent: 41.4,
            top_percent: 32.0,
            width_percent: 6.2,
            height_percent: 24.5,
          },
        },
        {
          id: 'link_gr1_to_os1_start',
          label: 'Open Space 1 Start',
          x_percent: 79.2,
          y_percent: 45.0,
          direction: 'door',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_start',
        },
      ],
    },
  ],
  zone_gameroom_2: [
    {
      id: 'zone_gameroom_2',
      label: 'Game Room 2 · Foosball & Air Hockey',
      imageUrl: '/assets/rooms/zone_gameroom_2.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_gr2_air_hockey',
          zone_id: 'zone_gameroom_2',
          category: 'GAME_TABLE',
          x_percent: 16.5,
          y_percent: 76.0,
          title: 'Air Hockey Table',
          content:
            'High-speed arcade air hockey table with electronic score counter.',
          is_claimed: false,
        },
        {
          id: 'hs_gr2_foosball',
          zone_id: 'zone_gameroom_2',
          category: 'GAME_TABLE',
          x_percent: 92.5,
          y_percent: 62.0,
          title: 'Foosball Table',
          content:
            'Tournament-grade table football setup for 1v1 and 2v2 matches.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_gr2_to_gr3',
          label: 'Game Room 3 · Table Tennis',
          x_percent: 11.2,
          y_percent: 66.0,
          direction: 'forward',
          targetZoneId: 'zone_gameroom_3',
          targetSceneId: 'zone_gameroom_3',
          lockedFrame: {
            left_percent: 7.6,
            top_percent: 14.0,
            width_percent: 9.2,
            height_percent: 35.0,
          },
        },
        {
          id: 'link_gr2_to_gr1',
          label: 'Game Room 1 · Board Games',
          x_percent: 54.0,
          y_percent: 89.0,
          direction: 'forward',
          targetZoneId: 'zone_gameroom_1',
          targetSceneId: 'zone_gameroom_1',
          lockedFrame: {
            left_percent: 53.0,
            top_percent: 28.0,
            width_percent: 15.0,
            height_percent: 46.0,
          },
        },
      ],
    },
  ],
  zone_gameroom_3: [
    {
      id: 'zone_gameroom_3',
      label: 'Game Room 3 · Table Tennis',
      imageUrl: '/assets/rooms/zone_gameroom_3.jpg',
      is360: true,
      hotspots: [
        {
          id: 'hs_gr3_table_tennis',
          zone_id: 'zone_gameroom_3',
          category: 'GAME_TABLE',
          x_percent: 67.5,
          y_percent: 76.0,
          title: 'Table Tennis',
          content:
            'Regulation-size indoor ping-pong table. Paddles and balls are available on the side rack.',
          is_claimed: false,
        },
      ],
      links: [
        {
          id: 'link_gr3_to_gr4',
          label: 'Game Room 4 · PlayStation',
          x_percent: 28.0,
          y_percent: 84.0,
          direction: 'forward',
          targetZoneId: 'zone_gameroom_4',
          lockedFrame: {
            left_percent: 20.6,
            top_percent: 14.0,
            width_percent: 13.8,
            height_percent: 64.0,
          },
        },
        {
          id: 'link_gr3_to_os1_2',
          label: 'Open Space 1_2',
          x_percent: 38.2,
          y_percent: 45.0,
          direction: 'door',
          targetZoneId: 'zone_lecturezone_open_space_1',
          targetSceneId: 'zone_open_space_1_2',
        },
        {
          id: 'link_gr3_to_gr2',
          label: 'Game Room 2 · Foosball',
          x_percent: 60.0,
          y_percent: 90.0,
          direction: 'forward',
          targetZoneId: 'zone_gameroom_2',
          targetSceneId: 'zone_gameroom_2',
          lockedFrame: {
            left_percent: 56.8,
            top_percent: 34.0,
            width_percent: 7.0,
            height_percent: 21.5,
          },
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
    return configured.map((scene) => ({
      ...scene,
      hotspots: scene.hotspots ?? [],
    }))
  }

  const urls = (defaultMediaUrl || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const fallbackBackLink: StreetViewLink =
    zoneId === 'zone_meeting_2' || zoneId === 'zone_stock'
      ? {
          id: `${zoneId}_back`,
          label: 'Exit to Kitchen Corridor',
          x_percent: 48.0,
          y_percent: 78.0,
          direction: 'door',
          targetZoneId: 'zone_kitchen',
          targetSceneId: 'zone_kitchen_coridor',
        }
      : zoneId === 'zone_meeting_3' ||
          zoneId === 'zone_meeting_4' ||
          zoneId === 'zone_meeting_11'
        ? {
            id: `${zoneId}_back`,
            label: 'Exit to Kitchen Corridor 2',
            x_percent: 48.0,
            y_percent: 78.0,
            direction: 'door',
            targetZoneId: 'zone_kitchen',
            targetSceneId: 'zone_kitchen_coridor_2',
          }
        : zoneId === 'zone_meeting_6' ||
            zoneId === 'zone_meeting_7' ||
            zoneId === 'zone_meeting_8'
          ? {
              id: `${zoneId}_back`,
              label: 'Exit to Open Space 2',
              x_percent: 48.0,
              y_percent: 78.0,
              direction: 'door',
              targetZoneId: 'zone_open_space_2',
              targetSceneId: 'zone_open_space_2_5',
            }
          : zoneId === 'zone_gameroom_4'
            ? {
                id: `${zoneId}_back`,
                label: 'Exit to Game Room 3',
                x_percent: 48.0,
                y_percent: 78.0,
                direction: 'door',
                targetZoneId: 'zone_gameroom_3',
                targetSceneId: 'zone_gameroom_3',
              }
            : zoneId === 'zone_meeting_1'
            ? {
                id: `${zoneId}_back`,
                label: 'Exit to Open Space 1',
                x_percent: 48.0,
                y_percent: 78.0,
                direction: 'door',
                targetZoneId: 'zone_lecturezone_open_space_1',
                targetSceneId: 'zone_open_space_1_3',
              }
            : {
                id: `${zoneId}_back`,
                label: 'Exit to Open Space 1',
                x_percent: 48.0,
                y_percent: 78.0,
                direction: 'door',
                targetZoneId: 'zone_lecturezone_open_space_1',
                targetSceneId: 'zone_open_space_1_start',
              }

  if (urls.length === 0) {
    return [
      {
        id: `${zoneId}_scene_1`,
        label: 'View 1 · Main Room View',
        imageUrl: `/assets/rooms/${zoneId}.jpg`,
        is360: true,
        hotspots: equipmentFromBackend,
        links: [fallbackBackLink],
      },
    ]
  }

  return urls.map((url, idx) => ({
    id: `${zoneId}_scene_${idx + 1}`,
    label: `Photo ${idx + 1}`,
    imageUrl: url,
    is360: true,
    hotspots: idx === 0 ? equipmentFromBackend : [],
    links: idx === 0 ? [fallbackBackLink] : [],
  }))
}
