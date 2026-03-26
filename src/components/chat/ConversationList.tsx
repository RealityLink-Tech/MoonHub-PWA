// ============================================================
// Conversation List Component
// Sidebar list of conversations
// ============================================================

import type { Conversation } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus, MessageCircle, Trash2 } from 'lucide-react'

interface ConversationListProps {
  conversations: Conversation[]
  currentId?: string | null
  onSelect: (_id: string) => void
  onDelete: (_id: string) => void
  onNew: () => void
}

export function ConversationList({
  conversations,
  currentId,
  onSelect,
  onDelete,
  onNew,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-semibold">对话列表</h2>
        <Button onClick={onNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          新对话
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">暂无对话</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between rounded-lg p-3 transition-colors ${
                  currentId === conv.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  className="flex-1 text-left"
                >
                  <p className="truncate font-medium">{conv.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.lastMessage || '暂无消息'}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(conv.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
