import { ExplorerProvider } from './providers/ExplorerProvider'
import { ProgressHeader } from '../features/onboarding-progress/components/ProgressHeader'
import { OfficeMapCanvas } from '../features/map-navigation/components/OfficeMapCanvas'
import { QuestModal } from '../features/algorithmic-quest/components/QuestModal'
import { RoomModal } from '../features/room-inspector/components/RoomModal'
import { CompletionCelebration } from '../features/onboarding-progress/components/CompletionCelebration'

export function App() {
  return (
    <ExplorerProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1B2628] text-white">
        <ProgressHeader />
        <OfficeMapCanvas />
        <QuestModal />
        <RoomModal />
        <CompletionCelebration />
      </div>
    </ExplorerProvider>
  )
}

export default App
