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
      className={`group flex items-center gap-3 rounded-[6px] border px-4 py-3 font-mono text-sm select-none cursor-grab active:cursor-grabbing transition ${
        isDragging
          ? 'z-20 border-[#80EAFF]/70 bg-[#153640] shadow-md scale-[1.01]'
          : 'border-[#2F4045] bg-[#1B2628] hover:border-[#80EAFF]/70 hover:bg-[#2A3C40]'
      }`}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-[#9DB0B4] group-hover:text-[#80EAFF]" />
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#2F4045] text-xs font-bold text-white">
        {index + 1}
      </span>
      <pre className="flex-1 overflow-x-auto text-left text-white font-semibold whitespace-pre-wrap">
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
        <div className="flex flex-col gap-2">
          {blocks.map((block, index) => (
            <SortableCodeItem key={block.id} block={block} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
