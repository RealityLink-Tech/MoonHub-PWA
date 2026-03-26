// ============================================================
// Chat Page
// AI对话页面 - 与参考项目完全一致
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  ArrowDown,
  FileText,
  Download,
  Plus,
  Mic,
  ArrowUp,
  File,
  Image,
  Camera,
  X,
} from 'lucide-react'
import { Header } from '@/components/ui/Header'
import { useChatStore } from '@/stores/chat'
import { nanoid } from 'nanoid'
import type { Message, MessageContent } from '@/types'

// Mock conversation ID for demo
const MOCK_CONVERSATION_ID = 'demo-conversation'

export function ChatPage({ onAddClick }: { onAddClick: () => void }) {
  const [inputValue, setInputValue] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isTyping, setTyping } = useChatStore()

  // Local messages state for demo (since store may be empty)
  const [localMessages, setLocalMessages] = useState<Message[]>([])

  // Combine store messages with local messages
  const allMessages = [...messages, ...localMessages]

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: nanoid(),
      conversationId: MOCK_CONVERSATION_ID,
      role: 'user',
      content: { type: 'text', text: inputValue.trim() },
      timestamp: Date.now(),
    }

    setLocalMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setTyping(true)

    // Mock AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: nanoid(),
        conversationId: MOCK_CONVERSATION_ID,
        role: 'assistant',
        content: {
          type: 'text',
          text: getMockResponse(inputValue.trim()),
        },
        timestamp: Date.now(),
      }
      setLocalMessages((prev) => [...prev, aiMessage])
      setTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileMessage: Message = {
      id: nanoid(),
      conversationId: MOCK_CONVERSATION_ID,
      role: 'user',
      content: {
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      timestamp: Date.now(),
    }

    setLocalMessages((prev) => [...prev, fileMessage])
    setShowAttachMenu(false)

    // Reset input
    e.target.value = ''

    // Mock AI response to file
    setTyping(true)
    setTimeout(() => {
      const aiMessage: Message = {
        id: nanoid(),
        conversationId: MOCK_CONVERSATION_ID,
        role: 'assistant',
        content: {
          type: 'text',
          text: `已收到您的文件「${file.name}」(${formatFileSize(file.size)})。这是一个 mock 响应，实际功能需要后端 API 支持。`,
        },
        timestamp: Date.now(),
      }
      setLocalMessages((prev) => [...prev, aiMessage])
      setTyping(false)
    }, 1500)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getMockResponse = (input: string): string => {
    const responses = [
      '收到您的消息，这是一个 mock 响应。后端 API 接入后将提供真实的 AI 对话能力。',
      '感谢您的提问！目前处于演示模式，无法提供真实回复。',
      '您说：「' + input.slice(0, 20) + '...」——我已记录，待后端接入后将智能回复。',
      '月枢正在待机中。请等待后端服务启动以获得完整的 AI 助手体验。',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
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
        {allMessages.length === 0 && (
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
          {/* Demo messages (static examples) */}
          {allMessages.length === 0 && (
            <>
              {/* User Message */}
              <div className="flex flex-col items-end space-y-2 group">
                <div className="bg-primary-container text-on-primary-container px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  <p className="text-sm">帮我整理一下上个月的财务报表，并预览那份关于"月之计划"的PDF文件。</p>
                </div>
                <span className="text-[10px] text-outline px-1 opacity-0 group-hover:opacity-100 transition-opacity">14:02 · 已发送</span>
              </div>

              {/* AI Response */}
              <div className="flex flex-col items-start space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary-dim flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white fill-white" />
                  </div>
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">月枢</span>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/10 p-5 rounded-2xl rounded-tl-sm shadow-sm space-y-4 max-w-[90%]">
                  <p className="text-sm text-on-surface leading-relaxed">好的。我已经同步了您的账户数据。这是上个月的**财务概览**以及您提到的**文件预览**。</p>

                  {/* Financial Overview Card */}
                  <div className="bg-surface-container-low rounded-xl p-4 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-base font-bold text-primary">财务概览</h4>
                      <span className="text-xs text-outline-variant">2023年10月</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg flex flex-col">
                        <span className="text-[11px] text-on-surface-variant">总支出</span>
                        <span className="text-lg font-bold text-primary">¥ 12,480.00</span>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg flex flex-col">
                        <span className="text-[11px] text-on-surface-variant">环比增长</span>
                        <span className="text-lg font-bold text-error flex items-center"><ArrowDown className="w-4 h-4 mr-1"/> 4.2%</span>
                      </div>
                    </div>
                    <div className="mt-3 h-12 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg flex items-center px-4 overflow-hidden relative">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,#506070,transparent)]"></div>
                      <span className="text-xs text-primary font-medium relative z-10">主要支出项：云服务、设计订阅</span>
                    </div>
                  </div>

                  {/* File Preview Card */}
                  <div className="bg-surface-container-lowest border border-primary-container/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center p-3 space-x-4">
                      <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center">
                        <FileText className="text-primary w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">月之计划_最终版_V2.pdf</p>
                        <p className="text-xs text-outline-variant">12.4 MB · 昨天 18:30 更新</p>
                      </div>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors">
                        <Download className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                    <div className="aspect-[16/6] bg-surface-container-high relative overflow-hidden group">
                      <img src="https://picsum.photos/seed/document/800/300?blur=2" alt="Preview" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
                      <div className="absolute bottom-2 right-2">
                        <span className="bg-white/80 backdrop-blur-md text-[10px] px-2 py-1 rounded-full text-primary border border-primary-container/20">预览模式</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Dynamic messages */}
          {allMessages.map(renderMessage)}

          {/* Typing indicator */}
          {isTyping && (
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
