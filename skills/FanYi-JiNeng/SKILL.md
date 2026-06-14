---
name: "FanYi-JiNeng"
description: "AI技能库英译中翻译规范。指导Agent批量翻译英文技能文件为中文，解决编码乱码、长文件分段、子代理上下文注入、联系上下文准确翻译等问题。当用户要求翻译技能库/汉化文档/批量翻译英文文件时使用。"
---

# FanYi-JiNeng — AI 技能库英译中翻译规范

> 本规范是 Agent 执行英译中翻译任务的唯一权威参考。任何涉及中文文本写入的翻译任务必须遵循本规范，违反将导致不可逆的数据损坏。
>
> P0 设计哲学：翻译的敌人不是英文，是乱码。编码问题在翻译开始前就必须解决，
> 否则翻译完的文件打开全是问号——白干。
>
> P1 核心原则：Agent 翻译不是机翻，是"理解→重写"。必须先读懂上下文再翻译，
> 术语要统一，风格要一致，结构要保留。

---

## P0 编码安全（零容忍，违反=数据永久丢失）

### P0-1 中文写入工具：Write/Edit 工具或 Node.js（强制，BAN-001 死禁）

**最高优先级规则。违反此条，所有翻译工作作废。**

```
BAN-001: 中文文本/JSON 文件写入 → 使用 Write/Edit 工具或 Node.js fs.writeFileSync，禁止通过 Bash echo 重定向写入中文
```

**规则**：任何涉及中文文本写入文件的操作，**必须使用 Write/Edit 工具或 Node.js**（`fs.writeFileSync` + `utf8`），禁止通过 Bash `echo` 重定向写入中文文本。

**根因**：Bash `echo` 重定向写入中文文本时，可能因终端编码设置导致乱码，且无法保证 UTF-8 编码一致性。

**Node.js 写入模板**：
```javascript
const fs = require('fs');
const content = '翻译后的中文内容';
fs.writeFileSync('/path/to/file.md', content, 'utf8');
```

**⚠️ 无回退方案**：如果 Node.js 不可用且 Write/Edit 工具不适用，**停止翻译并报告**。禁止降级到 Bash echo 重定向写入中文文本。

### P0-2 文件读取编码检测

读取待翻译文件时，必须先确认编码。不同编码的文件读取方式不同，错误编码读取会导致乱码。

**BOM 检测规则**：

| BOM 字节 | 编码 | 处理 |
|----------|------|------|
| `EF BB BF` | UTF-8 with BOM | Node.js `utf8` 可正常读取，写入时去掉 BOM |
| `FF FE` | UTF-16 LE | 需用 `ucs2` 编码读取，翻译后以 UTF-8 写出 |
| 无 BOM | 纯 UTF-8（或 ANSI） | Node.js `utf8` 读取，如乱码则尝试 `latin1` |

**检测脚本**（Node.js）：
```javascript
const fs = require('fs');
const bytes = fs.readFileSync(filePath);
if (bytes[0] === 0xFF && bytes[1] === 0xFE) console.log('UTF-16 LE');
else if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) console.log('UTF-8 with BOM');
else console.log('Plain UTF-8');
```

**原则**：翻译完成后，统一用 Node.js 写入 UTF-8（无 BOM），不要在中间步骤改编码。

### P0-3 换行符保护

原始文件的换行符（LF / CRLF）必须在翻译后保持一致。

- Git 管理的仓库通常用 LF
- Windows 本地文件可能用 CRLF
- Node.js `fs.writeFileSync` 默认保留 JavaScript 字符串中的 `\n`

**保护方法**：
```javascript
const fs = require('fs');
// 读取时检测换行符类型
const original = fs.readFileSync(filePath, 'utf8');
const lineEnding = original.includes('\r\n') ? '\r\n' : '\n';
// 翻译 original → translated
// 写入时确保换行符与原文一致
const normalized = translated.replace(/\r?\n/g, lineEnding);
fs.writeFileSync(filePath, normalized, 'utf8');
```

### P0-4 翻译前必须备份原文件

**规则**：翻译任何文件前，必须先创建备份。

**备份格式**：`{原文件名}.bak_{YYYYMMDD}`
**备份位置**：同级 `.bak/` 目录

**流程**：
1. 创建 `.bak/` 目录（如不存在）
2. 复制原文件到 `.bak/{原文件名}.bak_{YYYYMMDD}`
3. 翻译内容写入原文件（覆盖英文原文）
4. 验证翻译结果
5. 备份保留，不自动删除

**为什么必须备份**：
- 翻译可能出错，需要回退到英文原文
- 中文编码一旦损坏，原文是唯一恢复源
- 保留原文便于后续对照和校对

---

## P1 翻译质量（核心质量保障）

### P1-1 术语表优先（一致性保障）

