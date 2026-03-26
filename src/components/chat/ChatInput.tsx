// ============================================================
// Chat Input Component
// Text, voice, and image input
// ============================================================

import { useState, useRef, useCallback } from 'react'
import { useVoice } from '@/hooks/useVoice'
import { Button } from '@/components/ui/button'
import {
  Send,
  Mic,
  MicOff,
  Image,
  X,
  Loader2,
} from 'lucide-react'

interface ChatInputProps {
  onSend: (_text: string, _images?: string[], _audio?: string) => void
  disabled?: boolean
  isStreaming?: boolean
}

export function ChatInput({ onSend, disabled, isStreaming }: ChatInputProps) {
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [audioBase64, setAudioBase64] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const voice = useVoice()

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  // Handle send
  const handleSend = () => {
    if (!text.trim() && !images.length && !audioBase64) return
    onSend(text, images, audioBase64 || undefined)
    setText('')
    setImages([])
    setAudioBase64(null)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle voice recording
  const handleVoiceRecord = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      const blob = await voice.stopRecording()
      if (blob) {
        const base64 = await voice.blobToBase64(blob)
        setAudioBase64(base64)
      }
      setIsRecording(false)
    } else {
      // Start recording
      const started = await voice.startRecording()
      if (started) {
        setIsRecording(true)
        setAudioBase64(null)
      }
    }
  }, [isRecording, voice])

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        setImages((prev) => [...prev, base64])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Remove audio
  const removeAudio = () => {
    setAudioBase64(null)
  }

  return (
    <div className="border-t bg-card p-4">
      {/* Preview images */}
      {images.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={`data:image/jpeg;base64,${img}`}
                alt={`图片 ${index + 1}`}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview audio */}
      {audioBase64 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted p-2">
          <div className="flex-1 text-sm">🎤 语音消息</div>
          <button
            onClick={removeAudio}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Image button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isStreaming}
        >
          <Image className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            placeholder={isStreaming ? 'AI 正在回复...' : '输入消息...'}
            disabled={disabled || isStreaming}
            className="w-full rounded-full border bg-background px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Voice button */}
        <Button
          variant={isRecording ? 'default' : 'ghost'}
          size="icon"
          onClick={handleVoiceRecord}
          disabled={disabled || isStreaming}
          className={isRecording ? 'animate-pulse bg-red-500' : ''}
        >
          {isRecording ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || isStreaming || (!text.trim() && !images.length && !audioBase64)}
          size="icon"
        >
          {isStreaming ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-red-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          正在录音...
        </div>
      )}
    </div>
  )
}
