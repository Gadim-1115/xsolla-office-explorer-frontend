import { ExplorerProvider } from './providers/ExplorerProvider'
import { ProgressHeader } from '../features/onboarding-progress/components/ProgressHeader'
import { OfficeMapCanvas } from '../features/map-navigation/components/OfficeMapCanvas'
import { QuestModal } from '../features/algorithmic-quest/components/QuestModal'
import { RoomModal } from '../features/room-inspector/components/RoomModal'

export function App() {
  return (
    <ExplorerProvider>
      {/* h-dvh: on phones 100vh includes the area under the browser's address bar */}
      <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#1B2628] text-white">
        <ProgressHeader />
        <OfficeMapCanvas />
        <QuestModal />
        <RoomModal />
      </div>
    </ExplorerProvider>
  )
}

export default App
