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
│   │   └── StreamingMessage.tsx
│   ├── space/          # Space 组件
│   │   └── DynamicRenderer.tsx
│   ├── ui/             # 基础 UI 组件
│   │   ├── button.tsx
│   │   └── toast.tsx
│   └── Layout.tsx      # 主布局
├── hooks/              # 自定义 Hooks
│   ├── useChat.ts      # 聊天逻辑
│   ├── useDevice.ts    # 设备管理
│   ├── usePWA.ts       # PWA 功能
│   ├── useTheme.ts     # 主题管理
│   └── useVoice.ts     # 语音功能
├── pages/              # 页面组件
│   ├── Chat.tsx        # 对话页面
│   ├── Pair.tsx        # 配对页面
│   ├── Settings.tsx    # 设置页面
│   └── Space.tsx       # Space 页面
├── services/           # 服务层
│   ├── device.ts       # API 客户端
│   ├── discovery.ts    # 设备发现
│   ├── storage.ts      # IndexedDB 存储
│   └── voice.ts        # 语音服务
├── stores/             # Zustand 状态管理
│   ├── chat.ts         # 聊天状态
│   ├── device.ts       # 设备状态
│   ├── settings.ts     # 设置状态
│   ├── space.ts        # Space 状态
│   └── ui.ts           # UI 状态
├── types/              # TypeScript 类型定义
│   ├── index.ts        # 核心类型
│   └── api.ts          # API 类型
├── App.tsx             # 根组件
├── main.tsx            # 入口文件
├── router.tsx          # 路由配置
└── index.css           # 全局样式
```

## API 通信

### 基础 API 端点

```
GET  /api/ping              # 设备发现
POST /api/auth/pair         # 配对授权
POST /api/auth/verify       # Token 验证
POST /api/chat              # 发送消息
POST /api/chat/stream       # 流式消息
POST /api/space/generate    # 生成 Space
GET  /api/space/:id         # 获取 Space
GET  /api/config            # 获取配置
PUT  /api/config            # 更新配置
GET  /api/gateway/status    # 网关状态
GET  /api/gateway/events    # SSE 事件流
```

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
