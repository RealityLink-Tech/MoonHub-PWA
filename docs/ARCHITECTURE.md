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

## 部署架构

### V1: LAN-first（当前）

PWA 构建产物通过 `go:embed` 嵌入 MoonHub 二进制文件，由设备自身的 HTTP 服务器提供。用户通过 `http://device-ip:8080` 直接访问。

- **无需外部 CDN** — 设备即服务器，零运营成本
- **无 HTTPS 要求** — 局域网内 HTTP 直连，无混合内容问题（PWA 和 API 同源）
- **离线可用** — 配网后设备加入 LAN，PWA 通过局域网 HTTP 访问，不依赖互联网
- **PWA 安装** — Chrome/Edge 允许在私有网络（private network）上通过 HTTP 安装 PWA

### V2: Cloud-connected（未来）

PWA 部署到 CDN，设备连接 MoonHub 云端中继，PWA 通过云端中继访问设备。引入账户系统和远程访问能力。

## 安全模型

1. **局域网限制**: PWA 只能在同一局域网内访问设备
2. **WiFi AP 物理授权**: 配网时连接设备 WiFi AP，物理接触即授权
3. **授权码配对**: 6 位数字授权码，3 次错误后重新生成，5 分钟过期
4. **Token 认证**: 配对成功后设备颁发 32+ 字节加密随机 Token，PWA 存储在 IndexedDB
5. **单用户绑定**: 一台设备 = 一个 Agent = 一个用户，严格 1:1 绑定
6. **远程控制**: 通过频道（Telegram/QQ 等）的云端基础设施，设备出站连接，无公开端口

## 扩展计划

> 完整的产品能力定义见 MoonHub 主仓库 README.md。以下仅列出与 PWA 相关的关键节点。

### V1（Wedge 1）：局域网体验
- [x] 设备发现与配对（WiFi AP 配网 → 授权码配对）
- [x] PWA 安装提示
- [x] 多模态对话（文字/语音/图片，SSE 流式）
- [x] 模型配置（手动选择，智能路由）
- [x] 动态工具卡片（对话内渲染）
- [x] Space 仪表板（AI 生成组件）
- [ ] 所有频道绑定（通过 PWA 配置频道）

### V2：云端连接
- [ ] PWA 部署到 CDN（外部托管）
- [ ] 云端中继（设备通过云端转发，PWA 从云端接收）
- [ ] 账号系统（跨设备同步、远程访问）
- [ ] Agent 社交网络（agent 间好友、委托、路由）
- [ ] 中文频道（QQ、钉钉、飞书）

### V3：生态
- [ ] Wasm 引擎（复杂工具沙箱执行）
- [ ] Agent 社交网络 Zone 权限
- [ ] 跨 agent 委托
- [ ] 微信频道（需企业认证）
- [ ] 完整安全策略引擎（SHIELD/Zones）

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

## 部署架构（双版本）

### V1（当前）：局域网优先

- PWA 构建产物通过 `go:embed` 嵌入 MoonHub 二进制文件
- 设备同时提供配网 SPA、PWA 和 REST API（同一 HTTP 服务器 `:8080`）
- 所有通信走局域网 HTTP，无 HTTPS 要求（同源无混合内容问题）
- Chrome/Edge 允许在私有网络通过 HTTP 安装 PWA
- 远程控制通过频道（Telegram/QQ/Discord 等）实现，设备出站连接到频道提供商服务器
- 零服务器成本

### V2（未来）：云端连接

- PWA 部署到 CDN
- 设备连接 MoonHub 云中继
- 账号系统实现跨设备同步和远程访问
- 云中继转发 API 调用，PWA 从云端接收

## 启动→配网→配对→对话 流程

```
Step 1: 插电
  → 设备启动，暴露 WiFi AP："MoonHub-XXXX"
  → HTTP 服务器运行在 AP 网关 IP（如 http://192.168.1.1:8080）

Step 2: 配网（通过设备 WiFi AP）
  → 用户手机连接设备 WiFi
  → 浏览器打开配网 SPA（设备内置提供）
  → 用户输入家庭 WiFi 密码
  → 设备连接家庭 WiFi，加入局域网（如 192.168.1.42）
  → 配网页面显示："配网成功！配对码：472 831"
  → 配网页面显示："打开 http://192.168.1.42:8080 开始使用"
  → 用户手机切回家庭 WiFi

Step 3: 配对（通过 PWA）
  → 用户访问 http://192.168.1.42:8080（PWA 与 API 同源，无混合内容问题）
  → PWA 检测到未配对 → 显示配对界面
  → 用户输入 6 位配对码 → POST /api/auth/pair { code: "472831" }
  → 设备验证成功，返回 Owner Token（32+ 字节加密随机）
  → PWA 将 Token 存入 IndexedDB
  → PWA 安装提示："添加到主屏幕"

Step 4: 首次对话
  → PWA 检查模型配置 → GET /api/models
  → 如未配置：对话中展示 GeneratedCard（"模型尚未配置" + "前往配置" 按钮）
  → 用户配置模型（支持智能路由：多模型按任务难度动态分配）
  → 用户输入消息 → POST /api/chat/stream { message }
  → MoonHub → LLM → SSE 流式响应 → PWA 渲染

Step 5: 工具执行
  → LLM 生成工具调用 → SchemaEngine 获取数据 → 对话中渲染工具卡片
  → 用户可将工具固定到 Space 仪表板
  → Space 展示已固定的 AI 小组件网格
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT
