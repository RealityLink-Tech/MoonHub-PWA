# MoonHub PWA 架构文档

## 项目概述

MoonHub PWA 是一个渐进式 Web 应用，用于与 MoonHub AI 助手设备进行交互。核心特点是**动态界面生成** - AI 可以生成自定义 UI 组件。

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite 8** - 构建工具
- **Tailwind CSS 4** - 样式
- **TanStack Router** - 路由
- **Zustand** - 状态管理
- **vite-plugin-pwa** - PWA 支持
- **Lucide React** - 图标
- **Motion** - 动画
- **react-markdown** + **remark-gfm** - 对话中助手消息的 Markdown 渲染（GFM 表格、删除线等）

## 核心功能

### 1. 设备发现与配对
- 扫描局域网内的 MoonHub 设备
- 通过授权码进行安全配对
- 支持多设备管理

### 2. 对话功能
- 文字消息
- 语音输入（Web Speech API）
- 图片发送
- AI 生成式卡片回复
- 流式响应

### 对话与消息呈现

- **助手文本**：[`MarkdownRenderer`](../src/components/MarkdownRenderer.tsx) 渲染流式与最终文本（react-markdown + remark-gfm，样式与 Tailwind 设计令牌对齐）。
- **系统通知**：消息类型 `system_notice` 在 [`Chat` 页面](../src/pages/Chat.tsx) 中走 [`SystemNotice`](../src/components/SystemNotice.tsx)，用于配对提示等结构化提示（可选 `actions`）。

### 动态工具与 DynamicRenderer

- **API**：[`dynamicToolsService`](../src/services/dynamicTools.ts) 调用 MoonHub `/api/dynamic-tools`（列表、生成、执行、schema、删除、首页固定）。详见 [`services.md`](./services.md)。
- **渲染**：[`DynamicRenderer`](../src/components/space/DynamicRenderer.tsx) 将后端返回的 `GeneratedComponent` 树映射为 React 节点；**Chat 层**轻量组件在 [`components/chat/dynamic/`](../src/components/chat/dynamic/)（如 `MetricSummary`、`ChartPreview`），**Space 层**完整组件在 [`components/space/dynamic/`](../src/components/space/dynamic/)（如图表、表格、看板、`ActionForm` 等）。
- **页面**：[`Space.tsx`](../src/pages/Space.tsx)、[`SpaceDetail.tsx`](../src/pages/SpaceDetail.tsx)、[`SpaceAdd.tsx`](../src/pages/SpaceAdd.tsx) 组合 list / execute / schema 与 `DynamicRenderer`。

### 3. Space 空间（动态界面）
- AI 生成 UI 组件
- 组件动态渲染
- 支持多种组件类型

### 4. 设置
- 主题切换
- 通知配置
- 设备管理

## 项目结构

```
src/
├── components/          # React 组件
│   ├── chat/           # 聊天相关组件
│   │   ├── ChatInput.tsx
│   │   ├── ConversationList.tsx
│   │   ├── GeneratedCard.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── StreamingMessage.tsx
│   │   └── dynamic/    # 动态工具（Chat 侧小组件）
│   ├── MarkdownRenderer.tsx
│   ├── SystemNotice.tsx
│   ├── space/          # Space 组件
│   │   ├── DynamicRenderer.tsx
│   │   └── dynamic/    # 动态工具（Space 侧完整组件）
│   ├── ui/             # 基础 UI 组件
│   │   ├── button.tsx
│   │   └── toast.tsx
│   └── Layout.tsx      # 主布局
├── hooks/              # 自定义 Hooks（`index.ts` 统一导出）
│   ├── useChat.ts
│   ├── useDevice.ts
│   ├── usePWA.ts
│   ├── useTheme.ts
│   ├── useVoice.ts
│   └── useAIUpdate.ts  # AI 推送预留
├── lib/
│   └── utils.ts        # 通用工具
├── pages/              # 页面组件
│   ├── Splash.tsx
│   ├── DeviceDiscovery.tsx
│   ├── DeviceConnection.tsx
│   ├── Pair.tsx
│   ├── Chat.tsx
│   ├── Space.tsx
│   └── Settings.tsx
├── services/           # 服务层（按文件直接 import，无 `index.ts`）
│   ├── device.ts
│   ├── discovery.ts
│   ├── dynamicTools.ts
│   ├── storage.ts
│   ├── voice.ts
│   ├── mock.ts
│   └── componentRecommendation.ts
├── stores/             # Zustand 状态管理
│   ├── chat.ts         # 聊天状态
│   ├── device.ts       # 设备状态
│   ├── settings.ts     # 设置状态
│   ├── space.ts        # Space 状态
│   └── ui.ts           # UI 状态
├── types/              # TypeScript 类型定义
│   ├── index.ts        # 核心类型
│   └── api.ts          # API 类型
├── App.tsx
├── AppInitializer.tsx
├── main.tsx
├── router.tsx
└── index.css
```

