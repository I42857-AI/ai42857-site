---
name: QianYi-WanWu
description: >
  万物迁移技能。将应用数据目录通过 SymbolicLink 符号链接迁移至统一数据源，
  实现透明读写。应用原路径只是虫洞/虚窗口，真实数据始终在数据源。
  支持新建 Symlink、验证 Symlink 指向、回退 Symlink 三种操作。
  基于 4.0 架构：/workspace/ 为管理层，/workspace/XiangMu-KongJian/ 为原始层。
metadata:
  priority: P1
---

> **2026-06-13 GengXin:** 沙箱环境适配版。路径全面对齐沙箱环境，
> 脚本扩展名 .ps1/.bat → .sh，PowerShell → Bash，
> 移除 Windows 专属章节（注册表、3.0 兼容层、ProgramData、Local 系统级回指），
> Symlink 清单按沙箱路径重组，AppData\Roaming 概念适配为 XDG 数据目录。
>
> **2026-06-09 GengXin:** 4.0 PC 域版全面对齐。修正 Roaming 目标路径与实际 Symlink 一致，
> 重构 Symlink 清单区分核心虫洞/显式 Symlink/虫洞等价实体目录，
> 新增 QClaw skills 目录级虫洞、Local 链接分区，
> 修复 HAB-004（先复制后验证再删除）、BAK 递增机制。

# QianYi-WanWu（万物迁移）

## 前言：数据跟着我走

万物迁移的核心价值是"数据跟着我走，环境即插即用"。

**使用场景：**
1. 在新环境中，执行一体化启动脚本 → Symlink 建立完毕
2. 打开应用 → 无缝使用自己的数据、技能、记忆、凭证
3. 需要调整时，执行回退脚本 → .bak 还原为原始目录
4. 全程可逆，随时切换

**关键设计：**
- 迁移时：原目录 BAK 递增备份（`.bak` / `.bak1` / `.bak2`...），Symlink 指向数据源
- 回退时：删除 Symlink，从 `.bak*` 恢复（优先恢复最早的备份）
- 全程可逆：迁移和回退互为逆操作，随时切换
- 安全兜底：创建失败自动回滚，验证失败自动回滚

## 核心理念

应用原路径是虫洞，数据源是真实宇宙。所有应用数据通过 Symlink 链接到统一数据源，
原路径只是虚窗口——应用以为数据在自己身边，实际读写全走数据源。

## 架构约束

- **管理层** = `/workspace/` + `/workspace/.agents/`（总控目录，实体 + Symlink 映射）
- **原始层** = `/workspace/XiangMu-KongJian/{App}/`（各应用真实数据）
- **检索层** = 苍穹扫描管理层目录（自动发现 + 快速启动）
- 收敛脚本替代手动建链，声明式配置 + 幂等执行
- .trae 内部采用映射链路：配置文件 → `.agents/skills/` 对应文件

## 迁移流程

### 一、新建 Symlink（数据已在数据源）

适用场景：数据源上已有真实数据，只需在应用原路径建立虫洞。

```
脚本：JiaoBen/ChuangJian-Symlink.sh
或收敛脚本：JiaoBen-Agents/YiLaiWeiHu/PC-Yu-ShouLian.sh
```

流程：
1. 检查目标目录是否存在于数据源
2. 检查源目录状态：
   - 不存在 → 直接创建 Symlink
   - 已是 Symlink → 验证指向是否匹配
     - 匹配 → 跳过（有效）
     - 不匹配 → 警告并询问是否重建
   - 普通目录 → BAK 递增备份 → 创建 Symlink
3. 读写验证
4. 报告结果

### 二、迁移数据 + 新建 Symlink（数据还在原路径）

适用场景：新发现的应用数据目录，需要先复制到数据源再建 Symlink。

```
脚本：JiaoBen/ChuangJian-Symlink.sh --migrate
```

额外步骤：在备份前先用 `cp -a` 将数据复制到数据源目标目录

### 三、回退 Symlink（单个）

适用场景：Symlink 有问题，需要恢复为本地目录。

