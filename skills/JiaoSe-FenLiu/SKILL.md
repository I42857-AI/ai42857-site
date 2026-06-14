---
name: role-diversion
description: 将项目目录中的大型源文件按角色分流到专属工作区，并在原始位置留下可溯源的快捷方式。当用户需要：(1) 按角色（美工/剪辑师/建模师等）分离大型源文件，(2) 让运营目录只保留轻量文件，(3) 在原始位置留下溯源链接，(4) 整理psd/ai/mp4/blend等大型文件时使用。触发词：分流、角色分离、源文件整理、美工用、视频用、建模用。
---

# 角色分流与溯源

将项目目录中的大型源文件按角色分流到专属工作区，原始位置留下 Symlink 符号链接作为溯源链接。

## 核心原则

1. **角色分流**：原始目录只保留轻量文件，大型源文件集中到角色专属文件夹
2. **溯源链接**：原始位置留下 Symlink 符号链接，指向分流后位置
3. **可扩展**：支持任意大型文件类型（psd/psb/ai/pur/mp4/mov/blend/max 等）

## 前置条件：环境检测

执行分流前**必须**检测 Symlink 支持状态。沙箱环境默认支持 Symlink（ln -s），无需额外配置。

验证命令：
```bash
ln -s /tmp/test_link /tmp/test_target 2>/dev/null && echo "Symlink OK" || echo "Symlink FAILED"
rm -f /tmp/test_link /tmp/test_target
```

## 参数配置

| 参数 | 说明 | 示例 |
|------|------|------|
| 根目录 | 需要处理的文件夹路径 | `/workspace/XiangMu-KongJian/项目文件汇总` |
| 角色文件夹名 | 分流目标文件夹名 | `美工用` / `视频用` / `建模用` |
| 分流文件类型 | 需要分流的大型文件扩展名 | `*.psd, *.psb, *.ai, *.pur` |
| 排除文件夹 | 不处理的文件夹（通配符） | `*\美工用\*, *\.bf\*` |
| 分组策略 | `auto`（自动检测）/ `custom`（自定义脚本） | `auto` |
| 自定义分组脚本 | custom 模式下的脚本路径 | `/workspace/.jiaoben/my-grouping.sh` |

## 操作流程

### Step 0：环境检测

检测 Symlink 支持状态，验证 ln -s 可用。

### Step 1：扫描分流文件

扫描根目录下所有匹配文件类型的文件，排除目标文件夹。

### Step 2：按项目分组

**auto 模式**（默认）：
1. 路径中查找产品编号（2+大写字母+数字，如 NY23051、TP610）→ 用作项目名
2. 未匹配 → 用源文件直接父文件夹名
3. 根目录文件 → 归入"根目录文件"

**custom 模式**：加载自定义脚本中的 `Get-ProjectName` 函数。

### Step 3：确认执行

展示分组结果，等待用户确认。

### Step 4：移动文件 + 创建溯源链接

对每个文件：
1. Move 到角色文件夹下对应项目子文件夹
2. 重名文件加父文件夹名前缀
3. 原始位置创建 Symlink 符号链接

### Step 5：清理空文件夹 + 记录日志

删除完全为空的文件夹，生成操作日志。

### Step 6：验证

扫描原始位置，确认无残留分流文件。

## 执行脚本

### 唯一方式：Python 脚本

**Python 是唯一执行工具**。沙箱环境默认 UTF-8，无中文编码问题。

```bash
python3 -u "{baseDir}/JiaoBen/role-diversion.py"
```

脚本顶部配置区域需根据实际需求修改。

> ⚠️ 文件迁移采用安全策略：先复制后验证再删除源文件（HAB-004 逻辑），避免移动中断导致数据丢失。

## 沙箱环境说明

沙箱环境（Linux）默认 UTF-8 编码，不存在 Windows 环境下的中文编码问题。

