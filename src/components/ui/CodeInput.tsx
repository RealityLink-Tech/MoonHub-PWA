// ============================================================
// CodeInput Component
// 6位授权码输入框
// ============================================================

import { useRef, useState, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface CodeInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
}

export function CodeInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
}: CodeInputProps) {
  const [codes, setCodes] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Sync with external value (microtask defers setState out of effect sync body)
  useEffect(() => {
    if (!value || value.length > length) return
    const newCodes = value.split('').concat(Array(length - value.length).fill(''))
    queueMicrotask(() => setCodes(newCodes))
  }, [value, length])

  // Handle input change
  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return

    // Only allow single character
    const char = inputValue.slice(-1).toUpperCase()
    if (!/^[A-Z0-9]$/.test(char) && char !== '') return

    const newCodes = [...codes]
    newCodes[index] = char
    setCodes(newCodes)

    const newValue = newCodes.join('')
    onChange?.(newValue)

    // Auto focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    if (newValue.length === length && !newValue.includes('')) {
      onComplete?.(newValue)
    }
  }

  // Handle key down
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    // Backspace - move to previous input
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Arrow keys navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, length)
    const filteredData = pastedData.split('').filter((char) => /^[A-Z0-9]$/.test(char))

    if (filteredData.length > 0) {
      const newCodes = [...codes]
      filteredData.forEach((char, i) => {
        if (i < length) newCodes[i] = char
      })
      setCodes(newCodes)

      const newValue = newCodes.join('')
      onChange?.(newValue)

      // Focus the next empty input or the last input
      const nextEmptyIndex = newCodes.findIndex((code) => !code)
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[length - 1]?.focus()
        if (newValue.length === length) {
          onComplete?.(newValue)
        }
      }
    }
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {codes.map((code, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          value={code}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'h-14 w-11 rounded-xl text-center text-2xl font-semibold',
            'bg-surface-container-lowest border-2 transition-all',
            'focus:outline-none focus:ring-0',
            error
              ? 'border-destructive text-destructive'
              : codes[index]
                ? 'border-primary bg-primary-container/30 text-primary'
                : 'border-outline-variant focus:border-primary',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
      ))}
    </div>
  )
}
