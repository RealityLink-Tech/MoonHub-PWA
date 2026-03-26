// ============================================================
// BottomNavBar Component
// 与参考项目完全一致
// ============================================================

import { MessageSquare, LayoutGrid, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavBarProps {
  current: string
  onChange: (_view: string) => void
}

export function BottomNavBar({ current, onChange }: BottomNavBarProps) {
  const tabs = [
    { id: 'chat', icon: MessageSquare, label: '对话' },
    { id: 'space', icon: LayoutGrid, label: '空间' },
    { id: 'account', icon: User, label: '账户' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-3 pb-8 px-8 bg-white/90 backdrop-blur-xl rounded-t-[32px] border-t border-slate-100/50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = current === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex flex-col items-center justify-center transition-all duration-500',
              isActive
                ? 'text-blue-500 drop-shadow-[0_0_12px_rgba(80,96,112,0.4)] -translate-y-1'
                : 'text-slate-400 hover:opacity-80'
            )}
          >
            <Icon
              className={cn('w-6 h-6 mb-1', isActive && 'fill-blue-500/20')}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
