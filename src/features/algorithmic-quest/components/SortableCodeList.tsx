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
import { GripVertical } from 'lucide-react'
import type { CodeBlockDTO } from '../../../shared/types/api.types'

interface SortableCodeItemProps {
  block: CodeBlockDTO
  index: number
}

function SortableCodeItem({ block, index }: SortableCodeItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 font-mono text-sm select-none cursor-grab active:cursor-grabbing transition ${
        isDragging
          ? 'z-20 border-indigo-400 bg-indigo-950/90 shadow-lg shadow-indigo-500/20 scale-[1.02]'
          : 'border-white/10 bg-[#101020] hover:border-indigo-500/50 hover:bg-[#15152b]'
      }`}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-indigo-400" />
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-bold text-slate-400">
        {index + 1}
      </span>
      <pre className="flex-1 overflow-x-auto text-left text-emerald-300 whitespace-pre-wrap">
        {block.code}
      </pre>
    </div>
  )
}

interface SortableCodeListProps {
  blocks: CodeBlockDTO[]
  onReorder: (activeId: string, overId: string) => void
}

export function SortableCodeList({ blocks, onReorder }: SortableCodeListProps) {
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
        <div className="flex flex-col gap-2.5">
          {blocks.map((block, index) => (
            <SortableCodeItem key={block.id} block={block} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
