// ============================================================
// AI Component Recommendation Service
// 用于 Space "添加组件" 页面
// ============================================================

export interface RecommendedComponent {
  type: string
  name: string
  description: string
  icon: string
}

export interface ComponentRecommendationResult {
  components: RecommendedComponent[]
}

/**
 * AI 组件推荐服务
 * 用于 Space "添加组件" 页面
 */
export const componentRecommendation = {
  // 获取 AI 推荐的组件列表
  getRecommendations: async (context?: string): Promise<ComponentRecommendationResult> => {
    console.log('[预留] Get AI component recommendations, context:', context)
    // 返回 mock 数据，后续对接 API
    return {
      components: [
        {
          type: 'financial-system',
          name: '财务系统',
          description: '追踪支出、收入和预算',
          icon: 'Wallet',
        },
        {
          type: 'file-manager',
          name: '文件管理器',
          description: '管理和预览您的文件',
          icon: 'FolderOpen',
        },
        {
          type: 'task-tracker',
          name: '任务追踪',
          description: '追踪和管理待办事项',
          icon: 'CheckCircle',
        },
        {
          type: 'calendar',
          name: '日历',
          description: '查看日程和事件',
          icon: 'Calendar',
        },
        {
          type: 'notes',
          name: '笔记',
          description: '快速记录想法和笔记',
          icon: 'FileText',
        },
        {
          type: 'weather',
          name: '天气',
          description: '查看当前和未来天气',
          icon: 'Cloud',
        },
      ],
    }
  },

  // 添加组件到空间
  addComponent: async (spaceId: string, componentType: string): Promise<{ success: boolean }> => {
    console.log('[预留] Add component to space:', spaceId, componentType)
    return { success: true }
  },

  // 移除组件
  removeComponent: async (spaceId: string, componentId: string): Promise<{ success: boolean }> => {
    console.log('[预留] Remove component from space:', spaceId, componentId)
    return { success: true }
  },

  // 更新组件配置
  updateComponentConfig: async (
    spaceId: string,
    componentId: string,
    config: Record<string, unknown>
  ): Promise<{ success: boolean }> => {
    console.log('[预留] Update component config:', spaceId, componentId, config)
    return { success: true }
  },
}