手动执行以下步骤：
1. 检查软件是否在运行（`pgrep -f {ProcessName}`）
2. 检查是否是 Symlink（`test -L {SourceDir} && echo "Symlink"`）
3. 检查 .bak 备份是否存在
4. 删除 Symlink → 恢复 .bak

### 四、一键还原（全部）

适用场景：需要一键还原所有迁移，恢复原始环境。

```
脚本：JiaoBen/YiJian-HuanYuan.sh
```

扫描目录下所有 `.bak` 目录并逐个还原：
1. 检查相关进程是否在运行
2. 扫描目录下所有 `.bak` 目录
3. 对每个 .bak，检查同名目录是否是 Symlink：
   - 是 Symlink → 标记为可还原（删除 Symlink + 恢复 .bak）
   - 不是 Symlink 但存在 → 警告，不自动操作（避免误删数据）
   - 不存在 → 标记为可还原（直接恢复 .bak）
4. 展示还原清单，用户确认
5. 逐个执行还原
6. 验证还原结果

安全原则：
- 只处理有 .bak 对应的 Symlink，不盲目删除所有 Symlink
- 原目录存在但不是 Symlink → 不操作（可能是原有数据）
- 全程可预览，确认后才执行

## N合一分层原则（启动必需 vs 体验必需）

**分层定义：**
- **启动必需**：缺一则应用无法启动（如 QClaw 的 .qclaw + .openclaw）
- **体验必需**：缺一则应用能启动但无记忆/凭证，等于白用（如 Roaming → 无登录凭证）

⚠️ **移动办公场景下，体验必需 = 实际必需**：
即插即用要求应用带着记忆和用户信息，缺少数据目录等于免登录失败。
区分分层是为了排查优先级（启动必需优先修复），但建立虫洞时必须一次性全部建立。

**核心发现（2026-05-30 血泪教训）：**

一个应用的 Symlink 虫洞往往不是单个，而是 N 个一组。这 N 个 Symlink 按重要性分为
启动必需和体验必需两层。启动必需的 Symlink 缺任何一个都会导致应用崩溃或报错，
体验必需的 Symlink 缺失则无记忆/凭证。建立虫洞时必须**一次性全部建立**，
不能拆分处理。

**为什么必须 N 合一：**
- 应用启动时会按固定路径查找多个目录（配置、数据、缓存、日志等）
- 这些路径可能分布在文件系统的不同位置
- 任何一个路径断裂 → 应用初始化失败 → 报错或崩溃
- 错误信息通常只提示最后一个断裂点，真正的根因是更早的路径缺失

**建立虫洞前的必做检查：**
1. **启动条件清单**：列出应用正常运行所需的所有路径
2. **逐条验证**：确认数据源上每个路径对应的真实数据都存在
3. **一次性建立**：所有 Symlink 必须在同一批次中建立，不可分步
4. **整体验证**：建立后启动应用验证，而非逐个 Symlink 验证

**典型案例：QClaw 三合一虫洞（含技能虫洞保护）**

| Symlink | 原路径 | 数据源目标 | 缺失后果 |
|----------|---------|-----------|----------|
| .qclaw | `/workspace/.qclaw` | `/workspace/.qclaw`（虫洞等价实体） | 核心数据丢失，无法启动 |
| .qclaw/skills | `/workspace/.qclaw/skills` | `/workspace/.agents/skills`（目录级虫洞） | 自定义技能丢失（内置技能随更新被清理） |
| .openclaw | `/workspace/.openclaw` | `/workspace/.openclaw`（虫洞等价实体） | 框架层断裂，功能异常 |
| 数据目录 | `~/.local/share/QClaw` | `/workspace/XiangMu-KongJian/QClaw/credentials/{账号标识}/Roaming-QClaw` | 无登录凭证（QClaw 仍可启动，但显示未登录状态） |

三个 Symlink 缺任何一个，QClaw 都会报错。错误信息可能只提到 logs 路径，
但真正的问题是数据目录 Symlink 断裂，导致整个 Electron 日志系统崩溃。

