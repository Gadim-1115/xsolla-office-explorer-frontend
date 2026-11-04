import { ExplorerProvider } from './providers/ExplorerProvider'
import { ProgressHeader } from '../features/onboarding-progress/components/ProgressHeader'
import { OfficeMapCanvas } from '../features/map-navigation/components/OfficeMapCanvas'
import { QuestModal } from '../features/algorithmic-quest/components/QuestModal'
import { RoomModal } from '../features/room-inspector/components/RoomModal'

export function App() {
  return (
    <ExplorerProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0d0d1a] text-slate-100">
        <ProgressHeader />
        <OfficeMapCanvas />
        <QuestModal />
        <RoomModal />
      </div>
    </ExplorerProvider>
  )
}

export default App