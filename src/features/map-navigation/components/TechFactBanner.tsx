import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, RefreshCw } from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'
import {
  getRandomTechFact,
  type TechFact,
  type TechFactCategory,
} from '../../../shared/constants/techFacts'

const CATEGORY_BADGE_STYLES: Record<TechFactCategory, string> = {
  Go: 'border-[#00ADD8]/50 bg-[#00ADD8]/15 text-[#69E7FF]',
  Backend: 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300',
  React: 'border-[#80EAFF]/50 bg-[#80EAFF]/15 text-[#80EAFF]',
  Frontend: 'border-amber-400/50 bg-amber-400/15 text-amber-300',
  Architecture: 'border-purple-400/50 bg-purple-400/15 text-purple-300',
}

export function TechFactBanner() {
  const { selectedRoomZoneId, selectedQuestZoneId, activeMapHotspot } = useExplorer()
  const isOnMainMap = !selectedRoomZoneId && !selectedQuestZoneId && !activeMapHotspot

  const [currentFact, setCurrentFact] = useState<TechFact>(() => getRandomTechFact())
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const wasOnMainMapRef = useRef<boolean>(isOnMainMap)

  useEffect(() => {
    if (isOnMainMap && !wasOnMainMapRef.current) {
      setCurrentFact((prev) => getRandomTechFact(prev.id))
    }
    wasOnMainMapRef.current = isOnMainMap
  }, [isOnMainMap])

  useEffect(() => {
    const rotateOnReturn = () => {
      if (wasOnMainMapRef.current) {
        setCurrentFact((prev) => getRandomTechFact(prev.id))
      }
    }
    window.addEventListener('focus', rotateOnReturn)
    window.addEventListener('pageshow', rotateOnReturn)
    return () => {
      window.removeEventListener('focus', rotateOnReturn)
      window.removeEventListener('pageshow', rotateOnReturn)
    }
  }, [])

  if (!isOnMainMap) {
    return null
  }

  return (
    <div className="absolute right-3 bottom-3 z-20 max-w-[calc(100vw-6.5rem)] sm:right-5 sm:bottom-5 sm:max-w-sm">
      <div className="rounded-xl border border-[#2F4045] bg-[#141E20]/95 p-3 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#80EAFF]/40 bg-[#153640] text-[#80EAFF]">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${CATEGORY_BADGE_STYLES[currentFact.category]}`}
            >
              {currentFact.category}
            </span>
            <span className="truncate text-[11px] font-semibold text-[#9DB0B4]">
              Tips &amp; Tricks
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentFact((prev) => getRandomTechFact(prev.id))}
              title="Another random tip"
              className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#233134] text-[#9DB0B4] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              title={isCollapsed ? 'Expand tip' : 'Minimize tip'}
              className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#233134] text-[#9DB0B4] hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="mt-2 border-t border-[#2F4045]/70 pt-2 text-left">
            <p className="text-xs font-bold text-white">{currentFact.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#9DB0B4]">
              {currentFact.fact}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
