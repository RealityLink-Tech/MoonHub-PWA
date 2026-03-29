// ============================================================
// Dynamic Renderer Component
// Renders AI-generated component trees
// 支持 Chat 消息卡片 + Space 组件
// ============================================================

import { useState, type ReactNode, type CSSProperties, type ComponentType } from 'react'
import {
  Wallet,
  FileText,
  FolderOpen,
  Sparkles,
  Download,
  CheckCircle,
  Calendar,
  Cloud,
} from 'lucide-react'
import type { GeneratedComponent } from '@/types'
import { useSpaceStore } from '@/stores/space'
import { useAIUpdate } from '@/hooks/useAIUpdate'
import { cn } from '@/lib/utils'
import { MetricSummary, StatusBadge, MiniList, QuickAction, ChartPreview } from '@/components/chat/dynamic'
import { MetricCard } from '@/components/space/dynamic'
import { SpaceLineChart } from '@/components/space/dynamic'
import { SpaceBarChart } from '@/components/space/dynamic'
import { DataTable } from '@/components/space/dynamic'
import { StatusList } from '@/components/space/dynamic'
import { ActionForm } from '@/components/space/dynamic'
import { SpaceCalendar } from '@/components/space/dynamic'
import { KanbanBoard } from '@/components/space/dynamic'

interface DynamicRendererProps {
  components: GeneratedComponent[]
}

interface ComponentProps {
  props: Record<string, unknown>
  children?: ReactNode
  componentId?: string
}

// Helper to safely render unknown values
const str = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

/** Allow only safe image URLs (blocks javascript:, blob:, etc.) */
function safeImageSrc(raw: unknown): string | undefined {
  const s = str(raw).trim()
  if (!s) return undefined
  const lower = s.slice(0, 12).toLowerCase()
  if (lower.startsWith('http://') || lower.startsWith('https://')) return s
  if (s.startsWith('/') || s.startsWith('./') || s.startsWith('../')) return s
  if (lower.startsWith('data:image/')) {
    const semi = s.indexOf(';')
    const comma = s.indexOf(',')
    if (semi > 0 && comma > semi) return s
  }
  return undefined
}

// Icon mapping for Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  FileText,
  FolderOpen,
  Sparkles,
  CheckCircle,
  Calendar,
  Cloud,
}

// ============================================================
// Chat 消息卡片组件
// ============================================================

// 财务概览卡片（AI 消息中显示）
const FinancialOverviewCard: ComponentType<ComponentProps> = ({ props }) => (
  <div className="bg-surface-container-low rounded-xl p-4 shadow-lg border border-white/40">
    <div className="flex justify-between items-start mb-4">
      <h4 className="text-base font-bold text-primary">{str(props.title) || '财务概览'}</h4>
      <span className="text-xs text-outline-variant">{str(props.period)}</span>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
        <span className="text-[11px] text-on-surface-variant">{str(props.expenseLabel) || '支出'}</span>
        <span className="block text-lg font-bold text-primary">{str(props.expenseValue)}</span>
      </div>
      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
        <span className="text-[11px] text-on-surface-variant">{str(props.changeLabel) || '变化'}</span>
        <span className="block text-lg font-bold text-error">{str(props.changeValue)}</span>
      </div>
    </div>
  </div>
)

