// ============================================================
// Generated Card Component
// Renders AI-generated cards with different types
// ============================================================

import type { ReactNode } from 'react'

interface GeneratedCardProps {
  cardType: string
  data: Record<string, unknown>
}

// Helper to safely render unknown values
const renderSafe = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

// Helper to check if value is truthy
const hasValue = (value: unknown): boolean => {
  return value !== null && value !== undefined && value !== ''
}

// Card type renderers
const cardRenderers: Record<string, (data: Record<string, unknown>) => ReactNode> = {
  // Weather card
  weather: (data) => {
    const forecast = data.forecast as Array<{ day: string; temp: string; icon: string }> | undefined
    return (
      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{renderSafe(data.temp)}°</p>
            <p className="text-sm opacity-80">{renderSafe(data.condition)}</p>
          </div>
          <div className="text-4xl">{renderSafe(data.icon) || '🌤️'}</div>
        </div>
        {forecast && Array.isArray(forecast) && forecast.length > 0 ? (
          <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
            {forecast.map((day, i) => (
              <div key={i}>
                <p>{renderSafe(day.day)}</p>
                <p className="text-lg">{renderSafe(day.icon)}</p>
                <p>{renderSafe(day.temp)}°</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  },

  // Code card
  code: (data) => (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs text-muted-foreground">{renderSafe(data.language) || 'code'}</span>
        <button
          onClick={() => navigator.clipboard.writeText(renderSafe(data.code))}
          className="text-xs text-primary"
        >
          复制
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm">
        <code>{renderSafe(data.code)}</code>
      </pre>
    </div>
  ),

  // List card
  list: (data) => {
    const items = data.items as Array<{ title: string; description?: string }> | undefined
    const hasTitle = hasValue(data.title)
    return (
      <div className="rounded-lg border bg-card p-4">
        {hasTitle ? <h3 className="mb-2 font-medium">{renderSafe(data.title)}</h3> : null}
        <ul className="space-y-2">
          {items && Array.isArray(items) && items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              <div>
                <p className="font-medium">{renderSafe(item.title)}</p>
                {hasValue(item.description) ? (
                  <p className="text-sm text-muted-foreground">{renderSafe(item.description)}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  },

  // Link card
  link: (data) => {
    const hasImage = hasValue(data.image)
    const hasDescription = hasValue(data.description)
    return (
      <a
        href={renderSafe(data.url)}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
      >
        {hasImage ? (
          <img
            src={renderSafe(data.image)}
            alt=""
            className="mb-2 h-32 w-full rounded object-cover"
          />
        ) : null}
        <h3 className="font-medium">{renderSafe(data.title)}</h3>
        {hasDescription ? (
          <p className="mt-1 text-sm text-muted-foreground">{renderSafe(data.description)}</p>
        ) : null}
        <p className="mt-2 text-xs text-primary">
          {hasValue(data.url) ? new URL(renderSafe(data.url)).hostname : ''}
        </p>
      </a>
    )
  },

  // Status card
  status: (data) => {
    const hasMessage = hasValue(data.message)
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              data.status === 'success'
                ? 'bg-green-500'
                : data.status === 'error'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
          />
          <div>
            <p className="font-medium">{renderSafe(data.title)}</p>
            {hasMessage ? (
              <p className="text-sm text-muted-foreground">{renderSafe(data.message)}</p>
            ) : null}
          </div>
        </div>
      </div>
    )
  },
}

export function GeneratedCard({ cardType, data }: GeneratedCardProps) {
  const renderer = cardRenderers[cardType]

  if (renderer) {
    return <div className="my-2">{renderer(data)}</div>
  }

  // Default card for unknown types
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="mb-2 text-xs text-muted-foreground">Card: {cardType}</p>
      <pre className="overflow-x-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