**典型案例：TRAE 三合一虫洞（含两层映射子链接）**

| Symlink | 原路径 | 数据源目标 | 缺失后果 |
|------------------|---------|-----------|----------|
| .trae-cn | `/workspace/.trae-cn` | `/workspace/XiangMu-KongJian/TRAE/credentials/Trae CN` | 配置丢失，无法启动 |
| skills (两层映射) | `/workspace/.trae-cn/skills` → `/workspace/.agents/skills` | `/workspace/.agents/skills` | 技能列表为空 |
| SKILL.md (两层映射) | `/workspace/.trae-cn/rules/project_rules.md` → `/workspace/.agents/skills/TRAE-Rule/SKILL.md` | `/workspace/.agents/skills/TRAE-Rule/SKILL.md` | 全局规则不注入 |
| 数据目录 | `~/.local/share/TRAE SOLO CN` | `/workspace/XiangMu-KongJian/TRAE/credentials/TRAE SOLO CN` | 对话历史/工作区状态丢失 |

## 应用数据分散迁移

**核心发现：应用数据不仅存在用户目录，还存在于 XDG 数据目录**

TRAE 的对话历史存储在 `~/.local/share/TRAE SOLO CN/`（4GB），而非 `.trae-cn`。
仅迁移 `.trae-cn` 会导致对话记录留在本机，无法跨设备同步。

### 数据分布规律

| 目录类型 | 路径模式 | 存储内容 | 迁移状态 |
|----------|---------|---------|---------|
| 用户目录 | `/workspace/.{appname}` | 配置、技能、凭证 | ✅ 已迁移 |
| XDG 数据目录 | `~/.local/share/{AppName}` | 对话历史、工作区状态、缓存 | ⚠️ 需逐应用迁移 |
| XDG 缓存目录 | `~/.cache/{AppName}` | 运行时缓存、编译缓存 | ❌ 通常不迁移（可重建） |

### 数据目录迁移策略

1. **大目录（>10MB）**：用 `rsync -a` 复制到数据源 → 验证文件数/大小一致 → BAK 递增原目录 → 创建 Symlink（⚠️ HAB-004：禁止直接移动，先复制后验证再删除源目录）
2. **小目录（≤10MB）**：BAK 递增原目录，创建 Symlink
3. **目标路径规范**：`/workspace/XiangMu-KongJian/{AppName}/credentials/{账号标识}/Roaming-{AppName}`

### 终极目标：全数据目录黑洞化

当前阶段：逐应用迁移数据目录（QClaw、TRAE、Eagle、Codex、Billfish、2345Pic 已完成）
终极目标：整个 `~/.local/share/` 变成虫洞，所有应用数据自动同步

实现条件：
- 数据源空间充足（数据目录可能 10GB+）
- 所有常用应用的数据目录都已验证可安全迁移
- 非数据源应用的数据有隔离机制

**当前状态：等待时机成熟，暂按逐应用迁移**

## 已注册的迁移配置

### QClaw（三合一+技能虫洞，启动必需2+体验必需2）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `.qclaw` | `/workspace/.qclaw`（虫洞等价实体） | `openclaw.json` | QClaw |
| 1a | `.qclaw/skills` (目录级虫洞) | `/workspace/.agents/skills` | `TRAE-Rule/SKILL.md` | QClaw |
| 2 | `.openclaw` | `/workspace/.openclaw`（虫洞等价实体） | `identity/device.json` | QClaw |
| 3 | `~/.local/share/QClaw` | `/workspace/XiangMu-KongJian/QClaw/credentials/{账号标识}/Roaming-QClaw` | `Local State` | QClaw |