// 文件预览卡片（AI 消息中显示）
const FilePreviewCard: ComponentType<ComponentProps> = ({ props }) => {
  const previewImage = safeImageSrc(props.previewImage)

  return (
    <div className="bg-surface-container-lowest border border-primary-container/30 rounded-xl overflow-hidden">
      <div className="flex items-center p-3 space-x-4">
        <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center shrink-0">
          <FileText className="text-primary w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{str(props.fileName)}</p>
          <p className="text-xs text-outline-variant">{str(props.fileMeta)}</p>
        </div>
        <button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
          <Download className="w-4 h-4 text-primary" />
        </button>
      </div>
      {previewImage && (
        <div className="aspect-[16/6] bg-surface-container-high relative overflow-hidden">
          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  )
}

// 代码块卡片
const CodeBlockCard: ComponentType<ComponentProps> = ({ props }) => (
  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2 bg-surface-container-low border-b border-outline-variant/20">
      <span className="text-xs font-medium text-on-surface-variant">{str(props.language) || 'code'}</span>
      <button className="text-xs text-primary hover:text-primary-dim transition-colors">
        复制
      </button>
    </div>
    <pre className="p-4 text-sm overflow-x-auto">
      <code>{str(props.code)}</code>
    </pre>
  </div>
)

// ============================================================
// Space 组件
// ============================================================

// Bento Grid 布局容器
const BentoGrid: ComponentType<ComponentProps> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
    {children as ReactNode}
  </div>
)

// Bento Item（支持不同跨度）
const BentoItem: ComponentType<ComponentProps> = ({ props, children }) => (
  <div
    className={cn(
      'rounded-[2.5rem] bg-surface-container-lowest p-8 shadow-lg border border-white/40',
      props.span === 'large' && 'md:col-span-8',
      props.span === 'medium' && 'md:col-span-4',
      props.span === 'full' && 'md:col-span-12',
      !props.span && 'md:col-span-6'
    )}
  >
    {children as ReactNode}
  </div>
)

// 财务系统组件（Space 专用）
const FinancialSystemCard: ComponentType<ComponentProps> = ({ props, componentId }) => {
  const [data, setData] = useState(props)

  // 预留：接收 AI 推送的数据更新
  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))

  const Icon = iconMap[str(props.icon)] || Wallet

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-surface-container-lowest p-8 shadow-lg border border-white/40 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <span className="text-xs text-outline-variant">{str(data.period)}</span>
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-4">{str(data.title) || '财务概览'}</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-on-surface-variant">{str(data.expenseLabel) || '本月支出'}</span>
          <span className="text-lg font-semibold text-primary">{str(data.expenseValue)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-on-surface-variant">{str(data.incomeLabel) || '本月收入'}</span>
          <span className="text-lg font-semibold text-tertiary">{str(data.incomeValue)}</span>
        </div>
        {!!data.budget && (
          <div className="pt-3 border-t border-outline-variant/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-on-surface-variant">预算使用</span>
              <span className="text-sm font-medium">{str(data.budgetPercent)}%</span>
            </div>
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, Number(data.budgetPercent) || 0)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 文件管理器组件
const FileManagerCard: ComponentType<ComponentProps> = ({ props, componentId }) => {
  const [data, setData] = useState(props)

  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))

  const Icon = iconMap[str(props.icon)] || FolderOpen
  const files = (data.files as Array<{ name: string; type: string; size: string; date: string }>) || []

  return (
    <div className="rounded-[2.5rem] bg-surface-container-lowest p-8 shadow-lg border border-white/40">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-4">{str(data.title) || '文件管理器'}</h3>
      <div className="space-y-2">
        {files.length > 0 ? (
          files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-on-surface-variant" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-outline-variant">{file.size}</p>
                </div>
              </div>
              <span className="text-xs text-outline-variant">{file.date}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-on-surface-variant">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无文件</p>
          </div>
        )}
      </div>
    </div>
  )
}

