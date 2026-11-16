import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Puzzle } from 'lucide-react'
import type {
  CodeBlockDTO,
  QuestChallengeMode,
} from '../../../shared/types/api.types'

interface SortableCodeItemProps {
  block: CodeBlockDTO
  index: number
  mode: QuestChallengeMode
}

function SortableCodeItem({ block, index, mode }: SortableCodeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isPuzzle = mode === 'puzzle'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex items-center gap-3 rounded-[6px] border px-4 py-3 text-sm select-none cursor-grab active:cursor-grabbing transition ${
        isPuzzle ? 'font-sans' : 'font-mono'
      } ${
        isDragging
          ? isPuzzle
            ? 'z-20 border-violet-400/80 bg-[#231B38] shadow-md scale-[1.01]'
            : 'z-20 border-[#80EAFF]/70 bg-[#153640] shadow-md scale-[1.01]'
          : isPuzzle
            ? 'border-[#2F4045] bg-[#1B2628] hover:border-violet-400/60 hover:bg-[#232638]'
            : 'border-[#2F4045] bg-[#1B2628] hover:border-[#80EAFF]/70 hover:bg-[#2A3C40]'
      }`}
    >
      <GripVertical
        className={`h-4 w-4 shrink-0 text-[#9DB0B4] ${
          isPuzzle ? 'group-hover:text-violet-300' : 'group-hover:text-[#80EAFF]'
        }`}
      />
      <span
        className={`flex h-6 min-w-[24px] shrink-0 items-center justify-center rounded-[4px] px-1.5 text-xs font-bold ${
          isPuzzle
            ? 'bg-violet-500/20 text-violet-200 border border-violet-400/40'
            : 'bg-[#2F4045] text-white'
        }`}
      >
        {isPuzzle ? `#${index + 1}` : index + 1}
      </span>
      {isPuzzle ? (
        <div className="flex flex-1 items-center justify-between gap-2 text-left text-white font-semibold">
          <span>{block.code}</span>
          <Puzzle className="h-3.5 w-3.5 shrink-0 text-violet-300/60" />
        </div>
      ) : (
        <pre className="flex-1 overflow-x-auto text-left text-white font-semibold whitespace-pre-wrap">
          {block.code}
        </pre>
      )}
    </div>
  )
}

interface SortableCodeListProps {
  blocks: CodeBlockDTO[]
  onReorder: (activeId: string, overId: string) => void
  mode?: QuestChallengeMode
}

export function SortableCodeList({
  blocks,
  onReorder,
  mode = 'algorithm',
}: SortableCodeListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {blocks.map((block, index) => (
            <SortableCodeItem
              key={block.id}
              block={block}
              index={index}
              mode={mode}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
