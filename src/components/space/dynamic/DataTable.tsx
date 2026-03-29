import { useState } from 'react'
import { useAIUpdate } from '@/hooks/useAIUpdate'
import { ArrowUpDown } from 'lucide-react'

interface Column { key: string; label: string }
interface DataTableProps { props: Record<string, unknown>; componentId?: string }

export function DataTable({ props, componentId }: DataTableProps) {
  const [data, setData] = useState(props)
  const [sortKey, setSortKey] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))
  const title = String(data.title || '数据表格')
  const columns = (Array.isArray(data.columns) ? data.columns as Column[] : [])
  const rows = (Array.isArray(data.rows) ? data.rows as Record<string, unknown>[] : []).slice(0, 50)
  const handleSort = (key: string) => {
    if (sortKey === key) { setSortAsc(!sortAsc) } else { setSortKey(key); setSortAsc(true) }
  }
  const sortedRows = sortKey ? [...rows].sort((a, b) => {
    const va = String(a[sortKey] || ''), vb = String(b[sortKey] || '')
    return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
  }) : rows
  return (
    <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40">
      <h3 className="text-xl font-bold text-on-surface mb-6">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/20">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant cursor-pointer hover:text-on-surface" onClick={() => handleSort(col.key)}>
                <span className="flex items-center gap-1">{col.label}<ArrowUpDown className="w-3 h-3 opacity-40" /></span>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={i} className="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors">
                {columns.map((col) => <td key={col.key} className="px-4 py-3 text-on-surface">{String(row[col.key] || '')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="text-center py-8 text-sm text-on-surface-variant">暂无数据</p>}
      </div>
    </div>
  )
}
