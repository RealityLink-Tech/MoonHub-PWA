// ============================================================
// Streaming Message Component
// Shows streaming AI response
// ============================================================

interface StreamingMessageProps {
  content: string
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2">
        <p className="whitespace-pre-wrap break-words">
          {content}
          <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary" />
        </p>
      </div>
    </div>
  )
}