## API 通信

### 基础 API 端点

```
GET  /api/ping                 # 在线检测
GET  /api/system/info          # 系统信息
GET  /api/discover             # 设备侧 mDNS 扫描（LAN）
GET  /api/devices              # 已配对客户端列表（LAN）
POST /api/auth/pair            # 配对
POST /api/auth/verify          # Token 校验（Bearer 或 JSON body）
GET  /api/auth/status          # 授权码状态
POST /api/chat                 # 同步对话
POST /api/chat/stream          # 流式对话
POST /api/space/generate       # 生成 Space
GET  /api/space/:id            # 获取 Space
GET  /api/config               # 配置
PUT  /api/config               # 全量更新配置
PATCH /api/config              # 部分更新配置（客户端常用）
GET  /api/gateway/status       # 网关状态
POST /api/gateway/start        # 启动网关
POST /api/gateway/stop         # 停止网关
GET  /api/gateway/events       # SSE（客户端用 EventSource）
GET  /api/channels             # 频道实例列表
POST /api/channels             # 新建频道配置
PATCH /api/channels/{id}       # 更新频道
DELETE /api/channels/{id}      # 删除频道
GET  /api/channels/{id}/status # 频道状态
GET  /api/channels/catalog     # 频道类型目录
GET  /api/dynamic-tools        # 动态工具列表
POST /api/dynamic-tools/generate
POST /api/dynamic-tools/{id}/execute
GET  /api/dynamic-tools/{id}/schema
DELETE /api/dynamic-tools/{id}
PATCH /api/dynamic-tools/{id}/home
GET  /api/skills               # 技能列表
POST /api/skills               # 安装技能
GET  /api/models               # 模型列表
POST /api/models/default       # 默认模型
```

与 MoonHub 后端契约的权威说明见主仓库 [`web/backend/api/README.md`](../../MoonHub/web/backend/api/README.md)（分仓布局下的相对路径）。

## 状态管理

### Device Store
- 管理已发现和已配对设备
- 跟踪连接状态
- 处理配对流程

### Chat Store
- 管理对话列表
- 存储消息
- 处理流式响应

### Space Store
- 管理 Space 列表
- 存储组件树
- 处理动态生成

### Settings Store
- 应用设置
- 主题配置
- 通知设置

## PWA 功能

- **离线支持**: Service Worker 缓存
- **安装提示**: 自动检测可安装状态
- **推送通知**: Web Push API
- **后台同步**: 未来功能

## 安全模型

1. **局域网限制**: PWA 只能在同一局域网内访问设备
2. **授权码配对**: 需要在设备上获取授权码
3. **Token 认证**: 配对后使用 Token 认证
4. **HTTPS 要求**: PWA 需要 HTTPS（本地开发除外）

## 扩展计划

### Phase 2
- [ ] Agent 群聊
- [ ] 多 Agent 协作
- [ ] 文件传输
- [ ] 视频通话

### Phase 3
- [ ] 插件系统
- [ ] 自定义主题
- [ ] 云同步
- [ ] 远程访问

## 开发指南

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm typecheck

# 预览生产版本
pnpm preview
```

## 与 MoonHub 主项目集成

1. MoonHub 设备完成配网后，显示 PWA 安装二维码
2. 用户扫描二维码安装 PWA
3. PWA 扫描局域网发现设备
4. 输入设备上显示的授权码完成配对
5. 开始使用

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT
