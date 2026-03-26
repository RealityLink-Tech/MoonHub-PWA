# MoonHub PWA

**文档索引**：[`docs/README.md`](docs/README.md)

**更新日志**：[`CHANGELOG.md`](CHANGELOG.md)

**[English](README.md)**

## 简介

MoonHub PWA 是面向 **MoonHub AI 助手设备** 的渐进式 Web 应用：多模态对话、语音与图片、AI 卡片，以及核心能力 **Space**——由 Agent 动态生成的界面。

## 核心功能

- **设备发现** — 扫描局域网内的 MoonHub 设备。详见 [`docs/lan-discovery.md`](docs/lan-discovery.md)。
- **安全配对** — 使用设备上显示的授权码完成绑定。详见 [`docs/lan-pairing.md`](docs/lan-pairing.md)。
- **多模态对话** — 文字、语音（Web Speech 与可选录音）、图片。
- **AI 卡片** — 模型返回的结构化富媒体回复。
- **Space 空间** — AI 动态生成界面（核心产品形态）。
- **设置** — 主题、通知、设备管理。
- **PWA** — 可安装、离线友好的应用壳（`vite-plugin-pwa`）。

### 架构图

```
┌─────────────────┐                    ┌─────────────────┐
│   MoonHub PWA   │  ◀── 局域网 ──▶   │   MoonHub 设备   │
│   （本仓库）     │                    │   （本地 API）   │
└─────────────────┘                    └─────────────────┘
        │
        │  HTTPS（如 CDN 托管）
        ▼
   PWA 安装包
```

**安全模型**：应用主要在同一 **局域网** 内访问设备。远程能力通常由设备侧配置的通道（如 Telegram、Discord）提供，而不是单独把设备 API 暴露到公网供 PWA 直连。

## 快速开始

```bash
pnpm install
pnpm dev          # 开发
pnpm build        # 生产构建
pnpm preview      # 预览构建
pnpm typecheck
pnpm lint
```

## 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型 |
| Vite 8 | 构建 |
| Tailwind CSS 4 | 样式 |
| TanStack Router | 路由 |
| Zustand | 状态 |
| vite-plugin-pwa | PWA |
| Lucide React | 图标 |
| Motion | 动画 |

## 项目结构

```
src/
├── components/     # chat/、space/、ui/、Layout
├── hooks/          # useDevice、useChat、useVoice、usePWA、useTheme、useAIUpdate
├── lib/            # 工具函数
├── pages/          # Splash、发现、配对、Chat、Space、Settings 等
├── services/       # device、discovery、storage、voice、mock、componentRecommendation
├── stores/         # device、chat、space、settings、ui
├── types/
├── App.tsx、AppInitializer.tsx、main.tsx、router.tsx、index.css
```

## Space（动态界面）

支持的组件类型（概览）：`container`、`flex`、`grid`、`card`、`text`、`button`、`input`、`image`、`icon`、`metric`、`progress`、`list`、`chart`。

## AI 卡片类型

示例：`weather`、`code`、`list`、`link`、`status`。

## 使用流程

1. 安装 PWA（例如通过设备配网页的二维码）。
2. 打开应用，扫描局域网内设备。
3. 输入设备上的授权码完成配对。
4. 开始对话；用自然语言创建 **Space** 界面。

## 扩展计划

**Phase 2** — Agent 群聊、多 Agent 协作、文件传输。

**Phase 3** — 插件系统、自定义主题、云同步。

## 相关项目

- [MoonHub](https://github.com/RealityLink-Tech/MoonHub) — 主设备与后端

## 许可证

MIT