- Python3 原生支持 UTF-8，中文路径和文件名无乱码风险
- Symlink（ln -s）替代 .lnk 快捷方式，天然支持中文路径
- 无需 VBS 模板或 cscript 中间层

**Symlink 创建方式**：
```bash
ln -s "/path/to/分流目标/文件.psd" "/path/to/原始位置/文件.psd"
```

## 案例参考

按角色选择对应案例：

- **美工**：参见 [examples-designer.md](CanKao/examples-designer.md) — psd/psb/ai/pur 设计源文件分流
- **剪辑师**：参见 [examples-video-editor.md](CanKao/examples-video-editor.md) — mp4/mov/prproj 视频源文件分流
- **建模师**：参见 [examples-3d-modeler.md](CanKao/examples-3d-modeler.md) — blend/max/fbx 3D源文件分流
- **CASIMA 网络盘**：参见 [examples-casima-network.md](CanKao/examples-casima-network.md) — 网络盘中文路径 + 型号归并 + 角色分流
- **MLB 跨Agent交接**：参见 [examples-mlb-handoff.md](CanKao/examples-mlb-handoff.md) — 跨Agent交接 + 本地→网络盘.lnk迁移

## 常见角色文件类型速查

| 角色 | 典型文件类型 | 角色文件夹名建议 |
|------|-------------|----------------|
| 美工 | `*.psd, *.psb, *.ai, *.pur, *.cdr` | `美工用` |
| 剪辑师 | `*.mp4, *.mov, *.avi, *.mkv, *.prproj, *.aep, *.drp` | `视频用` |
| 建模师 | `*.blend, *.max, *.ma, *.mb, *.fbx, *.obj, *.ztl, *.3ds` | `建模用` |
| 工程师 | `*.dwg, *.rvt, *.skp, *.step, *.stp` | `工程用` |

## 异常处理

- **文件被占用**：跳过并记录到日志，不中断流程
- **重名冲突**：自动加父文件夹名前缀，仍冲突则追加序号

## 自进化机制（强制规则）

每次调用本技能后，必须执行知识归档：

### 归档要求

1. **记录新问题**：使用过程中遇到的新问题及解决方案，补充至案例参考或 SKILL.md
2. **建立交接文档**：当任务涉及跨 Agent 交接时，编写"统一母本交接指导"文档供接手 Agent 阅读
3. **更新案例**：新的项目类型、新的角色组合、新的文件格式 → 创建对应案例文档

### 去重与整合规则

| 情况 | 处理方式 |
|------|---------|
| 新问题与现有记录**完全相同** | 跳过，不重复记录 |
| 新问题与现有记录**高度类似** | 整合到现有章节，补充新细节，不新建独立条目 |
| 新问题**首次出现** | 新建完整记录 |

### 判断标准

- **完全相同**：现象、原因、解决方案三者均一致 → 跳过
- **高度类似**：现象不同但根因相同，或解决方案可归并 → 整合
- **首次出现**：根因和解决方案均与现有记录无重叠 → 新建

### 归档示例

| 新发现 | 现有记录 | 操作 |
|--------|---------|------|
| MLB 的 VBS 模板创建 .lnk | CASIMA 案例已记录 | 跳过（完全相同） |
| MLB 的本地→网络盘 .lnk 迁移 | 无现有记录 | 新建案例文档 |
| MLB 的清理跨 Agent 残留文件 | CASIMA 有清理空目录，但清理类型不同 | 整合到异常处理章节 |

## 归档规范

执行日志输出至 `/workspace/XiangMu-KongJian/{AppName}/JiaoFu-WenJian/`：
- 命名格式：`角色分流日志_{角色名}_{YYYYMMDD_HHMM}.log`
- 示例：`角色分流日志_美工用_20260513_1400.log`

---
最后更新：2026-06-14（沙箱环境适配版：Symlink 替代 .lnk + Python3 替代 PowerShell + 路径默认沙箱）
