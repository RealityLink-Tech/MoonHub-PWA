// ============================================================
// Device Discovery Page
// 设备发现/扫描页面 - 真实局域网扫描 + 响应式布局
// ============================================================

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Settings,
  RefreshCw,
  Radar,
  Router,
  PlusCircle,
  X,
  Loader2,
} from 'lucide-react'
import { useDeviceStore } from '@/stores'
import { getDiscovery } from '@/services/discovery'
import { createClient } from '@/services/device'
import type { Device } from '@/types'

export function DeviceDiscoveryPage({
  onBack,
  onConnect,
}: {
  onBack: () => void
  onConnect: (ip?: string) => void
}) {
  const [manualIP, setManualIP] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualConnecting, setManualConnecting] = useState(false)

  const {
    discoveredDevices,
    isScanning,
    scanProgress,
    setDiscoveredDevices,
    addDiscoveredDevice,
    setScanning,
    setScanProgress,
  } = useDeviceStore()

  // 自动开始扫描
  useEffect(() => {
    startScan()
  }, [])

  const startScan = async () => {
    setScanning(true)
    setDiscoveredDevices([])
    setScanProgress(null)

    try {
      const discovery = getDiscovery()
      const devices = await discovery.scan({
        onDeviceFound: (device) => addDiscoveredDevice(device),
        onProgress: (progress) => setScanProgress(progress),
      })
      setDiscoveredDevices(devices)
    } catch (_error) {
      // 扫描失败时保持空状态
      void _error
    } finally {
      setScanning(false)
    }
  }

  const handleManualConnect = async (ip: string) => {
    setManualConnecting(true)
    try {
      const client = createClient(`http://${ip}`)
      const response = await client.ping({ timeoutMs: 5000 })

      if (response.success) {
        const device: Device = {
          id: `device_${ip.replace(/[.:]/g, '_')}`,
          name: response.data?.name || 'MoonHub Device',
          address: ip,
          version: response.data?.version || 'unknown',
          status: 'online',
          lastSeen: Date.now(),
          capabilities: ['chat', 'voice', 'image', 'space', 'tools'],
        }
        addDiscoveredDevice(device)
        onConnect(ip)
      } else {
        // 连接失败，仍然尝试连接（可能设备存在但认证需要）
        onConnect(ip)
      }
    } catch (_error) {
      // 连接失败，仍然尝试
      void _error
      onConnect(ip)
    } finally {
      setManualConnecting(false)
      setManualIP('')
      setShowManualInput(false)
    }
  }

  const getDeviceIcon = (device: Device) => {
    if (device.name.includes('监控') || device.name.includes('Camera')) {
      return Router
    }
    return Router
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors"
          >
            <Settings className="w-5 h-5 text-[#506070]" />
          </button>
          <h1 className="text-lg tracking-wider font-light text-[#506070]">
            设备发现
          </h1>
          <button
            onClick={startScan}
            disabled={isScanning}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-[#506070] ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]"></div>
      </header>

      <main className="pt-24 px-6 max-w-6xl mx-auto min-h-screen pb-12 w-full">
        <section className="flex flex-col items-center justify-center py-12 mb-8">
          <div className="relative flex items-center justify-center w-48 h-48">
            <div className={`absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary-container to-surface-container-high shadow-[0_0_0_0_rgba(176,196,222,0.4)] ${isScanning ? 'animate-[pulse_3s_infinite_cubic-bezier(0.4,0,0.6,1)]' : ''} flex items-center justify-center z-10`}>
              <Radar className={`w-8 h-8 text-primary ${isScanning ? 'animate-spin-slow' : ''}`} />
            </div>
            <div className="absolute w-36 h-36 rounded-full border border-primary-container/30"></div>
            <div className="absolute w-48 h-48 rounded-full border border-primary-container/10"></div>
          </div>
          <div className="mt-10 text-center">
            <p className="text-on-surface-variant text-sm font-light tracking-[0.2em]">
              {isScanning ? '正在扫描局域网内设备...' : discoveredDevices.length > 0 ? '扫描完成' : '未发现设备'}
            </p>
            {scanProgress && (
              <p className="text-xs text-outline mt-2 font-mono">
                {scanProgress.scanned} / {scanProgress.total} IP地址已扫描
              </p>
            )}
            <div className="flex justify-center gap-1 mt-3">
              <span className={`w-1 h-1 rounded-full bg-primary/40 ${isScanning ? 'animate-pulse' : ''}`}></span>
              <span className={`w-1 h-1 rounded-full bg-primary/20 ${isScanning ? 'animate-pulse delay-75' : ''}`}></span>
              <span className={`w-1 h-1 rounded-full bg-primary/10 ${isScanning ? 'animate-pulse delay-150' : ''}`}></span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-sm font-medium text-primary tracking-wide">
              已发现设备 ({discoveredDevices.length})
            </h2>
            <span className="text-[10px] text-outline-variant uppercase tracking-tighter">
              Nearby Devices
            </span>
          </div>

          <AnimatePresence>
            {discoveredDevices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {discoveredDevices.map((device, index) => {
                  const DeviceIcon = getDeviceIcon(device)
                  return (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onConnect(device.address)}
                      className="group relative overflow-hidden p-5 rounded-xl bg-surface-container-low transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-[0_12px_40px_rgba(80,96,112,0.06)] flex items-center gap-4 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary transition-colors group-hover:bg-primary-container">
                        <DeviceIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-on-surface font-medium text-[15px] truncate">
                          {device.name}
                        </h3>
                        <p className="text-outline text-xs mt-1 font-mono tracking-tight">
                          {device.address}
                        </p>
                        {device.version && (
                          <p className="text-outline-variant text-[10px] mt-0.5">
                            v{device.version}
                          </p>
                        )}
                      </div>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-outline-variant hover:text-primary hover:bg-primary-container/30 transition-all flex-shrink-0">
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-outline text-sm">
                  {isScanning ? '正在搜索设备...' : '未发现设备，请点击右上角刷新按钮重新扫描'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 flex flex-col items-center">
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-xs text-primary/70 hover:text-primary transition-colors font-light tracking-widest border-b border-primary/20 pb-0.5"
            >
              手动输入IP添加设备
            </button>
            <AnimatePresence>
              {showManualInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 w-full max-w-md"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualIP}
                      onChange={(e) => setManualIP(e.target.value)}
                      placeholder="192.168.1.100:8080"
                      className="flex-1 px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && manualIP.trim() && !manualConnecting) {
                          handleManualConnect(manualIP.trim())
                        }
                      }}
                      disabled={manualConnecting}
                    />
                    <button
                      onClick={() => {
                        if (manualIP.trim() && !manualConnecting) {
                          handleManualConnect(manualIP.trim())
                        }
                      }}
                      disabled={manualConnecting || !manualIP.trim()}
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {manualConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          连接中
                        </>
                      ) : (
                        '连接'
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-outline-variant mt-2 text-center">
                    格式：IP地址或 IP:端口（如 192.168.1.100:8080）
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </motion.div>
  )
}
