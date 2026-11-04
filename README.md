# Xsolla School — Interactive Office Explorer (Frontend)

Gamified onboarding web application for incoming students at Xsolla School (Baku Crescent Business Center, 31st Floor). Built with React, TypeScript, Vite, and Tailwind CSS following Feature-Sliced Clean Design.

## Core Features

- **Interactive 2D Vector Floor Plan:** Top-down oval SVG map of the 31st floor (`CrescentFloorSvg.tsx`) with pan/zoom controls (`react-zoom-pan-pinch`) and dynamic lock overlays.
- **Camera Dive-In & 360° Panoramic Room View:** Clicking any unlocked room triggers a smooth camera dive into that room's coordinates and opens a full-screen 360° rotatable panoramic interior view.
- **Drag & Drop Algorithmic Quests:** Locked zones (4 Game Room sectors from `EASY` to `HARD` + 3 `EASY` Meeting Rooms) open a Go code block sorting challenge built with `@dnd-kit`.
- **Interactive Equipment Hotspots & Hidden Easter Eggs:** Inspect instructions for the Coffee Machine, Refrigerator, Water Dispensers, and Projectors, and hunt for camouflaged Xsolla logos to reach 100% exploration.

## Prerequisites

- **Node.js:** v20+ and `npm`
- **Backend API:** Running locally on `http://localhost:8080`

## Quick Start for Teammates

1. Install dependencies:

```powershell
npm install
```

2. Start the development server:

```powershell
npm run dev
```

3. Open `http://localhost:5173` in your browser.

## Building for Production

```powershell
npm run build
npm run preview
```

## Adding 360° Room Panorama Photos

Place room panoramic photos inside `public/assets/rooms/` matching the filenames seeded in PostgreSQL:

- `public/assets/rooms/open_space_1.jpg` (Open Space 1 — Xsolla School Students)
- `public/assets/rooms/open_space_2.jpg` (Open Space 2 — Xsolla Employees)
- `public/assets/rooms/gameroom_sector_1.jpg` (Board Games)
- `public/assets/rooms/gameroom_sector_2.jpg` (Foosball & Table Hockey)
- `public/assets/rooms/gameroom_sector_3.jpg` (Table Tennis)
- `public/assets/rooms/gameroom_sector_4.jpg` (PlayStation Zone)
- `public/assets/rooms/kitchen.jpg` (Kitchen)
- `public/assets/rooms/session_hall.jpg` (Session & Lecture Hall)
- `public/assets/rooms/stock.jpg` (Stock Room)
- `public/assets/rooms/meeting_1.jpg` .. `meeting_11.jpg` (Meeting Rooms 1–11)

## Project Structure (Feature-Sliced Clean Design)

```text
frontend/
├── public/
│   └── assets/
│       ├── rooms/
│       └── icons/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── providers/ExplorerProvider.tsx
│   ├── shared/
│   │   ├── api/httpClient.ts
│   │   ├── constants/mapIds.ts
│   │   ├── types/api.types.ts
│   │   └── ui/
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   └── features/
│       ├── map-navigation/
│       ├── algorithmic-quest/
│       ├── room-inspector/
│       └── onboarding-progress/
└── package.json
```
