import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wifi, Search, Settings, MessageCircle } from 'lucide-react'

function App() {
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<string[]>([])

  const handleScan = async () => {
    setIsScanning(true)
    // TODO: Implement local network device scanning
    setTimeout(() => {
      setDevices(['192.168.1.100:8080', '192.168.1.101:8080'])
      setIsScanning(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-semibold">MoonHub</span>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Scan Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Local Devices</h2>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              variant="outline"
              size="sm"
            >
              <Search className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>

          {/* Device List */}
          <div className="space-y-3">
            {devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-card/50 py-12">
                <Wifi className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No devices found
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Make sure your device is on the same network
                </p>
              </div>
            ) : (
              devices.map((device, index) => (
                <div
                  key={device}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">MoonHub Device {index + 1}</p>
                      <p className="text-sm text-muted-foreground">{device}</p>
                    </div>
                  </div>
                  <Button size="sm">Connect</Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Settings className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">Channels</span>
            </Button>
          </div>
        </div>

        {/* Install PWA Prompt */}
        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-6">
          <h3 className="mb-2 font-semibold">Install MoonHub PWA</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Add MoonHub to your home screen for quick access to your devices.
          </p>
          <Button size="sm">Install App</Button>
        </div>
      </main>
    </div>
  )
}

export default App
