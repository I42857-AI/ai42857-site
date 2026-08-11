## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层"
        "React 18 + TypeScript"
        "Vite 构建"
        "Tailwind CSS"
        "React Router"
        "Zustand 状态管理"
        "Motion 动效库"
    end
    subgraph "部署层"
        "GitHub Pages"
        "Cloudflare CDN"
    end
    subgraph "数据层"
        "静态 JSON 数据"
        "本地 Markdown"
    end
    "前端层" --> "部署层"
    "数据层" --> "前端层"
```

## 2. 技术说明
- 前端：React@18 + TypeScript + Tailwind CSS@3 + Vite
- 初始化工具：vite-init (react-ts 模板)
- 状态管理：Zustand
- 路由：React Router DOM
- 动效：Motion (framer-motion)
- 图标：lucide-react
- 后端：无（纯静态站点）
- 数据：静态 JSON + Markdown 文件

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 首页：英雄区 + 四维导航 + 精选作品 |
| `/agents` | Agent 生态：架构图 + 技能清单 + 虫洞演示 |
| `/projects` | 开发项目：项目网格 + 详情面板 |
| `/visuals` | 视觉作品：画廊 + 灯箱 |
| `/writing` | 写作：文章列表 + 标签筛选 |

## 4. 项目结构

```
src/
├── components/          # 通用组件
│   ├── layout/          # 布局组件（Header, Footer, Navigation）
│   ├── ui/              # UI 基础组件（Card, Badge, Lightbox）
│   └── effects/         # 动效组件（WormholeParticles, ParallaxSection）
├── pages/               # 页面组件
│   ├── Home.tsx
│   ├── Agents.tsx
│   ├── Projects.tsx
│   ├── Visuals.tsx
│   └── Writing.tsx
├── data/                # 静态数据
│   ├── projects.json
│   ├── skills.json
│   ├── articles.json
│   └── visuals.json
├── hooks/               # 自定义 Hooks
├── store/               # Zustand 状态
├── utils/               # 工具函数
├── App.tsx              # 根组件
└── main.tsx             # 入口
```

## 5. 数据模型

### 5.1 项目数据

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'active' | 'completed' | 'archived';
  github?: string;
  demo?: string;
  image: string;
  detail: string;
}
```

### 5.2 技能数据

```typescript
interface Skill {
  id: string;
  name: string;
  category: 'trae' | 'mimo' | 'shared';
  description: string;
  tags: string[];
}
```

### 5.3 文章数据

```typescript
interface Article {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  date: string;
  content: string;
}
```

### 5.4 视觉作品数据

```typescript
interface Visual {
  id: string;
  title: string;
  type: 'video' | 'image' | 'design';
  src: string;
  thumbnail: string;
  description: string;
  tags: string[];
}
```

## 6. 构建与部署

- 构建：`pnpm build` → `dist/` 目录
- 部署：推送到 GitHub `ai42857-site` 仓库，GitHub Pages 自动部署
- 域名：`ai42857.dpdns.org` 通过 Cloudflare CDN 指向 GitHub Pages
- HTTPS：Cloudflare 自动证书
