import type { ModelEntry } from '@/types/api'

/** Extract provider from model string: "openai/gpt-4o" -> "openai" */
export function extractProvider(model: string): string {
  const idx = model.indexOf('/')
  return idx >= 0 ? model.slice(0, idx).toLowerCase() : 'openai'
}

/** Group models by provider, preserving order */
export function groupModelsByProvider(models: ModelEntry[]): Map<string, ModelEntry[]> {
  const groups = new Map<string, ModelEntry[]>()
  for (const m of models) {
    const provider = extractProvider(m.model)
    if (!groups.has(provider)) groups.set(provider, [])
    groups.get(provider)!.push(m)
  }
  return groups
}

/** Human-readable provider names */
export function providerDisplayName(provider: string): string {
  const names: Record<string, string> = {
    openai: 'OpenAI', anthropic: 'Anthropic', zhipu: '智谱 AI', deepseek: 'DeepSeek',
    gemini: 'Google Gemini', qwen: '通义千问', moonshot: 'Moonshot', groq: 'Groq',
    openrouter: 'OpenRouter', nvidia: 'NVIDIA', ollama: 'Ollama (本地)',
    vllm: 'vLLM (本地)', cerebras: 'Cerebras', volcengine: '火山引擎',
    github_copilot: 'GitHub Copilot', copilot: 'GitHub Copilot',
    claude_cli: 'Claude CLI', claudecli: 'Claude CLI',
    codex_cli: 'Codex CLI', codexcli: 'Codex CLI',
    mistral: 'Mistral', minimax: 'MiniMax', longcat: 'LongCat',
    modelscope: '魔搭社区', litellm: 'LiteLLM', avian: 'Avian',
  }
  return names[provider] || provider.charAt(0).toUpperCase() + provider.slice(1)
}

/** Check if any model is configured */
export function hasAnyConfiguredModel(models: ModelEntry[]): boolean {
  return models.some(m => m.configured)
}

/** Check if a model needs an API key input */
export function needsApiKey(model: ModelEntry): boolean {
  const auth = (model.auth_method || '').toLowerCase()
  if (auth === 'oauth' || auth === 'token' || auth === 'local') return false
  const protocol = extractProvider(model.model)
  const cliProviders = ['claude-cli', 'claudecli', 'codex-cli', 'codexcli', 'copilot', 'github_copilot']
  if (cliProviders.includes(protocol)) return false
  return true
}