**规则**：翻译前先建立术语表，翻译过程中严格遵循。

**术语表格式**：
```markdown
| English | 中文 | 备注 |
|---------|------|------|
| skill | 技能 | 不译为"技巧" |
| prompt | 提示词 | 不译为"提示" |
| agent | 代理/Agent | 专有名词保留英文 |
| workflow | 工作流 | |
| token | token | 专有名词不翻译 |
| context window | 上下文窗口 | |
| sub-agent | 子代理 | |
| dispatch | 派发 | 不译为"调度" |
```

**术语表来源**：
1. 从翻译目标文件中提取高频专业术语
2. 参考已有中文技能库（如 TRAE-Rule、JiaoBen-GuiFan）的用词习惯
3. 用户指定的术语偏好
4. **glossary.json 翻译记忆**：优先查阅同目录下的 `glossary.json`（见附录 D），已有术语直接复用

**术语冲突处理**：
- 同一术语在多个文件中出现 → 全部统一为术语表中的译法
- 术语表未覆盖的新术语 → 翻译时标注 `[待确认]`，汇总后由用户审定
- 每次翻译新技能后，将新术语追加到 `glossary.json`

### P1-2 联系上下文翻译（准确性保障）

**规则**：翻译必须联系上下文，禁止逐字逐句机械翻译。

**核心原则**：
1. **先通读再翻译**：翻译一个文件前，先完整阅读（或分段阅读），理解整体语境
2. **术语消歧**：同一英文词在不同上下文中可能有不同译法
   - `state` → 状态（程序状态）/ 州（地理）/ 声明（声明状态）
   - `configuration` → 配置（系统配置）/ 构型（化学构型）
3. **保持逻辑连贯**：翻译后的中文段落必须逻辑通顺，不能出现"翻译腔"
4. **技术准确性**：技术文档中的描述必须与代码行为一致

**反面教材**：
> EN: "The script uses dot-source to load shared functions, then asserts prerequisites before creating Symlinks."
> ❌ 机翻: "脚本使用点源加载共享函数，然后在创建符号链接之前断言前置条件。"
> ✅ 正确: "脚本通过 dot-source 引入共享函数，先检测前置条件，再创建 Symlink。"

**翻译质量自检**：
- 翻译完成后，通读中文版本，检查是否有：
  - [ ] 未翻译的英文段落（遗漏）
  - [ ] 语义不通顺的句子（机械翻译）
  - [ ] 术语不一致（同一词不同译法）
  - [ ] 代码块被误翻译（应保留原文）
  - [ ] Frontmatter 格式损坏（YAML 解析错误）

### P1-3 翻译范围界定

**翻译**：
- Markdown 正文（标题、段落、列表、表格）
- 代码注释（`//`、`#`、`/* */`）
- Frontmatter 的 `description` 字段（翻译为中文）

**不翻译**：
- 代码块内的代码（变量名、函数名、语法关键字）
- **代码块内的字符串字面量**（如 `console.log("success")` 中的 `"success"` 不翻译）
- Frontmatter 的 `name` 字段（技能标识符，必须保持英文）
- 文件路径（`/path/to/file`）
- 命令行指令（`npm install`、`git push`）
- URL 链接
- JSON/YAML 的 key（只翻译 value）
- 行内代码（单个反引号包裹的内容）

### P1-4 翻译风格

| 场景 | 风格 | 示例 |
|------|------|------|
| 技术文档 | 准确、简洁、专业 | "创建 Symlink 指向目标路径" |
| 用户指南 | 友好、清晰、步骤化 | "第一步：打开设置页面" |
| 规则/约束 | 严肃、明确、无歧义 | "使用 Write/Edit 工具或 Node.js 写入中文文本" |
| 注释 | 简短、说明性 | "// 检测 Symlink 是否断链" |

**中文风格统一**：
- 使用中文技术社区的通用表达，不要生造术语
- 保持原文的语气（命令式/说明式/警告式）
- 警告/注意标记保留（⚠️、❌、✅、🔴），只需翻译旁边的文字
- 列表序号保留

### P1-5 技术术语保留规则

以下类型**不翻译**或**首次出现时保留英文+括号注中文**：

| 类型 | 处理 | 示例 |
|------|------|------|
| API / 函数名 | 不翻译 | `New-SafeSymLink`、`Assert-AllPrerequisites` |
| 命令行工具 | 不翻译 | `npm`、`npx`、`git` |
| 文件名 / 路径 | 不翻译 | `TRAE-YiTi.sh`、`/workspace/.agents/` |
| 协议 / 标准 | 不翻译 | `UTF-8`、`JSON`、`LF/CRLF` |
| 专有名词 | 首次翻译后统一 | `SymbolicLink（符号链接）`，后续简写 Symlink |
| 代码关键字 | 不翻译 | `try/catch`、`$ErrorActionPreference` |
| 框架/库名 | 不翻译 | `Node.js`、`React`、`Express` |
| 配置项名 | 不翻译 | `BAN-001`、`HAB-001` |

