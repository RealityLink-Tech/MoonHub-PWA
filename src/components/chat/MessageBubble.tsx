// ============================================================
// Message Bubble Component
// Renders chat messages with different content types
// 支持 DynamicRenderer 渲染卡片
// ============================================================

import type { Message } from '@/types'
import { DynamicRenderer } from '@/components/space/DynamicRenderer'
import type { GeneratedComponent } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const renderContent = () => {
    const { content } = message

    switch (content.type) {
      case 'text':
        return (
          <p className="whitespace-pre-wrap break-words">{content.text}</p>
        )

      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={content.base64 ? `data:image/jpeg;base64,${content.base64}` : content.url}
              alt={content.caption || '图片'}
              className="max-h-64 rounded-lg"
            />
            {content.caption && (
              <p className="text-sm text-muted-foreground">{content.caption}</p>
            )}
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-2">
            <audio
              controls
              src={content.base64 ? `data:audio/webm;base64,${content.base64}` : content.url}
              className="h-8 w-full"
            />
            {content.transcription && (
              <p className="text-sm text-muted-foreground">{content.transcription}</p>
            )}
          </div>
        )

      case 'card':
        // 使用 DynamicRenderer 渲染卡片
        const cardComponent: GeneratedComponent = {
          id: message.id,
          type: content.cardType,
          props: content.data,
        }
        return <DynamicRenderer components={[cardComponent]} />

      case 'space':
        return (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium">Space: {content.spaceId}</p>
            <p className="text-xs text-muted-foreground">
              {content.components.length} 个组件
            </p>
          </div>
        )

      default:
        return <p className="text-muted-foreground">[不支持的消息类型]</p>
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container-low'
        }`}
      >
        {renderContent()}
        <p
          className={`mt-1 text-xs ${
            isUser ? 'text-on-primary/70' : 'text-on-surface-variant'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