### TRAE（三合一含两层映射子链接）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `.trae-cn` | `/workspace/XiangMu-KongJian/TRAE/credentials/Trae CN` | `AGENTS.md` | TRAE |
| 1a | `.trae-cn/skills` (目录级) | `/workspace/.agents/skills` | `TRAE-Rule/SKILL.md` | TRAE |
| 1b | `.trae-cn/rules/project_rules.md` (文件级) | `/workspace/.agents/skills/TRAE-Rule/SKILL.md` | 内容可读 | TRAE |
| 1c | `.trae-cn/user_rules/SKILL.md` (文件级) | `/workspace/.agents/skills/TRAE-Rule/SKILL.md` | 内容可读 | TRAE |
| 1d | `.trae-cn/{AGENTS/SOUL/MEMORY/USER/IDENTITY/TOOLS/HEARTBEAT}.md` (文件级×7) | `/workspace/.agents/workspace/{对应文件}.md` | 内容可读 | TRAE |
| 2 | `~/.local/share/TRAE SOLO CN` | `/workspace/XiangMu-KongJian/TRAE/credentials/TRAE SOLO CN` | `Local State` | TRAE |
| 3 | `~/.local/share/Trae CN` | `/workspace/XiangMu-KongJian/TRAE/credentials/Trae CN` | — | TRAE |

### Eagle（二合一）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `~/.local/share/Eagle` | `/workspace/XiangMu-KongJian/EAGLE/YongHu-ShuJu` | — | Eagle |
| 2 | `/usr/local/share/Eagle` | `/workspace/XiangMu-KongJian/EAGLE/GongXiang-ShuJu` | — | Eagle |

### Codex（二合一）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `.codex` | `/workspace/.codex` | — | Codex |
| 2 | `~/.local/share/Codex++` | `/workspace/XiangMu-KongJian/CODEX/Roaming-Codex++` | — | Codex |

### Billfish（二合一）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `~/.local/share/Billfish` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/Billfish/Roaming-Billfish` | — | Billfish |
| 2 | `~/.local/state/Billfish` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/Billfish/Local-Billfish` | — | Billfish |

### 2345Pic（一合一）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `~/.local/share/2345Pic` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/2345Pic/Roaming-2345Pic` | — | 2345Pic |

### 2345Pic 子应用（三合一，与 2345Pic 同属一套）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `~/.local/share/2345DomainMon` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/2345Pic/Roaming-2345DomainMon` | — | 2345Pic |
| 2 | `~/.local/share/2345Preview` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/2345Pic/Roaming-2345Preview` | — | 2345Pic |
| 3 | `~/.local/share/2345SafeCenter` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/2345Pic/Roaming-2345SafeCenter` | — | 2345Pic |

### Marvis（一合一）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `~/.local/share/MarvisData` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/MarvisData` | — | Marvis |

### BillfishPkg（一合一，与 Billfish 同属一套）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `~/.local/share/BillfishPkg` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/Billfish/Roaming-BillfishPkg` | — | Billfish |

### TRAE 数据目录（二合一，与 .trae-cn 配置层同属一套）

| # | 源目录 | 目标目录 | 验证文件 | 进程名 |
|---|--------|----------|----------|--------|
| 1 | `~/.local/share/TRAE SOLO CN` | `/workspace/XiangMu-KongJian/TRAE/credentials/TRAE SOLO CN` | `Local State` | TRAE |
| 2 | `~/.local/share/Trae CN` | `/workspace/XiangMu-KongJian/TRAE/credentials/Trae CN` | — | TRAE |

## AGENT 使用指南

当用户要求迁移新应用时，必须按以下完整流程执行，确保无遗漏：

### 第一步：发现所有数据路径（N合一分层）

1. 确认应用的用户目录路径（如 `/workspace/.trae-cn`、`/workspace/.qclaw`）
2. **检查 `~/.local/share/{AppName}`** 是否存在（对话历史、工作区状态）
3. **检查 `~/.config/{AppName}`** 是否存在（应用配置）
4. **检查 `~/.cache/{AppName}`** 是否存在（通常不迁移，但需确认）
5. 列出所有启动条件路径（N合一分层原则）

### 第二步：确认数据源目标路径