---

## P2 长文件处理（效率与完整性保障）

### P2-1 结构扫描 + 分区拆分（四遍法）

技能文件动辄数百行，Agent 无法一次读完。**禁止一次性全量读取后翻译**——会导致上下文丢失、术语不统一、后半部分质量断崖下降。

**四遍法流程**：

```
第一遍：结构扫描
  ↓ 只读标题行（grep '^#'），建立文件骨架认知
  ↓ 统计行数，决定策略
第二遍：分区翻译
  ↓ 按 ## 大节拆分，每节作为一个翻译单元
  ↓ 每翻译完一节，记录本节核心术语表
第三遍：术语统一
  ↓ 对照术语表，全局替换不一致翻译
第四遍：格式校验
  ↓ 检查 Markdown 结构完整性、链接有效性、代码块闭合
```

**翻译单元划分规则**：

| 文件大小 | 策略 | 每次处理 |
|----------|------|----------|
| < 100 行 | 全文一次翻译 | 整个文件 |
| 100-500 行 | 按 ## 大节拆分 | 每节独立翻译 |
| 500-1000 行 | 按 ## 大节拆分 + 术语表辅助 | 每节独立翻译 + 跨节术语检查 |
| > 1000 行 | 按 ### 小节拆分 + 子代理协助 | 多代理并行翻译 + 汇总统一 |

**分页读取参数**：
```
offset: 起始行号（0-based）
limit: 每次读取行数（建议 100-200 行）
```

**关键**：每次分页读取时，前 5 行做上下文锚点——如果上一页最后 5 行和本页前 5 行重叠，则合并翻译上下文，保证跨页术语一致。

### P2-2 逐节翻译 + 临时文件合并（段式合并法）

**核心变更**：不再使用 `readFileSync → append → writeFileSync` 的追加写入方式。改为每段翻译写入独立临时文件，全部完成后合并为最终文件。这防止翻译中断导致半成品文件。

**段式合并流程**：
```
1. 读取原文件 → 按 ## 标题拆分为 N 个段落
2. 逐段翻译：
   a. 读取当前段 + 上一段末尾（衔接上下文）
   b. 翻译当前段
   c. 将翻译结果写入临时文件 .bak/section_{N}.tmp
3. 全部段落翻译完成后：
   a. 按序读取所有 .tmp 文件
   b. 合并为完整翻译文件
   c. 用 Node.js 写入最终目标路径
   d. 清理 .tmp 文件
```

**段式合并 Node.js 脚本**：
```javascript
const fs = require('fs');
const path = require('path');

// 合并所有临时段文件为最终翻译文件
function mergeSections(outputPath, sectionCount) {
  let fullContent = '';
  for (let i = 1; i <= sectionCount; i++) {
    const tmpPath = path.join(path.dirname(outputPath), '.bak', `section_${i}.tmp`);
    if (fs.existsSync(tmpPath)) {
      fullContent += fs.readFileSync(tmpPath, 'utf8');
    }
  }
  fs.writeFileSync(outputPath, fullContent, 'utf8');
  console.log(`Merged ${sectionCount} sections into: ${outputPath}`);
}

// 清理临时文件
function cleanupSections(outputPath, sectionCount) {
  for (let i = 1; i <= sectionCount; i++) {
    const tmpPath = path.join(path.dirname(outputPath), '.bak', `section_${i}.tmp`);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}
```

**中断恢复**：如果翻译中途断开，检查 `.bak/section_*.tmp` 文件，从最后一个已完成的段继续，无需从头开始。

### P2-3 大批量文件分批策略

**问题**：技能库可能有 30+ 个文件，单次对话无法全部完成。

**分批原则**：
1. **按优先级排序**：核心技能优先翻译，辅助技能后翻译
2. **每批 5-8 个文件**：避免上下文溢出
3. **批次间传递进度**：每批完成后记录进度，下一批从断点继续

### P2-4 翻译进度跟踪

进度文件位置：`{项目目录}/FanYi-JinDu.md`

**进度记录格式**：
```markdown
## 翻译进度

| 文件 | 状态 | 备注 |
|------|------|------|
| skill-1/SKILL.md | ✅ 已完成 | |
| skill-2/SKILL.md | ✅ 已完成 | 术语"dispatch"统一为"派发" |
| skill-3/SKILL.md | 🔄 进行中 | |
| skill-4/SKILL.md | ⏳ 待翻译 | |
```

---

## P3 子代理编排（规模化翻译执行）

### P3-1 子代理派发五要素（强制）

