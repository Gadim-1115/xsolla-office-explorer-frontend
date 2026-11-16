import { useEffect, useState, type ReactNode } from 'react'
import {
  BellRing,
  BookOpen,
  Bug,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Code2,
  DoorOpen,
  Flame,
  GraduationCap,
  Lock,
  Mic,
  MousePointerClick,
  Move,
  Puzzle,
  Sparkles,
  Trophy,
  Unlock,
  X,
} from 'lucide-react'
import { useExplorer } from '../../../app/providers/ExplorerProvider'

interface GuideSlide {
  id: string
  title: string
  caption: string
  renderVisual: () => ReactNode
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    id: 'map',
    title: 'Explore the 31st-Floor Map',
    caption: 'Click any open room to enter, or click a locked room to unlock it.',
    renderVisual: () => (
      <div className="grid h-48 grid-cols-3 gap-2.5 rounded-xl border border-[#2F4045] bg-[#0F1719] p-4">
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#80EAFF]/50 bg-[#153640] p-3 text-center">
          <Unlock className="h-6 w-6 text-[#80EAFF]" />
          <span className="text-xs font-bold text-white">Open Rooms</span>
          <span className="text-[10px] text-[#80EAFF]">Enter freely</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-rose-400/50 bg-[#3A2429] p-3 text-center">
          <Lock className="h-6 w-6 text-rose-400" />
          <span className="text-xs font-bold text-white">Locked Rooms</span>
          <span className="text-[10px] text-rose-300">Solve to unlock</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#2F4045] bg-[#233134] p-3 text-center">
          <DoorOpen className="h-6 w-6 text-[#80EAFF]" />
          <span className="text-xs font-bold text-white">Elevators</span>
          <span className="text-[10px] text-[#9DB0B4]">Jump inside</span>
        </div>
      </div>
    ),
  },
  {
    id: 'look-360',
    title: 'Look Around in 360°',
    caption: 'Drag anywhere to look around, and scroll to zoom in.',
    renderVisual: () => (
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#2F4045] bg-[#0F1719]">
        <img
          src="/assets/rooms/zone_open_space_1_start.jpg"
          alt="360 panorama view"
          className="h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <div className="flex items-center gap-2 rounded-full border border-[#80EAFF]/60 bg-[#141E20]/90 px-4 py-2 text-xs font-bold text-white shadow-lg">
            <Move className="h-4 w-4 text-[#80EAFF]" />
            <span>Drag 360° · Scroll to Zoom</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'walk',
    title: 'Walk With Floor Arrows',
    caption: 'Click the blue arrows on the floor to move through hallways.',
    renderVisual: () => (
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#2F4045] bg-[#0F1719]">
        <img
          src="/assets/rooms/zone_open_space_1_2.jpg"
          alt="Street view floor arrows"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#80EAFF] text-[#0D1A1D] shadow-xl">
            <ChevronRight className="h-6 w-6 -rotate-90 stroke-[3]" />
          </div>
          <span className="flex items-center gap-1 rounded-full bg-black/75 px-3 py-0.5 text-[11px] font-semibold text-[#80EAFF]">
            <MousePointerClick className="h-3 w-3" />
            Step Forward
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'unlock-modes',
    title: 'Algorithm or Puzzle Mode',
    caption: 'Not a coder? Pick Puzzle at the top-right—it stays saved for all rooms.',
    renderVisual: () => (
      <div className="grid h-48 grid-cols-2 gap-3 rounded-xl border border-[#2F4045] bg-[#0F1719] p-4">
        <div className="flex flex-col justify-between rounded-lg border border-[#80EAFF]/40 bg-[#153640]/85 p-3 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#80EAFF]">
            <Code2 className="h-4 w-4" />
            <span>Algorithm</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-white">
            <div className="rounded bg-[#1B2628] px-2 py-1">1. temp := a</div>
            <div className="rounded bg-[#1B2628] px-2 py-1">2. a = b</div>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-lg border border-violet-400/50 bg-[#1D1B33] p-3 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
            <Puzzle className="h-4 w-4" />
            <span>Puzzle</span>
          </div>
          <div className="space-y-1 text-[11px] font-semibold text-white">
            <div className="rounded bg-[#252242] px-2 py-1">#1 COFFEE → BREAK</div>
            <div className="rounded bg-[#252242] px-2 py-1">#2 BREAK → ROOM</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'lms',
    title: 'LMS Tasks, Grades & Alerts',
    caption: 'Sign in with LMS to open desks, schedules, grades, and bell alerts.',
    renderVisual: () => (
      <div className="grid h-48 grid-cols-2 gap-2.5 rounded-xl border border-[#2F4045] bg-[#0F1719] p-4">
        <div className="flex items-center gap-2.5 rounded-lg border border-[#2F4045] bg-[#1B2628] px-3 py-2">
          <ClipboardList className="h-5 w-5 shrink-0 text-[#80EAFF]" />
          <span className="text-xs font-bold text-white">Desk · Tasks</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-[#2F4045] bg-[#1B2628] px-3 py-2">
          <GraduationCap className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="text-xs font-bold text-white">Student Grades</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-[#2F4045] bg-[#1B2628] px-3 py-2">
          <Calendar className="h-5 w-5 shrink-0 text-[#80EAFF]" />
          <span className="text-xs font-bold text-white">Room Schedule</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-rose-400/40 bg-[#2A1B20] px-3 py-2">
          <BellRing className="h-5 w-5 shrink-0 text-rose-400" />
          <span className="text-xs font-bold text-white">Bell Reminders</span>
        </div>
      </div>
    ),
  },
  {
    id: 'streak',
    title: 'Daily Bug Hunt & Leaderboard',
    caption: 'Solve one bug in Open Space 2 each day to climb Game Room 1’s board.',
    renderVisual: () => (
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#2F4045] bg-[#0F1719]">
        <img
          src="/assets/rooms/zone_open_space_2_3.jpg"
          alt="Daily Bug Hunt"
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-3 p-4">
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-amber-400/50 bg-[#1B2628]/95 px-4 py-3">
            <Bug className="h-6 w-6 text-amber-400" />
            <span className="text-xs font-bold text-white">Daily Bug</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-orange-400/50 bg-[#1B2628]/95 px-4 py-3">
            <Flame className="h-6 w-6 fill-amber-400 text-orange-400" />
            <span className="text-xs font-bold text-white">Streak</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-amber-300/50 bg-[#1B2628]/95 px-4 py-3">
            <Trophy className="h-6 w-6 text-amber-300" />
            <span className="text-xs font-bold text-white">Top 10</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'cabine-eggs',
    title: 'Interview Prep & Hidden Logos',
    caption: 'Practice 1-min flashcards in Meet Cabine and find all 5 Xsolla logos.',
    renderVisual: () => (
      <div className="grid h-48 grid-cols-2 gap-3 rounded-xl border border-[#2F4045] bg-[#0F1719] p-4">
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#80EAFF]/50 bg-[#153640] p-3 text-center">
          <Mic className="h-7 w-7 text-[#80EAFF]" />
          <span className="text-xs font-bold text-white">Meet Cabine</span>
          <span className="text-[11px] text-[#9DB0B4]">1-Min Flashcards</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-[#172B28] p-3 text-center">
          <Sparkles className="h-7 w-7 text-[#80EAFF]" />
          <span className="text-xs font-bold text-white">5 Hidden Logos</span>
          <span className="text-[11px] text-emerald-300">Unlock 100%</span>
        </div>
      </div>
    ),
  },
]

export function OnboardingGuideModal() {
  const { isGuideOpen, closeGuideModal } = useExplorer()
  const [slideIndex, setSlideIndex] = useState<number>(0)

  useEffect(() => {
    if (!isGuideOpen) return
    setSlideIndex(0)
  }, [isGuideOpen])

  useEffect(() => {
    if (!isGuideOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGuideModal(true)
      } else if (e.key === 'ArrowRight') {
        setSlideIndex((prev) => Math.min(GUIDE_SLIDES.length - 1, prev + 1))
      } else if (e.key === 'ArrowLeft') {
        setSlideIndex((prev) => Math.max(0, prev - 1))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isGuideOpen, closeGuideModal])

  if (!isGuideOpen) return null

  const slide = GUIDE_SLIDES[slideIndex] ?? GUIDE_SLIDES[0]
  const isFirst = slideIndex === 0
  const isLast = slideIndex === GUIDE_SLIDES.length - 1

  return (
    <div
      onClick={() => closeGuideModal(true)}
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#2F4045] bg-[#1B2628] text-white shadow-[0_28px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="h-[3px] w-full bg-[#80EAFF]" />

        <div className="flex items-center justify-between border-b border-[#2F4045] bg-[#141E20] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-4 w-4 text-[#80EAFF]" />
            <span className="text-xs font-bold text-white">Quick Guide</span>
            <span className="rounded bg-[#233134] px-2 py-0.5 text-[11px] font-semibold text-[#9DB0B4]">
              {slideIndex + 1} / {GUIDE_SLIDES.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => closeGuideModal(true)}
            aria-label="Close onboarding guide"
            className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#2F4045] text-white hover:bg-[#80EAFF] hover:text-[#0D1A1D] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-center">
          {slide.renderVisual()}

          <div>
            <h2 className="text-base font-bold text-white">{slide.title}</h2>
            <p className="mt-1 text-xs text-[#9DB0B4]">{slide.caption}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#2F4045] bg-[#141E20] px-5 py-3">
          <button
            type="button"
            onClick={() => closeGuideModal(true)}
            className="text-xs font-semibold text-[#9DB0B4] hover:text-white transition cursor-pointer"
          >
            Skip
          </button>

          <div className="flex items-center gap-1.5">
            {GUIDE_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlideIndex(idx)}
                aria-label={`Page ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === slideIndex
                    ? 'w-5 bg-[#80EAFF]'
                    : 'w-2 bg-[#2F4045] hover:bg-[#49636B]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isFirst}
              onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
              aria-label="Previous"
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#2F4045] bg-[#233134] text-white hover:border-[#80EAFF] disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={() => closeGuideModal(true)}
                className="flex h-8 items-center gap-1.5 rounded-[6px] bg-[#80EAFF] px-3.5 text-xs font-bold text-[#0D1A1D] hover:bg-[#A6F1FF] transition cursor-pointer"
              >
                <span>Done</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setSlideIndex((prev) => Math.min(GUIDE_SLIDES.length - 1, prev + 1))
                }
                aria-label="Next"
                className="flex h-8 items-center gap-1 rounded-[6px] bg-[#80EAFF] px-3 text-xs font-bold text-[#0D1A1D] hover:bg-[#A6F1FF] transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
