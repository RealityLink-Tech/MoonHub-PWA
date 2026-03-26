// ============================================================
// Device Connection Page
// 设备连接/配对页面 - 与参考项目完全一致
// ============================================================

import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, HelpCircle, Router, Zap } from 'lucide-react'

export function DeviceConnectionPage({
  onBack,
  onFinish,
}: {
  onBack: () => void
  onFinish: () => void
}) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInput = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take the last character
    setCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - move to previous input if current is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      const newCode = [...code]
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newCode[i] = char
      })
      setCode(newCode)
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(pastedData.length, 5)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  const handleConnect = () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('请输入完整的 6 位授权码')
      return
    }

    // Mock connection success
    console.warn('Connecting with code:', fullCode)
    onFinish()
  }

  const isComplete = code.every(c => c !== '')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#506070]" />
          </button>
          <h1 className="text-lg tracking-wider font-light text-[#506070]">
            设备连接
          </h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors">
            <HelpCircle className="w-5 h-5 text-[#506070]" />
          </button>
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]"></div>
      </header>

      <main className="flex-grow pt-24 px-8 w-full max-w-md mx-auto flex flex-col items-center pb-8">
        <section className="w-full mb-12 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary-container blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <div className="relative w-32 h-32 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[0_0_40px_rgba(212,228,247,0.4)] border border-outline-variant/10">
              <Router className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-on-surface">
              Lunar Hub Pro
            </h2>
            <p className="text-sm text-on-surface-variant font-light mt-1 tracking-wide">
              等待授权连接...
            </p>
          </div>
        </section>

        <section className="w-full mb-8">
          <label className="block text-center text-xs uppercase tracking-[0.2em] text-outline mb-6">
            请输入 6 位授权码
          </label>
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {code.map((val, i) => (
              <div
                key={i}
                className="w-12 h-16 rounded-xl bg-surface-container-low border-b-2 border-outline-variant/30 flex items-center justify-center transition-all focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:shadow-[0_4px_12px_rgba(80,96,112,0.1)]"
              >
                <input
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  placeholder="·"
                  className="w-full h-full bg-transparent border-none text-center text-2xl font-medium text-primary focus:ring-0 outline-none caret-primary"
                />
              </div>
            ))}
          </div>
          {error && (
            <p className="mt-4 text-center text-sm text-error">{error}</p>
          )}
          <p className="mt-6 text-center text-sm text-outline-variant font-light flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-pulse"></span>
            授权码已发送至绑定的移动设备
          </p>
        </section>

        <section className="w-full mb-12 flex items-center justify-center gap-3">
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
          <span className="text-sm font-light text-on-surface-variant tracking-wide">
            记住此设备
          </span>
        </section>

        <section className="w-full">
          <button
            onClick={handleConnect}
            disabled={!isComplete}
            className={`w-full h-14 rounded-full font-medium tracking-widest text-lg transition-all flex items-center justify-center gap-3 ${
              isComplete
                ? 'bg-gradient-to-r from-primary to-primary-dim text-on-primary shadow-[0_8px_24px_rgba(80,96,112,0.25)] hover:shadow-[0_12px_32px_rgba(80,96,112,0.35)] active:scale-[0.98]'
                : 'bg-surface-container-high text-outline-variant cursor-not-allowed'
            }`}
          >
            <span>连接设备</span>
            <Zap className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={onBack}
            className="w-full h-14 mt-4 rounded-full border border-outline-variant/20 text-on-surface-variant font-light tracking-wide text-sm hover:bg-surface-container-low transition-colors"
          >
            重新扫描设备
          </button>
        </section>
      </main>

      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-primary-container/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] -left-[5%] w-[40%] h-[40%] bg-surface-container-highest/30 rounded-full blur-[80px]"></div>
      </div>
    </motion.div>
  )
}