**规则**：向子代理派发翻译任务时，必须传递以下五要素，缺一不可：

| 要素 | 说明 | 翻译场景示例 |
|------|------|-------------|
| 1. 指导文件内容 | 宪法级兜底规则 | 本 SKILL.md 的核心规则（P0 编码安全 + P1 翻译质量） |
| 2. 项目摘要 | 产品定义、约束条件 | "Codux 技能库英译中，30+个 Markdown 文件，技术文档风格" |
| 3. 输出格式要求 | 翻译后的文件格式 | "保持原 Markdown 结构，代码块不翻译，仅翻译注释和说明文字" |
| 4. 文件输出路径 | 翻译结果写入位置 | "/workspace/XiangMu-KongJian/{AppName}/skills/{skill-name}/SKILL.md" |
| 5. 工具选择约束 | 中文文本→Write/Edit 或 Node.js | "⚠️ 中文文本写入必须用 Write/Edit 工具或 Node.js（BAN-001），禁止 Bash echo 重定向" |

**子代理无历史上下文**：子代理不知道之前踩过的坑，五要素是唯一的上下文注入机制。遗漏任何要素都可能导致返工。

**派发模板**：
```
⚠️ 翻译任务派发（FanYi-JiNeng 规范）

【指导文件】
- P0-1: 中文写入必须用 Write/Edit 工具或 Node.js，禁止 Bash echo 重定向
- P0-2: 读取前检测文件编码（BOM 检测）
- P0-3: 保持原文换行符（LF/CRLF）
- P0-4: 翻译前必须备份原文件到 .bak/ 目录
- P1-1: 术语表优先，保持一致性
- P1-3: 代码块不翻译，仅翻译注释和说明文字；字符串字面量不翻译

【项目摘要】
{应用名} 技能库英译中。{文件数量}个 Markdown 文件，技术文档风格。

【输出格式】
保持原 Markdown 结构不变。Frontmatter 的 name 字段保留英文，
description 字段翻译为中文。代码块内的代码不翻译，注释翻译为中文，
字符串字面量不翻译。

【文件输出路径】
翻译结果直接写入原文件（覆盖英文原文）。备份在同级 .bak/ 目录。

【工具选择约束】
⚠️ 中文文本写入必须使用 Write/Edit 工具或 Node.js（fs.writeFileSync + utf8），禁止 Bash echo 重定向。
违反将导致不可逆中文乱码，原始内容永久丢失。Node.js 不可用时停止翻译并报告。
```

### P3-2 结构化任务参数格式（强制）

向子代理派发翻译任务时，`task` 参数必须使用以下标签结构：

```
<overall_goal>
将 [技能名] 从英文汉化为中文。共 [N] 个章节，当前子代理负责第 [X] 章。
</overall_goal>
<current_task>
翻译以下内容为中文。保留所有 Markdown 格式、代码块、YAML Front Matter。
术语表：[粘贴当前翻译单元的术语对照表]
待翻译内容：
[粘贴待翻译的章节原文]
</current_task>
```

**上下文锚点**：在 `<current_task>` 中追加跨节信息：
```
前一章概要：[上一章的 2-3 句话中文摘要]
本章位置：第 X/Y 章
后续内容预告：[下一章的 1 句话主题]
```

### P3-3 memory_ids 术语表注入

翻译中最怕术语不一致。同一英文术语在不同子代理中翻译成不同中文——这是翻译事故。

**解决方案**：将术语表作为 memory 注入每个子代理。

```
# 第一步：主 Agent 读完全文，建立全局术语表
术语表 = {
  "agent": "Agent",
  "skill": "技能",
  "Symlink": "Symlink（符号链接）",
  "dispatch": "派发",
  "sub-agent": "子代理",
  ...
}
```

将术语表写入临时文件 → 读取该文件获得 memory_id → 每个子代理的 `memory_ids` 都带上。

### P3-4 子代理数量控制

| 文件行数 | 子代理数量 | 每人分配 |
|----------|-----------|----------|
| < 500 行 | 1 | 全文 |
| 500-1000 行 | 2-3 | 3-5 个大节 |
| 1000-2000 行 | 4-5 | 2-3 个大节 |
| > 2000 行 | 5-8 | 1-2 个大节 |

**禁止**：为每个小节（###）单独派发子代理——过多子代理会导致术语碎片化。

### P3-5 子代理返回验证

**规则**：子代理返回后，主代理必须验证以下内容：

1. **产品概念一致**：翻译内容与原文语义一致，无曲解
2. **输出格式正确**：Markdown 结构完整，Frontmatter 未损坏
3. **文件位置正确**：翻译结果写入了指定路径
4. **编码正确**：用 Node.js 读取文件，验证中文无乱码
5. **术语一致**：抽检术语表中的关键词，确认翻译统一

