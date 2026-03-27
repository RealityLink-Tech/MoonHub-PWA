import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

const TOOL_LABELS: Record<string, string> = {
  web_search: 'Searching the web...',
  web_fetch: 'Reading page...',
  file_read: 'Reading file...',
  read_file: 'Reading file...',
  write_file: 'Writing file...',
  edit_file: 'Editing file...',
  append_file: 'Appending to file...',
  list_dir: 'Listing directory...',
  exec: 'Running command...',
  send_file: 'Sending file...',
  memory: 'Accessing memory...',
  cron: 'Managing scheduled tasks...',
  find_skills: 'Searching skills...',
  install_skill: 'Installing skill...',
  spawn: 'Spawning subagent...',
}

function getToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] || `Running ${toolName}...`
}

interface ToolStatusIndicatorProps {
  toolName: string
  status: 'running' | 'done' | 'error'
}

export function ToolStatusIndicator({ toolName, status }: ToolStatusIndicatorProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (status !== 'running') {
      const timer = setTimeout(() => setVisible(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [status])

  if (!visible) return null

  const label = getToolLabel(toolName)

  return (
    <div className="flex items-center gap-2 rounded-full bg-muted/80 px-3 py-1.5 text-xs text-muted-foreground">
      {status === 'running' && (
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
      )}
      {status === 'done' && (
        <CheckCircle2 className="h-3 w-3 text-green-500" />
      )}
      {status === 'error' && (
        <XCircle className="h-3 w-3 text-destructive" />
      )}
      <span>{label}</span>
    </div>
  )
}