// 灵感收藏组件
const InsightsCollectionCard: ComponentType<ComponentProps> = ({ props, componentId }) => {
  const [data, setData] = useState(props)

  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))

  const Icon = iconMap[str(props.icon)] || Sparkles
  const insights = (data.insights as Array<{ title: string; content: string; tag?: string }>) || []

  return (
    <div className="md:col-span-12 rounded-[2.5rem] bg-surface-container-low/50 p-10 shadow-lg border border-white/40">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-on-surface">{str(data.title) || '灵感收藏'}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.length > 0 ? (
          insights.map((insight, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-surface-container-lowest border border-white/40 hover:shadow-md transition-shadow cursor-pointer"
            >
              <p className="text-sm font-medium text-on-surface mb-2">{insight.title}</p>
              <p className="text-xs text-on-surface-variant line-clamp-2">{insight.content}</p>
              {insight.tag && (
                <span className="inline-block mt-2 px-2 py-1 text-[10px] font-medium bg-primary-container/30 text-primary rounded-full">
                  {insight.tag}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-on-surface-variant">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无灵感收藏</p>
          </div>
        )}
      </div>
    </div>
  )
}

// 任务追踪组件
const TaskTrackerCard: ComponentType<ComponentProps> = ({ props, componentId }) => {
  const [data, setData] = useState(props)

  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))

  const Icon = iconMap[str(props.icon)] || CheckCircle
  const tasks = (data.tasks as Array<{ title: string; completed: boolean; dueDate?: string }>) || []

  return (
    <div className="rounded-[2.5rem] bg-surface-container-lowest p-8 shadow-lg border border-white/40">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <span className="text-xs text-outline-variant">
          {tasks.filter(t => t.completed).length}/{tasks.length} 完成
        </span>
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-4">{str(data.title) || '任务追踪'}</h3>
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-colors',
                task.completed ? 'bg-surface-container-low opacity-60' : 'bg-surface-container-low hover:bg-surface-container'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                task.completed ? 'bg-tertiary border-tertiary' : 'border-outline-variant'
              )}>
                {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className={cn(
                'text-sm flex-1',
                task.completed && 'line-through text-on-surface-variant'
              )}>
                {task.title}
              </span>
              {task.dueDate && (
                <span className="text-xs text-outline-variant">{task.dueDate}</span>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-on-surface-variant">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无任务</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 基础组件
// ============================================================

// Built-in component renderers
const componentRegistry: Record<string, ComponentType<ComponentProps>> = {
  // Container
  container: ({ props, children }) => (
    <div
      className={str(props.className) || 'p-4'}
      style={props.style as CSSProperties}
    >
      {children as ReactNode}
    </div>
  ),

  // Flex container
  flex: ({ props, children }) => (
    <div
      className={`flex ${props.direction === 'column' ? 'flex-col' : 'flex-row'} ${str(props.className)}`}
      style={{
        gap: props.gap ? `${props.gap}px` : undefined,
        justifyContent: props.justify as CSSProperties['justifyContent'],
        alignItems: props.align as CSSProperties['alignItems'],
        ...(props.style as CSSProperties),
      }}
    >
      {children as ReactNode}
    </div>
  ),

  // Grid
  grid: ({ props, children }) => (
    <div
      className={`grid ${str(props.className)}`}
      style={{
        gridTemplateColumns: props.columns ? `repeat(${props.columns}, 1fr)` : undefined,
        gap: props.gap ? `${props.gap}px` : '16px',
        ...(props.style as CSSProperties),
      }}
    >
      {children as ReactNode}
    </div>
  ),

  // Card
  card: ({ props, children }) => (
    <div className={`rounded-lg border bg-card p-4 ${str(props.className)}`}>
      {props.title ? <h3 className="mb-2 font-semibold">{str(props.title)}</h3> : null}
      {children as ReactNode}
    </div>
  ),

  // Text
  text: ({ props }) => (
    <p
      className={`${props.variant === 'title' ? 'text-xl font-bold' : props.variant === 'subtitle' ? 'text-lg font-medium' : ''} ${str(props.className)}`}
    >
      {str(props.content)}
    </p>
  ),

  // Button
  button: ({ props }) => {
    return (
      <button
        className={`rounded-lg bg-primary px-4 py-2 text-on-primary transition-colors hover:bg-primary-hover ${str(props.className)}`}
        onClick={() => {
          if (props.onClick && typeof props.onClick === 'string') {
            console.warn('Button action:', props.onClick)
          }
        }}
      >
        {str(props.label) || 'Button'}
      </button>
    )
  },

  // Input
  input: ({ props }) => {
    const updateComponent = useSpaceStore.getState().updateComponent
    return (
      <input
        type={str(props.type) || 'text'}
        placeholder={str(props.placeholder)}
        value={str(props.value)}
        onChange={(e) => {
          if (props.id) {
            updateComponent(str(props.id), { value: e.target.value })
          }
        }}
        className={`w-full rounded-lg border bg-background px-3 py-2 ${str(props.className)}`}
      />
    )
  },

  // Image
  image: ({ props }) => {
    const src = safeImageSrc(props.src)
    if (!src) {
      return (
        <div
          className={`flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 text-sm text-muted-foreground ${str(props.className)}`}
          role="img"
          aria-label={str(props.alt) || 'Image unavailable'}
        >
          无效或不允许的图片地址
        </div>
      )
    }
    return (
      <img
        src={src}
        alt={str(props.alt)}
        className={`rounded-lg ${str(props.className)}`}
        style={{ width: str(props.width) || 'auto', height: str(props.height) || 'auto' }}
        loading="lazy"
        decoding="async"
      />
    )
  },

  // Icon
  icon: ({ props }) => (
    <span className={str(props.className)} style={{ fontSize: props.size ? `${props.size}px` : '24px' }}>
      {str(props.name) || '📌'}
    </span>
  ),

  // Divider
  divider: ({ props }) => (
    <hr className={`border-border ${str(props.className)}`} />
  ),

  // Spacer
  spacer: ({ props }) => (
    <div style={{ height: props.height ? `${props.height}px` : '16px' }} />
  ),

  // Metric/Stat
  metric: ({ props }) => {
    const change = props.change ? Number(props.change) : 0
    return (
      <div className={`rounded-lg border bg-card p-4 ${str(props.className)}`}>
        <p className="text-sm text-muted-foreground">{str(props.label)}</p>
        <p className="text-2xl font-bold">{str(props.value)}</p>
        {props.change ? (
          <p className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? '↑' : '↓'} {str(props.change)}
          </p>
        ) : null}
      </div>
    )
  },

  // Progress
  progress: ({ props }) => (
    <div className={`space-y-2 ${str(props.className)}`}>
      {props.label ? <p className="text-sm">{str(props.label)}</p> : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${Math.min(100, Math.max(0, Number(props.value) || 0))}%` }}
        />
      </div>
    </div>
  ),

  // List
  list: ({ props }) => {
    const items = props.items as Array<{ title: string; subtitle?: string }> | undefined
    return (
      <div className={str(props.className)}>
        {items && Array.isArray(items) ? items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 border-b py-2 last:border-0">
            {props.icon ? <span>{str(props.icon)}</span> : null}
            <div>
              <p className="font-medium">{str(item.title)}</p>
              {item.subtitle ? <p className="text-sm text-muted-foreground">{str(item.subtitle)}</p> : null}
            </div>
          </div>
        )) : null}
      </div>
    )
  },

  // Chart placeholder
  chart: ({ props }) => (
    <div className={`rounded-lg border bg-card p-4 ${str(props.className)}`}>
      <p className="mb-2 font-medium">{str(props.title) || 'Chart'}</p>
      <div className="flex h-32 items-center justify-center rounded bg-muted/50">
        <p className="text-muted-foreground">Chart: {str(props.type) || 'line'}</p>
      </div>
    </div>
  ),

  // ============================================================
  // Chat 消息卡片
  // ============================================================
  'financial-overview': FinancialOverviewCard,
  'file-preview': FilePreviewCard,
  'code-block': CodeBlockCard,

  // ============================================================
  // Dynamic Tool Chat Cards
  // ============================================================
  'metric-summary': MetricSummary,
  'status-badge': StatusBadge,
  'mini-list': MiniList,
  'quick-action': QuickAction,
  'chart-preview': ChartPreview,

  // ============================================================
  // Space 组件
  // ============================================================
  'bento-grid': BentoGrid,
  'bento-item': BentoItem,
  'financial-system': FinancialSystemCard,
  'file-manager': FileManagerCard,
  'insights-collection': InsightsCollectionCard,
  'task-tracker': TaskTrackerCard,

  // ============================================================
  // Dynamic Tool Space Components
  // ============================================================
  'metric-card': MetricCard,
  'line-chart': SpaceLineChart,
  'bar-chart': SpaceBarChart,
  'data-table': DataTable,
  'status-list': StatusList,
  'action-form': ActionForm,
  'calendar': SpaceCalendar,
  'kanban-board': KanbanBoard,
}

export function DynamicRenderer({ components }: DynamicRendererProps) {
  const renderComponent = (component: GeneratedComponent): ReactNode => {
    const Renderer = componentRegistry[component.type]

    if (!Renderer) {
      return (
        <div key={component.id} className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-muted-foreground">Unknown component: {component.type}</p>
        </div>
      )
    }

    const children = component.children?.map(renderComponent)

    return (
      <Renderer key={component.id} props={component.props} componentId={component.id}>
        {children as ReactNode}
      </Renderer>
    )
  }

  return (
    <div className="space-y-4">
      {components.map(renderComponent)}
    </div>
  )
}