1. 管理层路径（虫洞等价）：`/workspace/.{appname}` 或 `/workspace/.agents/JiaoBen-Agents/{AppName}`
2. 原始层路径（应用数据）：`/workspace/XiangMu-KongJian/{AppName}/credentials/{账号标识}/Roaming-{AppName}`
3. 遵循架构命名规范（中文拼音 PascalCase + kebab）
4. ⚠️ 切换账号机制：Symlink 指向 `credentials/{账号标识}/Roaming-$AppName`，切换 = 删除旧 Symlink + 创建新 Symlink 指向另一个 {账号标识} 文件夹

### 第三步：执行迁移

1. 确认验证文件名（目录下存在的特征文件）
2. 确认进程名（用于运行检测）
3. 选择迁移模式（新建 Symlink / 迁移+新建 Symlink）
4. **一次性建立所有 Symlink**（不可分步）
5. 启动应用整体验证

### 第四步：更新记录

1. 更新本技能的「已注册的迁移配置」表格
2. 更新收敛配置和 YiTi 脚本

### 迁移检查清单（防遗漏）

```
□ 用户目录（.{appname}）→ Symlink
□ ~/.local/share/{AppName} → Symlink（如存在）
□ ~/.config/{AppName} → Symlink（如存在）
□ 启动应用验证功能正常
□ 更新迁移配置表格
□ 更新收敛配置
```

触发词：迁移、Symlink、虫洞、虚窗口、数据迁移、万物迁移、QianYi、移动盘链接、N合一、缺一不可、收敛

## Symlink 层全量清单

> 以下清单记录了架构下所有 Symlink 链接关系。任何 Agent 在排查虫洞问题时，可参考此清单逐条验证。
> 清单按层级组织：显式 Symlink → 实体目录 → 数据目录链接 → .trae-cn 内部链接

### 显式 Symlink（指向 XiangMu-KongJian 或 .agents）

| # | 路径 | 目标 | 类型 | 说明 |
|---|------|------|------|------|
| 1 | `/workspace/.trae-cn` | `/workspace/XiangMu-KongJian/TRAE/credentials/Trae CN` | 目录级 | TRAE 配置（指向原始层） |
| 2 | `/workspace/.qclaw/skills` | `/workspace/.agents/skills` | 目录级 | QClaw 技能虫洞保护 |
| 3 | `/workspace/.trae-cn/skills` | `/workspace/.agents/skills` | 目录级 | TRAE 技能注入 |
| 4 | `/workspace/.trae-cn/rules/project_rules.md` | `/workspace/.agents/skills/TRAE-Rule/SKILL.md` | 文件级 | TRAE 项目规则注入 |
| 5 | `/workspace/.trae-cn/user_rules/SKILL.md` | `/workspace/.agents/skills/TRAE-Rule/SKILL.md` | 文件级 | TRAE 用户规则注入 |
| 6 | `/workspace/.trae-cn/AGENTS.md` | `/workspace/.agents/workspace/AGENTS.md` | 文件级 | 工作区指南 |
| 7 | `/workspace/.trae-cn/SOUL.md` | `/workspace/.agents/workspace/SOUL.md` | 文件级 | 灵魂 |
| 8 | `/workspace/.trae-cn/MEMORY.md` | `/workspace/.agents/workspace/MEMORY.md` | 文件级 | 记忆 |
| 9 | `/workspace/.trae-cn/USER.md` | `/workspace/.agents/workspace/USER.md` | 文件级 | 用户 |
| 10 | `/workspace/.trae-cn/IDENTITY.md` | `/workspace/.agents/workspace/IDENTITY.md` | 文件级 | 身份 |
| 11 | `/workspace/.trae-cn/TOOLS.md` | `/workspace/.agents/workspace/TOOLS.md` | 文件级 | 工具 |
| 12 | `/workspace/.trae-cn/HEARTBEAT.md` | `/workspace/.agents/workspace/HEARTBEAT.md` | 文件级 | 心跳 |

### 实体目录（虫洞等价，无需单独建 Symlink）