**验证脚本**：
```javascript
const fs = require('fs');
const content = fs.readFileSync(filePath, 'utf8');
// 检查是否有乱码特征
const hasGarbage = /[\x00-\x08\x0E-\x1F]/.test(content);
// 检查 Frontmatter 完整性
const hasFrontmatter = content.startsWith('---');
// 检查是否有未翻译的大段英文（超过3行连续英文）
const lines = content.split('\n');
let consecutiveEnglish = 0;
for (const line of lines) {
  if (/^[a-zA-Z\s\W]+$/.test(line) && line.length > 50) consecutiveEnglish++;
  else consecutiveEnglish = 0;
}
const hasUntranslated = consecutiveEnglish > 3;
console.log(`Garbage: ${hasGarbage}, Frontmatter: ${hasFrontmatter}, Untranslated: ${hasUntranslated}`);
```

### P3-6 汇总与术语统一

所有子代理完成后，主 Agent 必须：
1. 拼接所有翻译结果
2. 全局搜索替换术语不一致处（用术语表做正则替换）
3. 检查 Markdown 结构完整性
4. 输出最终翻译文件

---

## P4 特殊场景处理

### P4-1 Frontmatter 处理

**规则**：SKILL.md 的 Frontmatter（`---` 之间的 YAML）需要特殊处理：

```yaml
---
name: "skill-name"          # ← 不翻译（技能标识符，必须保持英文）
description: "..."           # ← 翻译为中文（触发条件描述）
---
```

**翻译 description 字段时**：
- 保持英文语法结构中的触发条件语义
- 格式："做X。当用户要求Y或提到Z时使用。"
- 长度控制在 200 字符以内

### P4-2 代码块处理

**规则**：代码块（` ``` ` 包裹的内容）内的代码不翻译，但注释翻译。

```markdown
❌ 错误：翻译代码
```javascript
// 创建符号链接
const symlink = 创建符号链接(路径, 目标);
```

✅ 正确：只翻译注释
```javascript
// 创建符号链接
const symlink = createSymlink(path, target);
```
```

**代码块内翻译规则**：

| 内容类型 | 是否翻译 | 示例 |
|----------|----------|------|
| `//` 单行注释 | ✅ 翻译 | `// Create symlink` → `// 创建符号链接` |
| `/* */` 多行注释 | ✅ 翻译 | `/* Configuration */` → `/* 配置 */` |
| `#` Shell/Python 注释 | ✅ 翻译 | `# Install deps` → `# 安装依赖` |
| 字符串字面量 | ❌ 不翻译 | `console.log("success")` 保持原样 |
| 变量名、函数名 | ❌ 不翻译 | `createSymlink` 保持原样 |
| 语法关键字 | ❌ 不翻译 | `const`、`if`、`return` 保持原样 |

**⚠️ 关键修正**：字符串字面量中的文字（如 `console.log("success")` 中的 `"success"`）**不翻译**。只有注释才翻译。原因是字符串字面量是代码逻辑的一部分，翻译可能导致程序行为改变。

### P4-3 表格处理

**规则**：Markdown 表格的表头翻译为中文，内容按语境翻译。

```markdown
| English Header | Chinese Header |
|----------------|-----------------|
| Keep code      | 保留代码         |
```

**注意**：
- 表格对齐符号（`|---|`）不要翻译或删除
- 表格内的代码/路径不翻译
- 对齐空格保持原样
- 表格宽度可能因中文字符变宽，不需刻意对齐

### P4-4 链接和引用处理

**规则**：
- Markdown 链接 `[显示文字](URL)` → 翻译显示文字，URL 不变
- 图片链接 `![alt](URL)` → 翻译 alt 文字，URL 不变
- 文件路径引用 → 不翻译路径，但可以翻译路径前的说明文字

### P4-5 混合语言处理

**场景**：原文中英文混用（如中文技能库中引用英文术语）。

**规则**：
- 英文专有名词（Agent、Symlink、Node.js）→ 保留英文，首次出现时加中文注释
- 技术术语有通用中文译法 → 使用中文译法
- 无通用译法的术语 → 保留英文，加括号注释

**示例**：
```
原文: "Use ProcessStartInfo to inject environment variables"
译文: "使用 ProcessStartInfo 注入环境变量"
```

---

## P5 翻译流程（完整执行链）

### P5-1 翻译前准备

```
Step 1: 文件预检
  ├─ 检查编码（UTF-8 / UTF-16 / ANSI，见 P0-2）
  ├─ 检查换行符（LF / CRLF，见 P0-3）
  ├─ 统计行数，决定策略（见 P2-1）
  └─ 建立备份（.bak/ 目录，见 P0-4）

Step 2: 结构扫描
  ├─ 提取所有 # / ## / ### 标题
  ├─ 识别 YAML Front Matter
  ├─ 识别代码块区域（不可翻译区）
  └─ 拆分为翻译单元

Step 3: 术语表建立
  ├─ 扫描全文高频技术术语
  ├─ 对照已有翻译记忆（如 glossary.json，见附录 D）
  ├─ 确定每个术语的唯一译法
  └─ 写入临时术语表文件
```

