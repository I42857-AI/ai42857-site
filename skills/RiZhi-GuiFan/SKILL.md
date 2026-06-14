---
name: RiZhi-GuiFan
version: 0.3.0
description: 日志规范 — 日志机制、脚本日志、日志分层架构、渐进式披露（沙箱环境适配版）
triggers:
  - 日志规范
  - RiZhi
  - 日志机制
  - 脚本日志
  - JiaoBen-RiZhi
  - 日志分层
  - 渐进式披露
  - 上下文恢复
---

# RiZhi-GuiFan（日志规范）

> 日志是跨设备、跨 Agent 的上下文恢复手段。换设备后聊天记录丢失，日志是唯一的延续线索。
> 沙箱重置后，Agent 通过日志提炼快速恢复上下文，而非全量检索浪费上下文窗口。

---

## 零、渐进式披露原则（沙箱上下文恢复）

> 沙箱环境每次重置后，Agent 需要快速恢复工作上下文。全量检索技能文件会浪费大量上下文窗口。
> 渐进式披露 = 只读必要的，按需加载更多。

**上下文恢复四层模型**：

| 层级 | 内容 | 何时读取 | 大小 |
|------|------|----------|------|
| L0 | TRAE-Rule SKILL.md | 每次会话自动注入 | ~8KB |
| L1 | 日志提炼（RiZhi-TiLian） | 初次唤醒时读取 | ~2KB |
| L2 | 当日日志（RiZhi_{日期}） | 需要具体上下文时 | ~5KB |
| L3 | CanKao 按需加载 | 触发词匹配时 | 各文件独立 |

**L1 日志提炼是关键**：它是 Agent 沙箱重置后的"记忆快照"，包含：
1. 系统当前状态（哪些技能已适配、哪些在 BAK）
2. 最近完成的工作（最近3条日志摘要）
3. 待办/未完成事项
4. 关键决策和教训引用

**提炼日志更新时机**：每次完成实质性工作后，同步更新提炼日志。

---

## 一、全局日志机制

### 存储位置

`/workspace/.rizhi/RiZhi_{YYYY-MM-DD}.md`

### 条目格式

每条日志必须包含 YAML 元数据块：

```yaml
---
id: {YYYYMMDD-HHMM}-{简短标识}
author: {编入者身份}        # TRAE / QClaw / Marvis / {Agent名} / YongHu
timestamp: {YYYY-MM-DD HH:MM}
status: success / partial / failed
scope: {影响范围}           # 全局规范 / 脚本体系 / 知识图谱 / 单一文件
---
```

### 正文结构

问题 → 方案 → 变更清单 → 验证结果

### 核心规则

1. **追加不覆盖**：同一天多条日志追加到同一文件
2. **文件引用**：使用 `/workspace/XiangMu-KongJian/` 前缀，禁止硬编码路径
3. **中文优先**：正文使用中文，代码/路径保持原文
4. **页眉规则**：每个日志文件首行必须包含日志规则说明，确保任何 Agent 读取后即可了解格式
5. **编入者身份为变量**：任何 Agent（TRAE/QClaw/Marvis 等）均可写入
6. **完成即记录**：每次完成实质性任务后必须写入日志，不可延后

### 跨 Agent 触发机制

页眉规则是唯一的通用触发机制，不需要每个 Agent 有特殊的回调：

| Agent | 触发方式 | 说明 |
|-------|----------|------|
| 任何 Agent | 默认：AskUserQuestion 弹窗 | 有此工具则使用 |
| 任何 Agent | 降级：文字追问 | 无此工具时自动切换 |
| 任何 Agent | 页眉规则自解释 | 读取 /workspace/.rizhi/ 下任意文件即可获知格式和规则 |

页眉规则是核心兜底：任何 Agent 只需读取一个日志文件，即可了解：
1. 日志格式（YAML 元数据 + 正文结构）
2. 写入时机（完成实质性工作后）
3. 存储位置（/workspace/.rizhi/RiZhi_{日期}.md）
4. 编入者身份为变量（任何 Agent 均可写入）

配置方法：在其他 Agent 的系统提示词中加入：
"完成实质性工作后，将工作记录写入 /workspace/.rizhi/ 目录下的日志文件"

