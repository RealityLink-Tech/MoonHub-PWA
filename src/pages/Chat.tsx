// ============================================================
// Chat Page
// AI对话页面 - 与参考项目完全一致
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  Plus,
  Mic,
  ArrowUp,
  File,
  Image,
  Camera,
  X,
} from 'lucide-react'
import { Header } from '@/components/ui/Header'
import { getClient, type PicoWebSocket } from '@/services/device'
import { useChatStore } from '@/stores/chat'
import { ToolStatusIndicator } from '@/components/chat/ToolStatusIndicator'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import type { Message, MessageContent } from '@/types'

export function ChatPage({ onAddClick }: { onAddClick: () => void }) {
  const [inputValue, setInputValue] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const picoWsRef = useRef<PicoWebSocket | null>(null)

  const {
    messages,
    currentConversationId,
    isStreaming,
    streamingContent,
    toolStatus,
    addMessage,
    setStreaming,
    setToolStatus,
    appendStreamContent,
    finalizeStream,
    clearStream,
    createConversation,
  } = useChatStore()

  // Auto scroll to bottom when new messages arrive or streaming content changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, streamingContent])

  // Connect to Pico WebSocket on mount
  useEffect(() => {
    const client = getClient()
    if (!client) return

    let sessionId = currentConversationId

    // Create a conversation if none exists
    async function ensureConversation() {
      if (!sessionId) {
        const conversation = await createConversation('local-device')
        sessionId = conversation.id
      }
      try {
        const ws = client!.connectPico(sessionId)
        picoWsRef.current = ws

        ws.onAgentEvent(({ kind, payload }) => {
          switch (kind) {
            case 'agent.tool_start':
              setToolStatus(payload.tool_name as string, 'running')
              break
            case 'agent.tool_end':
              setToolStatus(
                payload.tool_name as string,
                payload.success ? 'done' : 'error',
              )
              break
            case 'agent.content_start':
              setStreaming(true)
              break
            case 'agent.content_chunk':
              if (payload.done) {
                finalizeStream()
              } else {
                setStreaming(true)
                appendStreamContent(payload.content as string)
              }
              break
            case 'agent.done':
              finalizeStream()
              break
            case 'agent.error':
              clearStream()
              break
          }
        })
      } catch {
        // Connection failed - user can retry by sending a message
      }
    }

    ensureConversation()

    return () => {
      client.disconnectPico()
      picoWsRef.current = null
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return

    const text = inputValue.trim()
    setInputValue('')

    // Ensure we have a conversation and send via WebSocket
    let convId = currentConversationId
    if (!convId) {
      const conversation = await createConversation('local-device')
      convId = conversation.id
    }

    // Add user message to store
    await addMessage({
      conversationId: convId,
      role: 'user',
      content: { type: 'text', text },
    })

    // Send via WebSocket
    const ws = picoWsRef.current
    if (ws) {
      ws.sendMessage(text)
    } else {
      // Try to reconnect
      const client = getClient()
      if (client) {
        try {
          const newWs = client.connectPico(convId)
          picoWsRef.current = newWs

          newWs.onAgentEvent(({ kind, payload }) => {
            switch (kind) {
              case 'agent.tool_start':
                setToolStatus(payload.tool_name as string, 'running')
                break
              case 'agent.tool_end':
                setToolStatus(
                  payload.tool_name as string,
                  payload.success ? 'done' : 'error',
                )
                break
              case 'agent.content_start':
                setStreaming(true)
                break
              case 'agent.content_chunk':
                if (payload.done) {
                  finalizeStream()
                } else {
                  setStreaming(true)
                  appendStreamContent(payload.content as string)
                }
                break
              case 'agent.done':
                finalizeStream()
                break
              case 'agent.error':
                clearStream()
                break
            }
          })

          newWs.sendMessage(text)
        } catch {
          // Connection failed
        }
      }
    }
  }, [
    inputValue,
    currentConversationId,
    addMessage,
    createConversation,
    setStreaming,
    setToolStatus,
    appendStreamContent,
    finalizeStream,
    clearStream,
  ])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, just note the file in a message
    // Full file upload will be handled via WebSocket in a future iteration
    const fileMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: currentConversationId || 'temp',
      role: 'user',
      content: {
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      timestamp: Date.now(),
    }

    // We can't add to store without a conversation, so just show locally
    // This will be properly integrated once file upload via WS is supported
    setShowAttachMenu(false)
    e.target.value = ''
    void fileMessage
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'
    const content = message.content

    return (
      <div
        key={message.id}
        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2 group`}
      >
        {isUser ? (
          // User message
          <div className="bg-primary-container text-on-primary-container px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
            {renderContent(content)}
          </div>
        ) : (
          // AI message
          <>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary-dim flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white fill-white" />
              </div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase">月枢</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-5 rounded-2xl rounded-tl-sm shadow-sm max-w-[90%]">
              {renderContent(content)}
            </div>
          </>
        )}
        <span className="text-[10px] text-outline px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · 已发送
        </span>
      </div>
    )
  }

  const renderContent = (content: MessageContent) => {
    switch (content.type) {
      case 'text':
        return <p className="text-sm">{content.text}</p>
      case 'file':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/60 rounded-lg flex items-center justify-center">
              <File className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{content.fileName}</p>
              <p className="text-xs text-on-surface-variant">{formatFileSize(content.fileSize)}</p>
            </div>
          </div>
        )
      case 'image':
        return (
          <div className="max-w-[200px]">
            {content.url && <img src={content.url} alt={content.caption || ''} className="rounded-lg" />}
            {content.caption && <p className="text-xs mt-1 text-on-surface-variant">{content.caption}</p>}
          </div>
        )
      default:
        return <p className="text-sm text-on-surface-variant">[不支持的消息类型]</p>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-screen"
    >
      <Header showAdd={true} onAddClick={onAddClick} />

      <main className="flex-1 pt-20 pb-32 px-4 md:px-0 max-w-3xl mx-auto w-full overflow-y-auto hide-scrollbar">
        {/* AI Welcome - only show when no messages */}
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center shadow-[0_0_25px_rgba(212,228,247,0.4)]">
              <Sparkles className="text-white w-8 h-8 fill-white/50" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-primary tracking-tight">你好，我是月枢</h2>
              <p className="text-on-surface-variant text-sm">光影汇聚，智慧流转。我能为你做些什么？</p>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-8">
          {/* Messages from store */}
          {messages.map(renderMessage)}

          {/* Streaming message */}
          {isStreaming && streamingContent && (
            <div className="flex flex-col items-start space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary-dim flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase">月枢</span>
              </div>
              <StreamingMessage content={streamingContent} />
            </div>
          )}

          {/* Tool status indicator */}
          {toolStatus && (
            <div className="flex flex-col items-start space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary-dim flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase">月枢</span>
              </div>
              <ToolStatusIndicator
                toolName={toolStatus.name}
                status={toolStatus.status}
              />
            </div>
          )}

          {/* Typing indicator - show when streaming just started with no content yet */}
          {isStreaming && !streamingContent && (
            <div className="flex flex-col items-start space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary-dim flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase">月枢</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 w-full bg-white/60 backdrop-blur-xl z-40 pb-[88px] pt-4 px-4 md:px-0">
        <div className="max-w-3xl mx-auto relative">
          {/* Attachment Menu */}
          <AnimatePresence>
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-outline-variant/10 p-2 min-w-[160px]"
              >
                <button
                  onClick={() => {
                    fileInputRef.current?.click()
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  <File className="w-5 h-5 text-primary" />
                  <span className="text-sm text-on-surface">选择文件</span>
                </button>
                <button
                  onClick={() => {
                    imageInputRef.current?.click()
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  <Image className="w-5 h-5 text-primary" />
                  <span className="text-sm text-on-surface">选择图片</span>
                </button>
                <button
                  onClick={() => {
                    cameraInputRef.current?.click()
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="text-sm text-on-surface">拍照</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="*/*"
            onChange={handleFileSelect}
          />
          <input
            ref={cameraInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />

          <div className="flex items-center space-x-3 bg-surface-container-low/80 p-2 rounded-full border border-white/50 shadow-lg shadow-primary/5">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${
                showAttachMenu
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:bg-white/80'
              }`}
            >
              {showAttachMenu ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问问月枢..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-outline-variant px-2 outline-none"
            />
            <div className="flex items-center space-x-2 pr-1">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-white/80 transition-all active:scale-95">
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-md active:scale-95 ${
                  inputValue.trim()
                    ? 'bg-primary text-white hover:bg-primary-dim'
                    : 'bg-surface-container-high text-outline-variant'
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-3 space-x-3 overflow-x-auto hide-scrollbar whitespace-nowrap">
            {['总结今日要点', '生成月度报表', '搜索历史记录'].map(chip => (
              <span
                key={chip}
                onClick={() => setInputValue(chip)}
                className="px-3 py-1 bg-white/40 border border-outline-variant/10 rounded-full text-[11px] text-on-surface-variant hover:bg-primary-container/30 cursor-pointer transition-colors"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
