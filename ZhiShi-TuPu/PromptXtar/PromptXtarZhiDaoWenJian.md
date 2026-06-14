# PromptXtar 项目指导文档

> 最后更新：2026-05-25
> 此文档反映当前真实状态。所有 agent/技能/性格相关内容已在 v3.4 中移除。

---

## 产品定义

PromptXtar 是一款 AI 提示词管理器浏览器扩展，核心能力：

1. **QuickMD 文档编辑**（侧边栏默认首页）— Markdown 编辑/预览/多标签
2. **小念 AI 对话**（浮层 + 侧边栏）— 直连 MiMo API，纯聊天，无技能/性格
3. **// 快捷键一键填充** — 在任意网页唤起浮层，拖拽填充
4. **参考图片管理** — IndexedDB 存储，分类抽屉，瀑布流/网格
5. **首页仪表盘** — 书签导入，AI 自动分类，速度拨号
6. **Native 文件系统** — 通过 Python Native Messaging Host 读写本地文件

---

## 目录结构

```
extension/
├── manifest.json              — MV3 清单
├── background.js              — Service Worker（数据层+消息路由+MiMo API+Gateway通信）
├── content.js                 — 网页注入脚本（// 快捷键+浮层+小念对话+拖拽填充）
├── utils.js                   — PT_UTILS 工具库
├── icon.svg                   — 扩展图标
│
├── side-panel/                — 侧边栏主界面
│   ├── side-panel.html        — 侧边栏入口
│   ├── side-panel.js          — 主逻辑（Tab切换+QuickMD+首页+图片+对话+快捷键+设置）
│   └── side-panel.css         — 样式表
│
├── modules/                   — 功能模块
│   ├── home.js                — 首页（书签管理+速度拨号+AI自动分类）
│   ├── home.css               — 首页样式
│   ├── quickmd.js             — QuickMD 模块（window.QuickMD 委托）
│   └── reader.js              — 长文阅读（已被 QuickMD 替代，暂不活跃）
│
├── libs/                      — 第三方库+渲染+面板基础设施
│   ├── marked.min.js          — Markdown 渲染
│   ├── highlight.min.js       — 代码高亮
│   ├── katex.min.js/css       — 数学公式
│   ├── mermaid.min.js         — 流程图
│   ├── url-enlarger.js        — 50+ 站点 URL 穿透规则
│   ├── element-inspector.js   — DOM URL 提取
│   ├── panel-interface.js     — PanelBase 接口（生命周期）
│   ├── panel-shell.js         — 面板管理器（注册/切换/创建/删除）
│   ├── picker.css             — 浮层样式
│   ├── rendering-overrides.css — 渲染覆盖
│   └── xiaomi-light.css       — 代码高亮亮色主题
│
└── native-host/               — 本地文件系统桥接
    ├── native-fs-host.py      — Python 文件系统脚本
    └── com.promptxtar.filesystem.json — Native Messaging Host 清单
```

**已删除的目录（v3.4）：**
- `agent/` — 已删除（xiao-skills.js、xiao-context.js、xiao-agent.js、ai-profile.json）

---

## 侧边栏标签页

```
⚡ QuickMD（默认首页）| 🏠 首页 | 🖼️ 图片 | 💬 小念 | ⌨️ ⚙️
```

导航顺序：QuickMD → 首页 → 图片 → 小念（QuickMD 是核心文档存储部门，默认首页）

---

## 消息路由

```
用户消息 → content.js
└─ callXiaoxingStreamAPI() → background.js callXiaoxingStream()
   └─ MiMo API (token-plan-cn.xiaomimimo.com)
      ├─ 纯文本 → mimo-v2.5-pro
      └─ 多模态 → mimo-v2.5（自动切换）
```

小念直连 MiMo API，无中间路由，无技能系统，无性格注入。

---

## 关键配置

| 文件 | 配置项 | 说明 |
|------|--------|------|
| background.js | `GATEWAY_TOKEN` | Gateway 认证 token |
| background.js | `callOpenClaw()` | OpenClaw Gateway 通信层（保留供外部调用） |
| side-panel.js | `state.gatewayToken` | 侧边栏 Gateway token |
| chrome.storage | `pc_gateway_config` | API Key + Base URL |

---

## 快捷键系统

### 侧边栏快捷键