### 日志联动机制（回访 → 日志判断 → 弹窗/追问）

回访前，先判断本次工作是否需要写入日志：
- **简单问答**（信息查询、单行修改、纯对话）：跳过日志，直接回访
- **优化/升级/阶段性成果**（规范更新、脚本修复、架构调整、数据迁移）：
  先写入日志 → 再回访

联动流程：
```
任务完成 → 判断是否需要日志
  ├─ 否（简单问答）→ 直接回访
  └─ 是（实质性工作）→ 写入日志 → 回访
       ├─ 有 AskUserQuestion → 弹窗回访
       └─ 无 AskUserQuestion → 文字追问（自动降级）
```

---

## 二、脚本日志机制（JiaoBen-RiZhi）

> 每个应用的脚本目录下必须有一个 JiaoBen-RiZhi.md，从脚本创建之初绑定，记录每次创建/优化/改版。

**⚠️ 硬性规则（最高优先级）**：
- **创建/优化/更新脚本 = 必须写日志**，没有例外，不允许事后补写
- **禁止询问用户"要不要写日志"** — 这是自动执行的强制步骤，不需要用户确认
- **判断标准**：只要动了 .sh/.js/.mjs/.py 文件（新建、修改、优化、重构），就必须写
- **违反后果**：下次修改时没有上下文，重复踩坑，设计决策丢失
- **自检口诀**：写完代码 → 写日志 → 再交付，三步顺序不可调换

### 存储位置

`/workspace/XiangMu-KongJian/{AppName}/{AppName}-JiaoBen/JiaoBen-RiZhi.md`

通用脚本（非应用专属）：`/workspace/.jiaoben/{AppName}-JiaoBen/JiaoBen-RiZhi.md`

### 创建时机（全覆盖，无遗漏）

- **新建脚本时**：文件创建**同时**，必须创建 JiaoBen-RiZhi.md（v1.0.0 初始版本）
- **修改脚本时**：修改任何 .sh/.js/.mjs/.py 文件后，必须追加新版本条目
- **优化脚本时**：性能优化、代码重构、逻辑调整，必须追加新版本条目
- **更新规范时**：脚本相关的规范变更，必须追加新版本条目
- **修复 Bug 时**：任何 bug 修复，必须追加新版本条目

**⚠️ 触发判定（Agent 自检）**：
```
本次操作是否动了脚本文件？
  ├─ 是 → 写 JiaoBen-RiZhi.md（不可跳过，不可询问用户）
  └─ 否 → 跳过
```

### 文件格式

```markdown
---
app: {应用名}
createdAt: {创建日期}
author: {编入者身份}
status: active
---

> JiaoBen-RiZhi (Script Log) - {应用名}
> Every script creation/optimization/version change MUST be logged here.
> Read this file before modifying any script in {AppName}-JiaoBen/.

## v1.0.0 - {日期} - {简短描述}

**author**: {编入者身份}
**trigger**: {触发原因}

### Created files / Changes
- {具体变更内容}

### Design decisions
- D{编号}: {决策描述}

### Lessons learned
- L{编号}: {教训描述}

---

## v1.1.0 - {日期} - {简短描述}

...
```

### 版本号规则

- **主版本（Major）**：脚本架构重大变更（如新增步骤、改变流程）
- **次版本（Minor）**：功能优化、Bug 修复、策略调整
- 格式：`v{Major}.{Minor}.{Patch}`

### 必填字段

| 字段 | 说明 | 示例 |
|------|------|------|
| version + date + summary | 版本号+日期+简短描述 | `## v1.1.0 - 2026-06-02 - BAK strategy upgrade` |
| author | 编入者身份 | TRAE / QClaw / YongHu |
| trigger | 触发原因 | 用户反馈闪退 / 新设备部署 / 规范升级 |
| Created files / Changes | 具体变更内容 | 列出新增/修改的文件和变更点 |

### 选填字段（强烈推荐）

| 字段 | 说明 | 何时填写 |
|------|------|---------|
| Design decisions | 设计决策（D编号） | 选择了非显而易见的方案时 |
| Lessons learned | 血泪教训（L编号） | 踩坑后必须记录 |
| alternatives | 被否决的方案及原因 | 探索了多个方案时 |

