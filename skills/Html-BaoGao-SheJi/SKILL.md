---
name: html-report-design-system
description: >
  专业级 HTML 报告/文档生成技能。当用户要求创建 HTML 文件、网页格式、HTML 报告、HTML 文档、网页交付时使用。
  基于经过验证的暖色调设计系统，自动根据内容智能选择最佳呈现形式（Tab 切换、卡片轮播、可折叠树、Stepper、可筛选表格、模态弹窗、可折叠代码块等），
  在视觉上减少页面长度，提升阅读体验，同时完整支持手机端自适应。
  触发词：html、网页格式、网页交付、HTML报告、HTML文档、做成HTML、转成HTML、HTML格式。
---

# HTML 报告设计系统

基于三个成熟项目验证的设计系统：素材管理系统、成本分析报告、功能分析文档。

## 工作流

### 1. 分析内容结构

读取用户提供的 Markdown/文本内容，识别信息类型，参考 `CanKao/presentation-forms.md` 中的决策矩阵选择最佳呈现形式。

### 2. 生成 HTML 文件

使用 `CanKao/css-design-system.md` 中的完整 CSS 设计系统生成 HTML。

### 3. 添加交互功能

使用 `CanKao/js-components.md` 中的 JavaScript 组件实现交互。

### 4. 确保手机端适配

遵循 `CanKao/mobile-adaptation.md` 规范。

### 5. 归档交付

按归档规范输出文件（见下方归档规范章节）。

## 输出要求

- 单个 HTML 文件，包含完整 CSS + JS
- 必须包含固定导航栏（可跳转目录）
- 必须包含 viewport meta 标签
- 必须包含 Google Fonts 加载
- 所有表格单元格必须添加 `data-label` 属性
- 所有交互组件必须有对应 JavaScript 实现

## 归档规范

### 目录结构

```
项目根目录/
└── JiaoFu-WenJian/
    └── 描述性名称_YYYYMMDD_HHMM.html
```

### 文件命名规则

- 描述性名称：使用中文或英文，清晰描述报告内容
- 时间戳：`YYYYMMDD_HHMM`（精确到分，如 `20260512_1800`）
- 示例：`AI视频生成成本分析_20260512_1800.html`

### 版本管理

- 每次生成新 HTML 文件时，必须使用当前时间戳创建新文件
- 不覆盖已有文件，保留历史版本
- 向用户输出完整的文件路径

### 资源管理

- HTML 文件为单文件交付（CSS + JS 内联）
- 如有外部资源（图片、字体），放在同级 `ZiYuan/` 子目录
- 资源文件命名使用描述性名称
