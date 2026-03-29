import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useAIUpdate } from '@/hooks/useAIUpdate'
import { useState } from 'react'

interface KanbanItem { title: string; description?: string }
interface KanbanColumn { title: string; items: KanbanItem[] }
interface KanbanBoardProps { props: Record<string, unknown>; componentId?: string }

function DraggableCard({ item }: { item: KanbanItem }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: item.title })
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/10 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-on-surface">{item.title}</p>
      {item.description && <p className="text-xs text-on-surface-variant mt-1">{item.description}</p>}
    </div>
  )
}

export function KanbanBoard({ props, componentId }: KanbanBoardProps) {
  const [data, setData] = useState(props)
  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))
  const title = String(data.title || '看板')
  const columns = (Array.isArray(data.columns) ? data.columns as KanbanColumn[] : [])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  return (
    <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40">
      <h3 className="text-xl font-bold text-on-surface mb-6">{title}</h3>
      <DndContext collisionDetection={closestCorners} sensors={sensors}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {columns.map((column, i) => (
            <div key={i} className="flex-shrink-0 w-64 md:w-72">
              <div className="px-3 py-2 mb-3 rounded-lg bg-surface-container-high">
                <p className="text-sm font-semibold text-on-surface">{column.title}</p>
                <p className="text-xs text-on-surface-variant">{column.items.length} 项</p>
              </div>
              <SortableContext items={column.items.map((item) => item.title)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {column.items.map((item) => <DraggableCard key={item.title} item={item} />)}
                </div>
              </SortableContext>
            </div>
          ))}
          {columns.length === 0 && <p className="text-sm text-on-surface-variant py-8">暂无看板数据</p>}
        </div>
      </DndContext>
    </div>
  )
}