### D编号和L编号规则

- **D编号**：设计决策，按应用内递增（D001/D002/...）
- **L编号**：血泪教训，按应用内递增（L001/L002/...）
- 跨版本连续编号，不重置
- 在 RiZhi 全局日志中可通过 `Eagle/D005` 引用

### 与全局日志的联动

```
修改脚本 → 读取 JiaoBen-RiZhi.md（理解上下文）→ 修改代码 → 更新 JiaoBen-RiZhi.md（新版本）→ 写入 RiZhi 全局日志（记录操作）
```

- JiaoBen-RiZhi.md：记录「为什么这么做」（设计上下文）
- RiZhi 全局日志：记录「做了什么」（操作记录）
- 两者互补，缺一不可

### 页眉规则

与全局日志一致，页眉自解释。任何 Agent 读取 JiaoBen-RiZhi.md 即可了解：
1. 这是脚本日志，记录设计决策和版本变更
2. 修改脚本前必读
3. 每次修改后必须追加新版本

---

## 三、日志分层架构（虫洞化汇聚）

### 总控位置

`/workspace/.rizhi/` — 全局日志的汇聚点

- `RiZhi_TiLian.md` — **提炼日志（最新，L1 上下文恢复入口）**
- `RiZhi_{YYYY-MM-DD}.md` — 全局工作日志（每日一个）
- `{AppName}-JiaoBen/` — 目录级 Symlink 指向项目 JiaoBen 目录

### 提炼日志（RiZhi_TiLian.md）

> 沙箱重置后 Agent 的"记忆快照"，是渐进式披露的 L1 入口。
> 只保留一个文件（不按日期拆分），每次实质性工作后覆盖更新。

**存储位置**：`/workspace/.rizhi/RiZhi_TiLian.md`

**格式**：
```markdown
---
type: tiLian
updatedAt: {YYYY-MM-DD HH:MM}
author: {编入者身份}
---
# 日志提炼 — 系统状态快照

## 系统状态
- HB 仓库：{最新 commit 摘要}
- 已适配沙箱的技能：{列表}
- BAK 中的技能：{列表}
- 活跃项目：{列表}

## 最近工作（最近3条）
1. [{日期}] {一句话摘要} → 详见 RiZhi_{日期}.md
2. ...
3. ...

## 待办/未完成
- [ ] {待办项}

## 关键决策引用
- {技能名}/D{编号}: {一句话描述}
- {技能名}/L{编号}: {一句话描述}
```

**更新规则**：
- 每次完成实质性工作后，同步更新提炼日志
- 覆盖更新（不追加），始终保持最新状态
- 控制在 2KB 以内（约 50 行），确保 L1 读取高效

### 项目级脚本日志

`/workspace/XiangMu-KongJian/{AppName}/{AppName}-JiaoBen/JiaoBen-RiZhi.md`

脚本日志直接放在项目 JiaoBen 目录下，删除项目时日志自然跟着删除，零维护。

### 总控通过虫洞化汇聚查阅

`/workspace/.rizhi/{AppName}-JiaoBen/` → 目录级 Symlink 直达项目 JiaoBen 目录

一站式查阅所有项目日志，但不持有实体数据。

### 脚本快速调用入口

`/workspace/.jiaoben/{AppName}-JiaoBen/` → 目录级 Symlink 直达 `/workspace/XiangMu-KongJian/{AppName}/{AppName}-JiaoBen/`

只负责快速调用，不持有实体数据，原始文件存储在 XiangMu-KongJian 对应目录。

### 新建项目/脚本时

脚本日志直接写入项目 JiaoBen 目录，同时在总控下创建 Symlink 指向：

```bash
# 创建项目 JiaoBen 目录
mkdir -p /workspace/XiangMu-KongJian/{AppName}/{AppName}-JiaoBen

# 总控汇聚 Symlink
ln -s /workspace/XiangMu-KongJian/{AppName}/{AppName}-JiaoBen /workspace/.rizhi/{AppName}-JiaoBen

# 快速调用 Symlink
ln -s /workspace/XiangMu-KongJian/{AppName}/{AppName}-JiaoBen /workspace/.jiaoben/{AppName}-JiaoBen
```