### P5-2 单文件翻译流程（段式合并法）

```
1. 读取原文件（英文）
2. 分析文件结构（Frontmatter + 正文 + 代码块）
3. 检测编码和换行符（P0-2、P0-3）
4. 备份原文件到 .bak/ 目录（P0-4）
5. 按 ## 标题拆分为翻译单元
6. 逐单元翻译：
   a. 读取当前单元 + 上一单元末尾（衔接上下文）
   b. 翻译当前单元
   c. 将翻译结果写入 .bak/section_{N}.tmp（段式合并，见 P2-2）
7. 全部单元翻译完成后，合并所有 .tmp 文件为最终文件
8. 用 Node.js 写入翻译结果（P0-1）
9. 清理 .tmp 文件
10. 验证翻译质量（自检清单）
11. 更新翻译进度（FanYi-JinDu.md）
```

### P5-3 批量翻译流程

```
1. 主代理：制定术语表 + 排定优先级 + 分配批次
2. 每批次（5-8个文件）：
   a. 派发子代理（注入五要素 + 术语表 + 参考样本）
   b. 子代理执行翻译（段式合并法）
   c. 主代理质量抽检
   d. 更新翻译进度
3. 全部完成后：通读抽检 + 术语一致性检查
```

### P5-4 翻译后验证

```
1. 编码验证：Node.js 读取所有翻译文件，检查无乱码
2. 结构验证：Markdown 解析器检查格式完整性
3. 术语验证：抽检术语表中的关键词，确认翻译统一
4. 语义验证：随机抽取 20% 文件，对比原文检查语义准确性
5. 功能验证：如有条件，启动应用验证技能文件可被正确加载
```

**验证脚本**（同 P3-5）：
```javascript
const fs = require('fs');
const content = fs.readFileSync(filePath, 'utf8');
const hasGarbage = /[\x00-\x08\x0E-\x1F]/.test(content);
const hasFrontmatter = content.startsWith('---');
const lines = content.split('\n');
let consecutiveEnglish = 0;
for (const line of lines) {
  if (/^[a-zA-Z\s\W]+$/.test(line) && line.length > 50) consecutiveEnglish++;
  else consecutiveEnglish = 0;
}
const hasUntranslated = consecutiveEnglish > 3;
console.log(`Garbage: ${hasGarbage}, Frontmatter: ${hasFrontmatter}, Untranslated: ${hasUntranslated}`);
```

### P5-5 翻译场景

| 场景 | 操作 | BAK |
|------|------|-----|
| 新建中文技能 | 复制 SKILL.md → SKILL_ZH.md，只翻译 SKILL_ZH.md | 不需要 |
| 覆盖原有技能 | 原始文件 → .bak，翻译后覆盖原路径 | 必须 BAK |
| 共享技能库（Symlink） | 在源文件位置翻译，所有 Agent 即时同步 | 必须 BAK |

---

## P6 常见陷阱与实战经验

### P6-1 编码陷阱

| 陷阱 | 表现 | 防御 |
|------|------|------|
| 混用编码读写 | 部分字符损坏 | 全链路统一 UTF-8 |
| UTF-16 LE 源文件 | Node.js 默认 utf8 读取乱码 | 先做 BOM 检测（P0-2） |
| 换行符混用 | diff 全红，git 报错 | 翻译前检测并保持一致（P0-3） |

### P6-2 翻译陷阱

| 陷阱 | 表现 | 防御 |
|------|------|------|
| 逐字翻译 | 中文不通顺，翻译腔 | 先通读理解再翻译 |
| 术语不统一 | 同一英文词多种译法 | 术语表强制 + glossary.json |
| 代码块误翻译 | 代码无法执行 | 明确翻译范围（P1-3） |
| 字符串字面量被翻译 | 程序行为改变 | 字符串字面量不翻译（P4-2） |
| Frontmatter 损坏 | 技能无法加载 | 特殊处理 Frontmatter（P4-1） |
| 遗漏段落 | 翻译不完整 | 翻译后对比原文行数 |
| 表格损坏 | Markdown 渲染失败 | 不动表头分隔行和竖线（P4-3） |

### P6-3 子代理陷阱

