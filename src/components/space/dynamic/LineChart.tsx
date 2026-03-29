import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useAIUpdate } from '@/hooks/useAIUpdate'
import { useState } from 'react'

interface DataPoint { name: string; value: number }
interface SpaceLineChartProps { props: Record<string, unknown>; componentId?: string }

export function SpaceLineChart({ props, componentId }: SpaceLineChartProps) {
  const [data, setData] = useState(props)
  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))
  const title = String(data.title || '折线图')
  const xKey = String(data.xKey || 'name')
  const yKey = String(data.yKey || 'value')
  const chartData = (Array.isArray(data.data) ? data.data as DataPoint[] : []).slice(0, 30)
  return (
    <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40">
      <h3 className="text-xl font-bold text-on-surface mb-6">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-outline-variant))" opacity={0.3} />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey={yKey} stroke="hsl(var(--color-primary))" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: 'hsl(var(--color-primary))' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
