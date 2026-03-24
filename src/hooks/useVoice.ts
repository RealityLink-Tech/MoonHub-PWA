// ============================================================
// useVoice Hook
// Voice recognition and synthesis
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react'
import { getVoice } from '@/services/voice'

export function useVoice() {
  const voice = getVoice()

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const audioRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Check support
  const isRecognitionSupported = voice.isRecognitionSupported()
  const isSynthesisSupported = voice.isSynthesisSupported()

  // Start listening
  const startListening = useCallback(() => {
    if (!isRecognitionSupported) {
      setError('浏览器不支持语音识别')
      return
    }

    setError(null)
    setTranscript('')
    setInterimTranscript('')

    voice.startRecognition({
      continuous: false,
      interimResults: true,
      language: 'zh-CN',
      onResult: (text, isFinal) => {
        if (isFinal) {
          setTranscript(text)
          setInterimTranscript('')
        } else {
          setInterimTranscript(text)
        }
      },
      onError: (err) => {
        setError(err)
        setIsListening(false)
      },
      onEnd: () => {
        setIsListening(false)
      },
    })

    setIsListening(true)
  }, [
    isRecognitionSupported,
    voice,
    setError,
    setTranscript,
    setInterimTranscript,
    setIsListening,
  ])

  // Stop listening
  const stopListening = useCallback(() => {
    voice.stopRecognition()
    setIsListening(false)
  }, [voice, setIsListening])

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Speak text
  const speak = useCallback(
    (text: string) => {
      if (!isSynthesisSupported) {
        setError('浏览器不支持语音合成')
        return
      }

      voice.speak(text, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: (err) => {
          setError(err)
          setIsSpeaking(false)
        },
      })
    },
    [isSynthesisSupported, voice, setError, setIsSpeaking]
  )

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    voice.stopSpeaking()
    setIsSpeaking(false)
  }, [voice, setIsSpeaking])

  // Start audio recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.start()
      audioRecorderRef.current = recorder

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法启动录音')
      return false
    }
  }, [setError])

  // Stop recording and get blob
  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = audioRecorderRef.current
      if (!recorder) {
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        recorder.stream.getTracks().forEach((track) => track.stop())
        audioRecorderRef.current = null
        resolve(blob)
      }

      recorder.stop()
    })
  }, [])

  // Get available voices
  const getVoices = useCallback(() => voice.getVoices(), [voice])

  // Convert blob to base64
  const blobToBase64 = useCallback(
    (blob: Blob): Promise<string> => voice.blobToBase64(blob),
    [voice]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voice.stopRecognition()
      voice.stopSpeaking()
    }
  }, [voice])

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    isRecognitionSupported,
    isSynthesisSupported,

    // Actions
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    startRecording,
    stopRecording,
    getVoices,
    blobToBase64,
  }
}