| 按键 | 功能 |
|------|------|
| `1` | QuickMD |
| `2` | 图片 |
| `3` | 小念对话 |
| `Q` | 上一个分区 |
| `E` | 下一个分区 |
| `Ctrl+N` | 新建内容 |
| `Ctrl+D` | 管理模式/编辑预览 |
| `Ctrl+S` | 保存/下载 |
| `Ctrl+Shift+N` | 新建分区 |
| `Ctrl+Shift+S` | 导出全部 |
| `A` | 全选（管理模式下） |
| `?` | 快捷键帮助面板 |

### 网页浮窗快捷键

| 按键 | 功能 |
|------|------|
| `//` | 打开浮层 |
| `]]` | 最小化到角落 |
| `Esc` | 关闭浮层 |

快捷键帮助面板入口：导航栏键盘图标按钮 + `?` 键

---

## 编码规范

- 文件编码：UTF-8 无 BOM
- JS：ES6+，不用 TypeScript
- CSS：用 CSS 变量（`:root` 定义在 side-panel.css 顶部）
- 命名空间：项目自有代码用 `pc-` 前缀（CSS）和 `PromptXtar` 前缀（console.log）
- 工具函数：统一放 `utils.js` 的 `PT_UTILS` IIFE 中
- 面板基础设施：`libs/panel-interface.js` + `libs/panel-shell.js`
- 功能模块：`modules/` 目录，每个模块一个 JS 文件

---

## 设计决策

1. **不改原有代码** — 所有定制追加式，命名空间隔离
2. **PanelShell 生命周期** — switchTab 时：离开→onUnmount+保存，进入→懒创建+init+onMount
3. **QuickMD 耦合处理** — 暴露 `window.QuickMD` 命名空间（18个函数），不移动代码
4. **首页嵌入侧边栏** — 不用独立 new tab page，作为侧边栏的一个标签页
5. **DuckDuckGo favicon** — Google S2 被墙，改用 icons.duckduckgo.com
6. **小念纯聊天** — 直连 MiMo API，无技能/性格/记忆注入，最简 system prompt

---

## 模块化架构

### PanelBase 接口

所有面板模块必须实现 `PanelBase` 接口：

```js
class PanelBase {
  async onCreate() {}      // 面板创建（只调一次）
  async onMount(container) // 面板挂载到 DOM（每次切换到此面板）
  async onUnmount() {}     // 面板卸载（切换到其他面板）
  async onDestroy() {}     // 面板删除
  render() {}              // 返回主内容区 HTML
  getShortcuts() {}        // 返回面板专属快捷键定义
  async save() {}          // 保存到 chrome.storage.local
}
```

### PanelShell 管理器

负责面板注册、切换、创建、删除、通信。

### 已实现模块

| 模块 | 文件 | 状态 |
|------|------|------|
| QuickMD | `modules/quickmd.js` | 活跃（默认首页） |
| Home | `modules/home.js` | 活跃 |
| Reader | `modules/reader.js` | 不活跃（已被 QuickMD 替代） |

---

## 数据格式约定（必读）

1. 字段名必须与同类型已有节点一致（如 techniqueId 非 technique）
2. 分镜方案必须用 flow 类型 + shots 数组 + has_storyboard 边
3. 分段文件不能包含主文件中已存在的节点（追加不去重，重复导致黑屏）

---

## 版本历史

### v3.4 — 2026-05-25

- 删除 agent/ 目录（xiao-skills.js、xiao-context.js、xiao-agent.js、ai-profile.json）
- 小念精简为纯聊天：直连 MiMo API，无技能/性格/记忆注入
- buildSystemPrompt() 从 130 行 → 1 行最简提示词
- QuickMD 前置为侧边栏默认首页
- 导航栏新增快捷键介绍按钮（键盘图标）
- 快捷键面板内容更新（1=QuickMD/2=图片/3=小念）
- 设置面板移除 Agent 地址配置项
- 数字键 Tab 切换顺序更新

### v3.3.2 — 2026-05-04

- 目录重组：根目录从 19 个文件精简到 5 个
- 首页标签页（home.js + home.css）
- 模块化架构（PanelBase + PanelShell）
- 快捷键帮助面板（`?` 触发）

### v3.3.1 — 2026-05-03

- 渲染层优化（rendering-overrides.css + xiaomi-light.css）
- 提示词管理残留代码清除（7阶段，已执行完毕）
- Agent 运行时（xiao-context.js、xiao-skills.js、xiao-agent.js）— **v3.4 已删除**

---

*此文档替代以下已归档文档：ARCHITECTURE.md、CHANGELOG.md、MODULE-BLUEPRINT.md、PromptXtar-功能框架报告.md*
