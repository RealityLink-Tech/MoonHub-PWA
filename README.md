# MoonHub PWA

MoonHub PWA is a Progressive Web App for controlling MoonHub devices on your local network.

## Features

- 🔍 **Device Discovery** - Scan and find MoonHub devices on your local network
- 🔐 **Secure Connection** - Connect via authorization code for high-privilege operations
- 📱 **PWA Support** - Install as a native app on your phone
- 🌙 **Dark Theme** - Optimized for low-light environments
- 📡 **Offline Support** - Basic functionality works without internet

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   MoonHub PWA   │────▶│  MoonHub Device │
│   (This Repo)   │     │  (Local API)    │
└─────────────────┘     └─────────────────┘
        │
        ▼ CDN Hosted
   (HTTPS required
    for PWA)
```

**Security Model**: PWA only works when on the same local network as the device. Remote access is achieved through configured channels (Telegram, Discord, etc.).

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Tech Stack

- **React 19** - UI framework
- **Vite 8** - Build tool
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **vite-plugin-pwa** - PWA support
- **TanStack Router** - Routing
- **Lucide React** - Icons

## Project Structure

```
src/
├── api/              # API client for device communication
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── routes/          # Route definitions
└── store/           # State management
```

## Related Projects

- [MoonHub](https://github.com/RealityLink-Tech/MoonHub) - The main device firmware and backend

## License

MIT
