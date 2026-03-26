// ============================================================
// Voice Service
// Handles speech recognition and synthesis
// ============================================================

export interface VoiceRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (_transcript: string, _isFinal: boolean) => void
  onError?: (_error: string) => void
  onEnd?: () => void
}

export interface VoiceSynthesisOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice
  onStart?: () => void
  onEnd?: () => void
  onError?: (_error: string) => void
}

export class VoiceService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis
  private isListening = false
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    this.synthesis = window.speechSynthesis

    // Check for browser support
    if (this.isRecognitionSupported()) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
    }
  }

  // ==================== Recognition ====================

  isRecognitionSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }

  startRecognition(options: VoiceRecognitionOptions = {}): void {
    if (!this.recognition) {
      options.onError?.('Speech recognition not supported')
      return
    }

    if (this.isListening) {
      this.stopRecognition()
    }

    this.recognition.continuous = options.continuous ?? false
    this.recognition.interimResults = options.interimResults ?? true
    this.recognition.lang = options.language ?? 'zh-CN'

    this.recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        options.onResult?.(finalTranscript, true)
      } else if (interimTranscript) {
        options.onResult?.(interimTranscript, false)
      }
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      options.onError?.(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      options.onEnd?.()
    }

    try {
      this.recognition.start()
      this.isListening = true
    } catch (error) {
      options.onError?.(error instanceof Error ? error.message : 'Failed to start recognition')
    }
  }

  stopRecognition(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getIsListening(): boolean {
    return this.isListening
  }

  // ==================== Synthesis ====================

  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices()
  }

  speak(text: string, options: VoiceSynthesisOptions = {}): void {
    if (!this.isSynthesisSupported()) {
      options.onError?.('Speech synthesis not supported')
      return
    }

    // Cancel any ongoing speech
    this.stopSpeaking()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate ?? 1
    utterance.pitch = options.pitch ?? 1
    utterance.volume = options.volume ?? 1

    if (options.voice) {
      utterance.voice = options.voice
    }

    utterance.onstart = () => options.onStart?.()
    utterance.onend = () => {
      this.currentUtterance = null
      options.onEnd?.()
    }
    utterance.onerror = (event) => {
      this.currentUtterance = null
      options.onError?.(event.error)
    }

    this.currentUtterance = utterance
    this.synthesis.speak(utterance)
  }

  stopSpeaking(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel()
    }
    this.currentUtterance = null
  }

  pauseSpeaking(): void {
    this.synthesis.pause()
  }

  resumeSpeaking(): void {
    this.synthesis.resume()
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking
  }

  // ==================== Audio Recording ====================

  async startAudioRecording(): Promise<MediaRecorder | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      return recorder
    } catch (error) {
      console.error('Failed to start audio recording:', error)
      return null
    }
  }

  async recordAudio(maxDuration = 60000): Promise<Blob | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      return await new Promise<Blob | null>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          stream.getTracks().forEach((track) => track.stop())
          resolve(blob)
        }

        recorder.start()

        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop()
          }
        }, maxDuration)
      })
    } catch (error) {
      console.error('Failed to record audio:', error)
      return null
    }
  }

  // ==================== Utility ====================

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // Remove data URL prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

// Singleton instance
let voiceInstance: VoiceService | null = null

export function getVoice(): VoiceService {
  if (!voiceInstance) {
    voiceInstance = new VoiceService()
  }
  return voiceInstance
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
