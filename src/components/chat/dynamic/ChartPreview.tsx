import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface ChartPreviewProps {
  props: Record<string, unknown>
  componentId?: string
}

interface DataPoint { name: string; value: number }

export function ChartPreview({ props }: ChartPreviewProps) {
  const title = String(props.title || '图表')
  const chartType = String(props.chartType || 'line')
  const data = (Array.isArray(props.data) ? props.data as DataPoint[] : []).slice(0, 7)

  if (data.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
        <p className="text-sm font-medium text-on-surface mb-2">{title}</p>
        <p className="text-xs text-on-surface-variant">暂无数据</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
      <p className="text-sm font-medium text-on-surface mb-3">{title}</p>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--color-primary))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--color-primary))' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
