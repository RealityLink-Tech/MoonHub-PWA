import { DayPicker } from 'react-day-picker'
import { useAIUpdate } from '@/hooks/useAIUpdate'
import { useState } from 'react'
import 'react-day-picker/dist/style.css'

interface CalendarEvent { date: string; title: string }
interface SpaceCalendarProps { props: Record<string, unknown>; componentId?: string }

export function SpaceCalendar({ props, componentId }: SpaceCalendarProps) {
  const [data, setData] = useState(props)
  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))
  const title = String(data.title || '日历')
  const events = (Array.isArray(data.events) ? data.events as CalendarEvent[] : [])
  const eventDates = events.map((e) => new Date(e.date))
  return (
    <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40">
      <h3 className="text-xl font-bold text-on-surface mb-6">{title}</h3>
      <DayPicker mode="single" modifiers={{ hasEvent: eventDates }} modifiersStyles={{ hasEvent: { fontWeight: 'bold', color: 'hsl(var(--color-primary))' } }} className="mx-auto w-full max-w-xs md:max-w-md" />
      {events.length > 0 && (
        <div className="mt-4 space-y-2">
          {events.slice(0, 5).map((event, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container-low">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-on-surface-variant">{event.date}</span>
              <span className="text-sm text-on-surface">{event.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