| 陷阱 | 表现 | 防御 |
|------|------|------|
| 未注入编码规则 | 子代理用 Bash echo 写中文 | 五要素强制注入（P3-1） |
| 未注入术语表 | 术语不一致 | 每批任务附带术语表 + memory_ids（P3-3） |
| 未注入参考样本 | 风格不统一 | 提供已翻译文件作为参考 |
| 子代理返回未验证 | 翻译错误未发现 | 强制抽检 20%（P3-5） |
| 进度未记录 | 重复翻译或遗漏 | FanYi-JinDu.md 实时更新（P2-4） |
| 过多子代理 | 术语碎片化 | 按 P3-4 控制数量 |
| 子代理缺上下文 | 章节间逻辑断裂 | 追加上下文锚点（P3-2） |

### P6-4 实战案例

**案例 1：mrbeast-perspective 汉化实录**

1. 原文 36 页手册 + 6 个播客 + 决策记录的深度调研，内容密集
2. 先全文扫描建立术语锚点（MrBeast 专有术语如 "retention"→"留存率"、"CTR"→"点击率"）
3. 分 4 个单元翻译，每个单元注入术语表 memory
4. 汇总时发现"hook"一词在不同上下文有不同译法（"钩子/吸引点/开头爆点"），最终统一为"钩子"
5. 代码脚本不翻译，只翻译注释

**案例 2：html-report-design-system 汉化实录**

1. 此技能含大量 CSS/HTML 代码片段
2. 代码块（反引号包裹）全部保留，只翻译外部的说明文字
3. 设计系统色值（如 `#3B82F6`）不翻译
4. 组件名称保留英文（如 `Tab`、`Stepper`、`Carousel`），说明文字翻译中文

**案例 3：BAN-001 血泪教训**

在 Windows 环境下曾因 PowerShell 编码问题导致中文翻译文件全文乱码（PowerShell Set-Content 在英文系统上默认编码不是 UTF-8）。沙箱环境默认 UTF-8 无此风险，但仍需遵守 BAN-001：禁止通过 Bash echo 重定向写入中文文本，统一使用 Write/Edit 工具或 Node.js 写入。

### P6-5 快速检查清单

翻译完成后，逐项确认：

- [ ] 文件使用 Write/Edit 工具或 Node.js UTF-8 写入
- [ ] YAML Front Matter 的 `name` 字段保留英文
- [ ] YAML Front Matter 的 `description` 字段已翻译为中文
- [ ] 所有代码块（```）内容未翻译
- [ ] 代码块内字符串字面量未翻译
- [ ] 代码块内注释已翻译为中文
- [ ] 所有行内代码（`）未翻译
- [ ] 所有 URL 和文件路径未翻译
- [ ] 表格结构完整（分隔行和竖线都在）
- [ ] 术语表一致（同一英文词全文件同一中文译法）
- [ ] 原始文件已 BAK 化（.bak_YYYYMMDD）
- [ ] 换行符与原文一致（LF/CRLF）
- [ ] Markdown 链接语法完整（`[text](url)` 格式未损坏）
- [ ] 临时段文件已清理（.bak/section_*.tmp）

---

## 附录 A：Node.js 翻译工具脚本模板（段式合并版）

```javascript
// translate-file.js - 单文件翻译工具（段式合并法）
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node translate-file.js <file-path>'); process.exit(1); }

// Step 1: 检测编码
const rawBytes = fs.readFileSync(filePath);
let encoding = 'utf8';
if (rawBytes[0] === 0xFF && rawBytes[1] === 0xFE) {
  encoding = 'ucs2';
  console.log('Detected: UTF-16 LE');
} else if (rawBytes[0] === 0xEF && rawBytes[1] === 0xBB && rawBytes[2] === 0xBF) {
  console.log('Detected: UTF-8 with BOM');
} else {
  console.log('Detected: Plain UTF-8');
}

// Step 2: 读取原文
const original = fs.readFileSync(filePath, encoding);

// Step 3: 检测换行符
const lineEnding = original.includes('\r\n') ? '\r\n' : '\n';
console.log(`Line ending: ${lineEnding === '\r\n' ? 'CRLF' : 'LF'}`);

// Step 4: 备份
const bakDir = path.join(path.dirname(filePath), '.bak');
if (!fs.existsSync(bakDir)) fs.mkdirSync(bakDir, { recursive: true });
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const bakPath = path.join(bakDir, `${path.basename(filePath)}.bak_${today}`);
if (!fs.existsSync(bakPath)) {
  fs.writeFileSync(bakPath, original, 'utf8');
  console.log(`Backed up to: ${bakPath}`);
}

// Step 5: 按 ## 标题拆分为段落
const sections = original.split(/(?=^## )/m);
console.log(`Split into ${sections.length} sections`);

// Step 6: 逐段翻译（由 Agent 在运行时填充翻译逻辑）
// for (let i = 0; i < sections.length; i++) {
//   const translated = translate(sections[i]);
//   const tmpPath = path.join(bakDir, `section_${i + 1}.tmp`);
//   fs.writeFileSync(tmpPath, translated, 'utf8');
//   console.log(`Section ${i + 1} translated`);
// }

// Step 7: 合并所有段为最终文件
// function mergeSections(outputPath, sectionCount) {
//   let fullContent = '';
//   for (let i = 1; i <= sectionCount; i++) {
//     const tmpPath = path.join(path.dirname(outputPath), '.bak', `section_${i}.tmp`);
//     if (fs.existsSync(tmpPath)) {
//       fullContent += fs.readFileSync(tmpPath, 'utf8');
//     }
//   }
//   // 保持原文换行符
//   const normalized = fullContent.replace(/\r?\n/g, lineEnding);
//   fs.writeFileSync(outputPath, normalized, 'utf8');
//   console.log(`Merged ${sectionCount} sections into: ${outputPath}`);
// }

// Step 8: 清理临时文件
// function cleanupSections(outputPath, sectionCount) {
//   for (let i = 1; i <= sectionCount; i++) {
//     const tmpPath = path.join(path.dirname(outputPath), '.bak', `section_${i}.tmp`);
//     if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
//   }
// }
```

