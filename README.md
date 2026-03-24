# MoonHub PWA

<div align="center">

**MoonHub 渐进式 Web 应用**

连接你的 AI 助手设备，体验智能对话与动态界面生成

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 核心功能

- 🔍 **设备发现** - 扫描局域网内的 MoonHub 设备
- 🔐 **安全配对** - 通过授权码进行安全绑定
- 💬 **多模态对话** - 支持文字、语音、图片
- 🎴 **AI 卡片** - AI 生成的富媒体回复
- 🎨 **Space 空间** - AI 生成的动态界面（核心特性）
- ⚙️ **设置管理** - 主题、通知、设备管理
- 📱 **PWA 支持** - 安装为原生应用

### 架构图

```
┌─────────────────┐                    ┌─────────────────┐
│   MoonHub PWA   │  ◀── 局域网 ──▶   │  MoonHub 设备   │
│   (本仓库)       │                    │  (本地 API)     │
└─────────────────┘                    └─────────────────┘
        │
        │  HTTPS (CDN 托管)
        ▼
   PWA 安装包
```

**安全模型**: PWA 只能在同一局域网内访问设备。远程访问通过配置的通道（Telegram、Discord 等）实现。

### 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 类型检查
pnpm typecheck
```

### 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite 8 | 构建工具 |
| Tailwind CSS 4 | 样式 |
| TanStack Router | 路由 |
| Zustand | 状态管理 |
| vite-plugin-pwa | PWA 支持 |
| Lucide React | 图标 |

### 项目结构

```
src/
├── components/          # React 组件
│   ├── chat/           # 聊天相关
│   │   ├── ChatInput.tsx         # 输入框
│   │   ├── ConversationList.tsx  # 对话列表
│   │   ├── GeneratedCard.tsx     # AI 卡片
│   │   ├── MessageBubble.tsx     # 消息气泡
│   │   └── StreamingMessage.tsx  # 流式消息
│   ├── space/          # Space 动态界面
│   │   └── DynamicRenderer.tsx   # 动态渲染器
│   ├── ui/             # 基础组件
│   └── Layout.tsx      # 主布局
├── hooks/              # 自定义 Hooks
│   ├── useChat.ts      # 聊天逻辑
│   ├── useDevice.ts    # 设备管理
│   ├── usePWA.ts       # PWA 功能
│   ├── useTheme.ts     # 主题管理
│   └── useVoice.ts     # 语音功能
├── pages/              # 页面组件
│   ├── Chat.tsx        # 对话页
│   ├── Pair.tsx        # 配对页
│   ├── Settings.tsx    # 设置页
│   └── Space.tsx       # Space 页
├── services/           # 服务层
│   ├── device.ts       # API 客户端
│   ├── discovery.ts    # 设备发现
│   ├── storage.ts      # IndexedDB
│   └── voice.ts        # 语音服务
├── stores/             # 状态管理
│   ├── chat.ts         # 聊天状态
│   ├── device.ts       # 设备状态
│   ├── settings.ts     # 设置状态
│   ├── space.ts        # Space 状态
│   └── ui.ts           # UI 状态
├── types/              # 类型定义
│   ├── index.ts        # 核心类型
│   └── api.ts          # API 类型
├── App.tsx             # 根组件
├── main.tsx            # 入口
├── router.tsx          # 路由配置
└── index.css           # 全局样式
```

### 核心特性详解

#### Space 动态界面生成

Space 是本项目的核心特性，允许 AI 动态生成 UI 组件：

```typescript
// 支持的组件类型
- container   // 容器
- flex        // 弹性布局
- grid        // 网格布局
- card        // 卡片
- text        // 文本
- button      // 按钮
- input       // 输入框
- image       // 图片
- icon        // 图标
- metric      // 指标
- progress    // 进度条
- list        // 列表
- chart       // 图表
```

#### 多模态对话

- **文字**: 基础对话
- **语音**: Web Speech API 录音和识别
- **图片**: 发送图片给 AI 分析

#### AI 生成卡片

AI 可以返回富媒体卡片：

```typescript
// 支持的卡片类型
- weather   // 天气卡片
- code      // 代码卡片
- list      // 列表卡片
- link      // 链接卡片
- status    // 状态卡片
```

### 使用流程

1. **安装 PWA**: 从 MoonHub 设备配网页面扫描二维码安装
2. **扫描设备**: 打开应用，扫描局域网内的 MoonHub 设备
3. **配对绑定**: 在设备上获取授权码，输入完成配对
4. **开始对话**: 连接成功后即可开始对话
5. **创建 Space**: 描述想要的界面，AI 会为你生成

### 扩展计划

**Phase 2**
- [ ] Agent 群聊
- [ ] 多 Agent 协作
- [ ] 文件传输

**Phase 3**
- [ ] 插件系统
- [ ] 自定义主题
- [ ] 云同步

### 相关项目

- [MoonHub](https://github.com/RealityLink-Tech/MoonHub) - 主设备和后端

### 许可证

MIT

---

## English

### Core Features

- 🔍 **Device Discovery** - Scan for MoonHub devices on local network
- 🔐 **Secure Pairing** - Connect via authorization code
- 💬 **Multimodal Chat** - Text, voice, and image support
- 🎴 **AI Cards** - AI-generated rich media responses
- 🎨 **Space** - AI-generated dynamic interfaces (Core Feature)
- ⚙️ **Settings** - Theme, notifications, device management
- 📱 **PWA Support** - Install as native app

### Quick Start

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build for production
pnpm build
```

### Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite 8** - Build Tool
- **Tailwind CSS 4** - Styling
- **TanStack Router** - Routing
- **Zustand** - State Management
- **vite-plugin-pwa** - PWA Support

### License

MIT
