// ============================================================
// Mock Service
// 模拟数据和 AI 响应
// ============================================================

// 模拟用户数据
export const mockUser = {
  id: 'lunar_293847',
  name: '林月瑶',
  avatar: 'https://picsum.photos/seed/avatar/200/200',
  activeDays: 128,
  verified: true,
}


// 模拟聊天消息
export const mockChatMessages = [
  {
    id: '1',
    role: 'user' as const,
    content: '帮我整理一下上个月的财务报表，并预览那份关于"月之计划"的PDF文件。',
    timestamp: Date.now() - 300000,
  },
  {
    id: '2',
    role: 'assistant' as const,
    content: '好的。我已经同步了您的账户数据。这是上个月的**财务概览**以及您提到的**文件预览**。',
    timestamp: Date.now() - 295000,
    cards: [
      {
        type: 'financial-overview',
        data: {
          title: '财务概览',
          period: '2023年10月',
          expenseLabel: '总支出',
          expenseValue: '¥ 12,480.00',
          changeLabel: '环比增长',
          changeValue: '-4.2%',
          changeDirection: 'down',
          note: '主要支出项：云服务、设计订阅',
        },
      },
      {
        type: 'file-preview',
        data: {
          fileName: '月之计划_最终版_V2.pdf',
          fileMeta: '12.4 MB · 昨天 18:30 更新',
          previewImage: 'https://picsum.photos/seed/document/800/300?blur=2',
        },
      },
    ],
  },
]

// 模拟快捷回复
export const mockQuickReplies = ['总结今日要点', '生成月度报表', '搜索历史记录']

// 模拟 AI 响应
export async function mockAIResponse(message: string): Promise<{
  content: string
  cards?: Array<{ type: string; data: Record<string, unknown> }>
}> {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (message.includes('财务') || message.includes('报表')) {
    return {
      content: '好的，这是您的财务概览。',
      cards: [
        {
          type: 'financial-overview',
          data: {
            title: '财务概览',
            period: '2023年10月',
            expenseLabel: '总支出',
            expenseValue: '¥ 12,480.00',
            changeLabel: '环比增长',
            changeValue: '-4.2%',
            changeDirection: 'down',
            note: '主要支出项：云服务、设计订阅',
          },
        },
      ],
    }
  }

  if (message.includes('文件') || message.includes('预览')) {
    return {
      content: '这是您请求的文件预览。',
      cards: [
        {
          type: 'file-preview',
          data: {
            fileName: '月之计划_最终版_V2.pdf',
            fileMeta: '12.4 MB · 昨天 18:30 更新',
            previewImage: 'https://picsum.photos/seed/document/800/300?blur=2',
          },
        },
      ],
    }
  }

  return {
    content: `收到您的消息："${message}"。我是月枢，光影汇聚，智慧流转。我能为您做些什么？`,
  }
}

// 模拟系统偏好设置项
export const mockSystemPreferences = [
  { id: 'devices', icon: 'Smartphone', label: '已连接设备' },
  { id: 'model', icon: 'Cpu', label: '模型配置' },
  { id: 'channels', icon: 'Network', label: '外部频道' },
  { id: 'privacy', icon: 'Shield', label: '隐私权限' },
  { id: 'skills', icon: 'Puzzle', label: 'Skill管理' },
  { id: 'system', icon: 'Settings', label: '系统配置' },
]


// 模拟模型配置
export const mockModelConfigs = [
  {
    id: '1',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    status: 'active',
    capabilities: ['对话', '代码', '分析'],
    contextWindow: '200K',
  },
  {
    id: '2',
    name: 'GPT-4o',
    provider: 'OpenAI',
    status: 'available',
    capabilities: ['对话', '图像', '代码'],
    contextWindow: '128K',
  },
  {
    id: '3',
    name: 'Gemini Pro',
    provider: 'Google',
    status: 'available',
    capabilities: ['对话', '多模态'],
    contextWindow: '1M',
  },
]


// 模拟隐私权限设置
export const mockPrivacySettings = [
  {
    id: 'analytics',
    label: '数据分析',
    description: '允许收集匿名使用数据以改进产品',
    enabled: true,
  },
  {
    id: 'crashReports',
    label: '崩溃报告',
    description: '自动发送崩溃报告帮助修复问题',
    enabled: true,
  },
  {
    id: 'personalization',
    label: '个性化推荐',
    description: '根据使用习惯提供个性化建议',
    enabled: false,
  },
  {
    id: 'location',
    label: '位置服务',
    description: '用于设备发现和本地网络功能',
    enabled: true,
  },
]

// 模拟 Skills
export const mockSkills = [
  {
    id: '1',
    name: '代码助手',
    description: '智能代码补全和错误修复',
    enabled: true,
    icon: 'Code',
  },
  {
    id: '2',
    name: '文档生成',
    description: '自动生成技术文档和注释',
    enabled: true,
    icon: 'FileText',
  },
  {
    id: '3',
    name: '数据分析',
    description: '可视化数据并生成洞察报告',
    enabled: false,
    icon: 'BarChart',
  },
  {
    id: '4',
    name: '语音助手',
    description: '语音交互和语音转文字',
    enabled: true,
    icon: 'Mic',
  },
]

// 模拟系统配置
export const mockSystemConfig = {
  theme: 'light' as const,
  language: 'zh-CN',
  notifications: true,
  autoUpdate: true,
  betaFeatures: false,
  logLevel: 'info' as const,
  cacheSize: '256MB',
  storageUsed: '2.4GB',
  storageTotal: '10GB',
}
