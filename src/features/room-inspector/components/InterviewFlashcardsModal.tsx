import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  X,
} from 'lucide-react'
import {
  INTERVIEW_FLASHCARDS,
  type FlashcardTopic,
  type InterviewFlashcard,
} from '../../../shared/constants/interviewFlashcards'
import { getLmsUser } from '../../../shared/api/lmsClient'

interface InterviewFlashcardsModalProps {
  isOpen: boolean
  onClose: () => void
}

type CardMastery = 'known' | 'review'

const TOPICS: ('All' | FlashcardTopic)[] = ['All', 'Go', 'SQL', 'System Design', 'React']

function getStorageKey(): string {
  const user = getLmsUser()
  return user
    ? `xsolla_interview_flashcards_user_${user.id}`
    : 'xsolla_interview_flashcards_guest'
}

function readMasteryMap(): Record<string, CardMastery> {
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, CardMastery>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeMasteryMap(map: Record<string, CardMastery>): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(map))
  } catch {
    return
  }
}

export function InterviewFlashcardsModal({
  isOpen,
  onClose,
}: InterviewFlashcardsModalProps) {
  const [selectedTopic, setSelectedTopic] = useState<'All' | FlashcardTopic>('All')
  const [reviewOnly, setReviewOnly] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean>(false)
  const [mastery, setMastery] = useState<Record<string, CardMastery>>(() => readMasteryMap())
  const [secondsLeft, setSecondsLeft] = useState<number>(60)
  const [timerRunning, setTimerRunning] = useState<boolean>(true)
  const [shuffledIds, setShuffledIds] = useState<string[] | null>(null)

  useEffect(() => {
    if (isOpen) {
      setMastery(readMasteryMap())
      setIsFlipped(false)
      setSecondsLeft(60)
      setTimerRunning(true)
    }
  }, [isOpen])

  const filteredCards: InterviewFlashcard[] = useMemo(() => {
    let list = INTERVIEW_FLASHCARDS.filter((c) =>
      selectedTopic === 'All' ? true : c.topic === selectedTopic,
    )
    if (reviewOnly) {
      list = list.filter((c) => mastery[c.id] === 'review')
    }
    if (shuffledIds) {
      const orderMap = new Map(shuffledIds.map((id, i) => [id, i]))
      list = [...list].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
    }
    return list
  }, [selectedTopic, reviewOnly, mastery, shuffledIds])

  const safeIndex =
    filteredCards.length > 0 ? Math.min(currentIndex, filteredCards.length - 1) : 0
  const currentCard = filteredCards[safeIndex] ?? null

  useEffect(() => {
    setIsFlipped(false)
    setSecondsLeft(60)
    setTimerRunning(true)
  }, [safeIndex, selectedTopic, reviewOnly])

  useEffect(() => {
    if (!isOpen || !timerRunning || isFlipped || !currentCard) return
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [isOpen, timerRunning, isFlipped, currentCard])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === ' ' && currentCard) {
        e.preventDefault()
        setIsFlipped((f) => !f)
      } else if (e.key === 'ArrowRight' && filteredCards.length > 0) {
        setCurrentIndex((i) => (i + 1) % filteredCards.length)
      } else if (e.key === 'ArrowLeft' && filteredCards.length > 0) {
        setCurrentIndex((i) => (i - 1 + filteredCards.length) % filteredCards.length)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose, currentCard, filteredCards.length])

  if (!isOpen) return null

  const totalCount = INTERVIEW_FLASHCARDS.length
  const knownCount = INTERVIEW_FLASHCARDS.filter((c) => mastery[c.id] === 'known').length
  const reviewCount = INTERVIEW_FLASHCARDS.filter((c) => mastery[c.id] === 'review').length
  const progressPct = Math.round((knownCount / totalCount) * 100)

  const handleMarkCard = (status: CardMastery) => {
    if (!currentCard) return
    const next = { ...mastery, [currentCard.id]: status }
    setMastery(next)
    writeMasteryMap(next)

    if (filteredCards.length > 1) {
      setCurrentIndex((i) => (i + 1) % filteredCards.length)
    } else {
      setIsFlipped(false)
    }
  }

  const handleShuffle = () => {
    const ids = INTERVIEW_FLASHCARDS.map((c) => c.id)
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = ids[i]
      ids[i] = ids[j]
      ids[j] = tmp
    }
    setShuffledIds(ids)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleResetProgress = () => {
    setMastery({})
    writeMasteryMap({})
    setReviewOnly(false)
    setCurrentIndex(0)
  }

  const getTopicBadgeColor = (topic: FlashcardTopic) => {
    switch (topic) {
      case 'Go':
        return 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
      case 'SQL':
        return 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
      case 'System Design':
        return 'border-purple-400/50 bg-purple-500/15 text-purple-300'
      case 'React':
        return 'border-sky-400/50 bg-sky-500/15 text-sky-300'
    }
  }

  const getDifficultyColor = (diff: InterviewFlashcard['difficulty']) => {
    if (diff === 'Junior') return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
    if (diff === 'Mid') return 'border-amber-500/40 bg-amber-500/15 text-amber-300'
    return 'border-rose-500/40 bg-rose-500/15 text-rose-300'
  }

  const currentStatus = currentCard ? mastery[currentCard.id] : undefined

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#2F4045] bg-[#141E20] shadow-[0_32px_100px_rgba(0,0,0,0.85)]"
      >
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#80EAFF] via-emerald-400 to-amber-400" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F4045] bg-[#1B2628] px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#80EAFF]/40 bg-[#153640] text-[#80EAFF]">
              <Headphones className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#80EAFF]">
                  Meet Cabine · 1-Min Interview Prep
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Technical Interview Flashcards
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Minute Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-mono font-bold ${
                secondsLeft <= 10
                  ? 'border-rose-500/60 bg-rose-500/20 text-rose-300 animate-pulse'
                  : 'border-[#2F4045] bg-[#141E20] text-[#80EAFF]'
              }`}
              title="1-Minute Interview Response Timer"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>
                0:{secondsLeft.toString().padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="ml-1 rounded p-0.5 text-[#9DB0B4] hover:text-white cursor-pointer"
                title={timerRunning ? 'Pause timer' : 'Resume timer'}
              >
                {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSecondsLeft(60)
                  setTimerRunning(true)
                }}
                className="rounded p-0.5 text-[#9DB0B4] hover:text-white cursor-pointer"
                title="Reset 60s timer"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Interview Flashcards"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2F4045] bg-[#233134] text-[#9DB0B4] hover:bg-rose-500 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Topic Filters & Progress Bar */}
        <div className="border-b border-[#2F4045] bg-[#172225] px-4 py-3 sm:px-6 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {TOPICS.map((topic) => {
                const count =
                  topic === 'All'
                    ? INTERVIEW_FLASHCARDS.length
                    : INTERVIEW_FLASHCARDS.filter((c) => c.topic === topic).length
                const active = selectedTopic === topic
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setSelectedTopic(topic)
                      setCurrentIndex(0)
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-[#80EAFF] text-[#0D1A1D]'
                        : 'border border-[#2F4045] bg-[#233134] text-[#9DB0B4] hover:text-white'
                    }`}
                  >
                    {topic} <span className="opacity-75">({count})</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setReviewOnly((v) => !v)
                  setCurrentIndex(0)
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  reviewOnly
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-[#2F4045] bg-[#233134] text-[#9DB0B4] hover:text-white'
                }`}
              >
                Need Review ({reviewCount})
              </button>

              <button
                type="button"
                onClick={handleShuffle}
                title="Shuffle flashcards"
                className="flex items-center gap-1 rounded-lg border border-[#2F4045] bg-[#233134] px-2.5 py-1 text-xs font-semibold text-[#9DB0B4] hover:border-[#80EAFF] hover:text-[#80EAFF] transition cursor-pointer"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>
          </div>

          {/* Mastery Progress Bar */}
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-emerald-300">
                Known: {knownCount} / {totalCount} ({progressPct}%)
              </span>
              <span className="font-bold text-amber-300">
                To Review: {reviewCount}
              </span>
            </div>
            {(knownCount > 0 || reviewCount > 0) && (
              <button
                type="button"
                onClick={handleResetProgress}
                className="text-[11px] font-semibold text-[#9DB0B4] hover:text-rose-300 transition cursor-pointer"
              >
                Reset Progress
              </button>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0F1719]">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-[#80EAFF] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Main Flashcard Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!currentCard ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#2F4045] bg-[#1B2628] py-14 px-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-white">
                No cards in &ldquo;Need Review&rdquo; for this topic!
              </p>
              <p className="mt-1 text-xs text-[#9DB0B4]">
                Switch back to all cards or choose another topic to continue practicing.
              </p>
              <button
                type="button"
                onClick={() => setReviewOnly(false)}
                className="mt-4 rounded-lg bg-[#80EAFF] px-4 py-2 text-xs font-bold text-[#0D1A1D] hover:bg-[#A6F1FF] transition cursor-pointer"
              >
                Show All Cards
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsFlipped((f) => !f)
              }}
              className="group relative min-h-[260px] sm:min-h-[290px] w-full rounded-2xl border border-[#80EAFF]/35 bg-gradient-to-br from-[#1B2A2E] via-[#182427] to-[#121B1E] p-5 sm:p-7 text-left shadow-[0_16px_45px_rgba(0,0,0,0.45)] hover:border-[#80EAFF]/70 transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Top Badges inside Card */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${getTopicBadgeColor(
                      currentCard.topic,
                    )}`}
                  >
                    {currentCard.topic}
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(
                      currentCard.difficulty,
                    )}`}
                  >
                    {currentCard.difficulty}
                  </span>
                  {currentStatus === 'known' && (
                    <span className="rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                      ✓ Known
                    </span>
                  )}
                  {currentStatus === 'review' && (
                    <span className="rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                      ↻ Needs Review
                    </span>
                  )}
                </div>

                <span className="font-mono text-xs font-bold text-[#9DB0B4]">
                  Card {safeIndex + 1} / {filteredCards.length}
                </span>
              </div>

              {/* Card Body: Question (Front) vs Answer (Back) */}
              {!isFlipped ? (
                <div className="my-6 space-y-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#80EAFF]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Interview Question
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-white leading-snug">
                    {currentCard.question}
                  </h3>
                </div>
              ) : (
                <div className="my-4 space-y-3.5 animate-fade-in">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Model Answer
                  </span>
                  <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                    {currentCard.answer}
                  </p>
                  <div className="rounded-xl border border-[#80EAFF]/30 bg-[#14252B] p-3 text-xs text-[#80EAFF] flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-300" />
                    <div>
                      <span className="font-bold text-amber-300">Key Takeaway: </span>
                      <span className="text-white/90">{currentCard.keyPoint}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Hint */}
              <div className="flex items-center justify-between border-t border-[#2F4045]/80 pt-3 text-[11px] text-[#9DB0B4]">
                <span>
                  {isFlipped
                    ? 'Click anywhere on card to view question again'
                    : 'Think of your answer in 60s, then click card to flip'}
                </span>
                <span className="font-bold text-[#80EAFF] group-hover:underline">
                  {isFlipped ? 'Show Question ↺' : 'Flip Answer ↻'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {currentCard && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2F4045] bg-[#1B2628] px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((i) => (i - 1 + filteredCards.length) % filteredCards.length)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2F4045] bg-[#233134] text-white hover:border-[#80EAFF] hover:text-[#80EAFF] transition cursor-pointer"
                title="Previous Card"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => (i + 1) % filteredCards.length)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2F4045] bg-[#233134] text-white hover:border-[#80EAFF] hover:text-[#80EAFF] transition cursor-pointer"
                title="Next Card"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkCard('review')}
                className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-[#0D1A1D] transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Need to Review</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkCard('known')}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400 hover:text-[#0D1A1D] transition cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>I Know This</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
