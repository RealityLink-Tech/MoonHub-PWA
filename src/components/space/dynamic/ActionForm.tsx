import { useState } from 'react'
import { useAIUpdate } from '@/hooks/useAIUpdate'
import { Send } from 'lucide-react'

interface Field { name: string; label: string; type?: string; placeholder?: string }
interface ActionFormProps { props: Record<string, unknown>; componentId?: string }

export function ActionForm({ props, componentId }: ActionFormProps) {
  const [data, setData] = useState(props)
  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))
  const title = String(data.title || '操作面板')
  const fields = (Array.isArray(data.fields) ? data.fields as Field[] : [])
  const [values, setValues] = useState<Record<string, string>>({})
  return (
    <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40">
      <h3 className="text-xl font-bold text-on-surface mb-6">{title}</h3>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-on-surface mb-1.5">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea placeholder={field.placeholder} value={values[field.name] || ''} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={3} />
            ) : (
              <input type={field.type || 'text'} placeholder={field.placeholder} value={values[field.name] || ''} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            )}
          </div>
        ))}
        <button onClick={() => console.log('ActionForm submit:', values)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dim text-on-primary text-sm font-medium shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98]">
          <Send className="w-4 h-4" /> 提交
        </button>
      </div>
    </div>
  )
}