## 附录 B：翻译进度模板（FanYi-JinDu.md）

```markdown
# 翻译进度 — {项目名}

## 术语表

| English | 中文 | 备注 |
|---------|------|------|
| skill | 技能 | |
| prompt | 提示词 | |
| ... | ... | |

## 文件清单

| # | 文件路径 | 行数 | 优先级 | 状态 | 翻译者 | 备注 |
|---|---------|------|--------|------|--------|------|
| 1 | skills/xxx/SKILL.md | 120 | P1 | ✅ | TRAE | |
| 2 | skills/yyy/SKILL.md | 85 | P2 | 🔄 | 子代理A | |
| 3 | skills/zzz/SKILL.md | 200 | P3 | ⏳ | — | 长文件，需分段 |

## 翻译日志

### {YYYY-MM-DD}
- 完成：xxx, yyy
- 进行中：zzz（第2段/共5段）
- 问题：zzz 中 "dispatch" 译法待确认
```

## 附录 C：从全局规则提炼的强制规则

以下规则从 TRAE-Rule 和 JiaoBen-GuiFan 中提炼，翻译任务必须遵循：

| 规则编号 | 原始来源 | 内容 |
|----------|---------|------|
| BAN-001 | TRAE-Rule P0 | 禁止通过 Bash echo 重定向写入中文文本，使用 Write/Edit 工具或 Node.js |
| BAN-002 | TRAE-Rule P0 | 禁止覆盖写入脚本文件，必须用 Edit 工具 |
| BAN-005 | TRAE-Rule P0 | 双引号字符串中变量后跟非变量名字符时必须用 ${} 包裹 |
| HAB-001 | TRAE-Rule P0 | Agent 默认用 Bash echo 写中文，必须纠正为 Write/Edit 工具或 Node.js |
| 子代理五要素 | TRAE-Rule P2 | 派发子代理时必须传递：指导文件+项目摘要+输出格式+文件路径+工具约束 |

## 附录 D：glossary.json 翻译记忆参考

翻译记忆文件位于 `skills/FanYi-JiNeng/glossary.json`（相对于技能库根目录）。

**用途**：每次翻译新技能时，先读 glossary.json 获取已有术语译法，翻译完成后把新术语追加进去。

**格式**：
```json
{
  "agent": "Agent",
  "skill": "技能",
  "sub-agent": "子代理",
  "dispatch": "派发",
  "workspace": "工作区",
  "wormhole": "虫洞",
  "Symlink": "Symlink（符号链接）",
  "dot-source": "dot-source（点源引入）",
  "BAK": "BAK（备份归档）",
  "roaming": "漫游",
  "credentials": "凭证",
  "prerequisite": "前置条件",
  "idempotent": "幂等",
  "fallback": "回退",
  "graceful degradation": "优雅降级",
  "YiTi": "一体化",
  "ChongDong": "虫洞化",
  "QiDong": "启动",
  "JianCe": "检测",
  "TuoPan": "托盘",
  "GongGong": "公共",
  "ZhuCe": "注册",
  "Biao": "表"
}
```

**注意**：glossary.json 路径使用相对路径（相对于技能库根目录），不硬编码盘符。实际使用时由 Agent 根据运行环境拼接完整路径。

---

*本规范由 FanYi-JiNeng（TRAE 版）与 ZhiDao-FanYi（Marvis 版）合并而成，面向 Codex/TRAE/QClaw 等 Agent 通用。*
* glossary.json 位于同目录下，翻译新技能时请先查阅。*

---
最后更新：2026-06-14（沙箱环境适配版：UTF-8 默认 + 去除 PowerShell 编码警告 + 路径默认沙箱）