| # | 路径 | 说明 |
|---|------|------|
| 13 | `/workspace/.qclaw` | QClaw 配置（实体目录） |
| 14 | `/workspace/.openclaw` | OpenClaw 框架层（实体目录） |
| 15 | `/workspace/.codex` | Codex 配置（实体目录） |
| 16 | `/workspace/.agents` | 管理型总控（实体目录） |
| 17 | `/workspace/CangQiong` | 苍穹配置（实体目录） |
| 18 | `/workspace/RiZhi` | 日志总控（实体目录） |

### 数据目录链接（~/.local/share/ 下）

| # | 路径 | 目标 | 说明 |
|---|------|------|------|
| 19 | `~/.local/share/QClaw` | `/workspace/XiangMu-KongJian/QClaw/credentials/{账号标识}/Roaming-QClaw` | QClaw 数据 |
| 20 | `~/.local/share/TRAE SOLO CN` | `/workspace/XiangMu-KongJian/TRAE/credentials/TRAE SOLO CN` | TRAE 对话历史 |
| 21 | `~/.local/share/Trae CN` | `/workspace/XiangMu-KongJian/TRAE/credentials/Trae CN` | TRAE 配置数据 |
| 22 | `~/.local/share/Eagle` | `/workspace/XiangMu-KongJian/EAGLE/YongHu-ShuJu` | Eagle 数据 |
| 23 | `~/.local/share/Codex++` | `/workspace/XiangMu-KongJian/CODEX/Roaming-Codex++` | Codex 数据 |
| 24 | `~/.local/share/Billfish` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/Billfish/Roaming-Billfish` | Billfish 数据 |
| 25 | `~/.local/share/BillfishPkg` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/Billfish/Roaming-BillfishPkg` | Billfish 包数据 |
| 26 | `~/.local/share/2345Pic` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/2345Pic/Roaming-2345Pic` | 2345Pic 数据 |
| 27 | `~/.local/share/2345DomainMon` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/2345Pic/Roaming-2345DomainMon` | 2345 域名监控 |
| 28 | `~/.local/share/2345Preview` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/2345Pic/Roaming-2345Preview` | 2345 预览 |
| 29 | `~/.local/share/2345SafeCenter` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/2345Pic/Roaming-2345SafeCenter` | 2345 安全中心 |
| 30 | `~/.local/share/MarvisData` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/MarvisData` | Marvis 数据 |

### Local 链接

| # | 路径 | 目标 | 说明 |
|---|------|------|------|
| 31 | `~/.local/state/Billfish` | `/workspace/XiangMu-KongJian/RuanJian-AnZhaung/Billfish/Local-Billfish` | Billfish 本地数据 |

### .trae-cn 内部链接（两层映射）

> TRAE 应用访问 `/workspace/.trae-cn/.trae-cn/` 时，通过两层 Symlink 最终到达目标。
> 外层（#3-12）直接在 `/workspace/.trae-cn/` 下，内层（#32-42）在 `.trae-cn/.trae-cn/` 下回指外层。

| # | 链接路径 | 中间目标 | 最终目标 | 说明 |
|---|----------|---------|---------|------|
| 32 | `.trae-cn/.trae-cn/skills` | `/workspace/.trae-cn/skills` | `/workspace/.agents/skills` | 技能自动同步 |
| 33 | `.trae-cn/.trae-cn/rules/project_rules.md` | `/workspace/.trae-cn/rules/project_rules.md` | `/workspace/.agents/skills/TRAE-Rule/SKILL.md` | 全局规则注入 |
| 34 | `.trae-cn/.trae-cn/user_rules/SKILL.md` | `/workspace/.trae-cn/user_rules/SKILL.md` | `/workspace/.agents/skills/TRAE-Rule/SKILL.md` | 用户规则注入 |
| 35 | `.trae-cn/.trae-cn/AGENTS.md` | `/workspace/.trae-cn/AGENTS.md` | `/workspace/.agents/workspace/AGENTS.md` | 工作区指南 |
| 36 | `.trae-cn/.trae-cn/SOUL.md` | `/workspace/.trae-cn/SOUL.md` | `/workspace/.agents/workspace/SOUL.md` | 灵魂 |
| 37 | `.trae-cn/.trae-cn/MEMORY.md` | `/workspace/.trae-cn/MEMORY.md` | `/workspace/.agents/workspace/MEMORY.md` | 记忆 |
| 38 | `.trae-cn/.trae-cn/USER.md` | `/workspace/.trae-cn/USER.md` | `/workspace/.agents/workspace/USER.md` | 用户 |
| 39 | `.trae-cn/.trae-cn/IDENTITY.md` | `/workspace/.trae-cn/IDENTITY.md` | `/workspace/.agents/workspace/IDENTITY.md` | 身份 |
| 40 | `.trae-cn/.trae-cn/TOOLS.md` | `/workspace/.trae-cn/TOOLS.md` | `/workspace/.agents/workspace/TOOLS.md` | 工具 |
| 41 | `.trae-cn/.trae-cn/HEARTBEAT.md` | `/workspace/.trae-cn/HEARTBEAT.md` | `/workspace/.agents/workspace/HEARTBEAT.md` | 心跳 |

### N合一分层说明

- **QClaw**：
  - 启动必需：#13(.qclaw 实体) + #14(.openclaw 实体)，缺一则无法启动
  - 体验必需：#2(.qclaw/skills 目录级虫洞) + #19(数据目录)
  - 缺 #2 → QClaw 自定义技能丢失（内置技能随更新被清理，需虫洞保护）
  - 缺 #19 → 无登录凭证，需重新登录或切换账号脚本恢复
- **TRAE**：
  - 启动必需：#1(.trae-cn 目录级 Symlink)，缺一则无法启动
  - 体验必需：#3(skills 目录级) + #4-5(rules/user_rules 文件级) + #6-12(workspace 文件级)
  - 缺 #3 → 技能列表为空
  - 缺 #4-5 → 全局规则不注入
  - 缺 #6-12 → 灵魂/记忆/身份等 workspace 数据丢失

## 已知问题

### 1. 回退/还原为手动操作

- **说明**：回退 Symlink 和一键还原通过手动步骤完成，不依赖独立脚本
- **回退步骤**：检查进程 → 确认 Symlink → 删除 Symlink → 恢复 .bak 目录
- **一键还原步骤**：扫描 .bak 目录 → 逐个确认 → 删除 Symlink + 恢复 .bak
- **脚本参考**：`JiaoBen/HuiTui-Symlink.sh`（单个回退）、`JiaoBen/YiJian-HuanYuan.sh`（一键还原）

## BAK 机制说明

本技能涉及两种 BAK 机制，用途不同，不可混淆：

### 迁移 BAK（临时，迁移过程中使用）

- **格式**：`.bak` / `.bak1` / `.bak2`...（递增，不覆盖）
- **用途**：迁移时备份原目录，供回退使用
- **生命周期**：迁移成功后可清理，回退后自动消耗
- **位置**：与原目录同级（如 `/workspace/.qclaw.bak`）
- **原则**：优先恢复最早的备份（`.bak` > `.bak1` > `.bak2`）

### 归档 BAK（长期，TRAE-Rule 规范）

- **格式**：`{原文件名}.bak_{YYYYMMDD}`（带时间戳）
- **用途**：保留历史版本供参考
- **生命周期**：长期保留，收纳到 `.bak/` 目录
- **位置**：同级 `.bak/` 目录下
- **原则**：追加不覆盖，需要时从 `.bak/` 目录取出恢复

### 关键区别

| 维度 | 迁移 BAK | 归档 BAK |
|------|---------|---------|
| 命名 | `.bak` / `.bak1` / `.bak2` | `.bak_{YYYYMMDD}` |
| 时间戳 | 无 | 有 |
| 目录 | 同级 | `.bak/` 子目录 |
| 用途 | 回退安全网 | 历史版本存档 |
| 生命周期 | 临时 | 长期 |

### 修改方式

母本在 `/workspace/.agents/skills/` 目录下，可直接编辑。所有链接自动指向最新内容，无需额外操作。
技能实体在 `skills/` 中（出了 .agents 都是链接）。
