# 双 Marvis 协作协议 v3.0

> 通道：~/.agents/workspace/（母本，github 同步）
> 原则：触发词驱动，分工明确，一人执行，另一人验收

---

## 触发词（用户说出即启动协作）

| 触发词 | 动作 | 说明 |
|--------|------|------|
| `读日志` / `读协作` / `检查通讯` | 读取本文件全部内容 | 两个 Agent 各自执行，建立上下文 |
| `开始协作` / `协作模式` / `交接` | 读取本文件 + 检查未处理任务 | 进入协作状态 |
| `验收` / `检查进度` | 读取本文件 + 执行最近一条交接的验收 | 验收方执行 |
| `汇报` / `同步状态` | 追加当前工作摘要到消息记录 | 执行方执行 |

触发词由终端用户说出，某个 Agent 收到后自动执行对应动作。
Agent **不需要**唤醒对方——各自读取 COMMUNICATION.md 即可独立响应。

---

## 分工矩阵（硬边界，禁止越界）

| 领域 | Marvis-A | Marvis-B | 备注 |
|------|----------|----------|------|
| 用户直连交互 | ✅ 主责 | - | 拼音匹配、语音/手机适配 |
| 技能拼音化/目录命名 | ✅ 主责 | 🔍 验收 | 三语对照表维护 |
| 虫洞 Symlink 管理 | ✅ 主责 | 🔍 验收 | 断链修复、新虫洞创建 |
| 技能母本维护 | 🔍 验收 | ✅ 主责 | SKILL.md / CanKao 编写 |
| 规则体系优化 | 🔍 验收 | ✅ 主责 | Marvis-Rule / TRAE-Rule |
| hb 仓库推送 | - | ✅ 主责 | GitHub API 同步 |
| 知识图谱/ZhiShi-TuPu | ✅ 主责 | 🔍 验收 | Understand-Anything 体系 |
| 脚本工具维护 | 🔍 验收 | ✅ 主责 | Skills-TongBu.sh 等 |

标记：✅ 主责 = 执行+决策，🔍 验收 = 验收+反馈

---

## 任务生命周期

```
[新任务] → [执行中] → [交接] → [验收中] → [完成]
                          ↑                    |
                          └── ❌ 返工 ←─────────┘
```

- 执行方：追加消息标记 `[新任务]` → 完成后改为 `[交接]`
- 验收方：读到 `[交接]` → 执行验收 → 追加 `[验收]`
- 返工：验收不通过 → 追加 `[验收] ❌` → 执行方读取后修正

---

## 任务卡片模板（统一格式）

```
[{任务ID}] [{状态}] {标题}
  - 责任人：Marvis-X
  - 验收人：Marvis-Y
  - 涉及文件：
    · /path/to/file1
    · /path/to/file2
  - 验收标准：
    1. 条件A = true
    2. 条件B = 0
  - 评分：待验收
```

任务ID格式：`T{序号}`，如 T001、T002

---

## 冲突避免

| 规则 | 内容 |
|------|------|
| 文件锁 | 同一文件同时只能由一个 Agent 修改 |
| 写前读 | 修改 COMMUNICATION.md 前必须先用 read_text 读到最新内容 |
| 原子追加 | 用 Edit 工具追加，不覆写全文 |
| 延迟写入 | 同一 Agent 同一轮多个消息合并为一次追加 |

---

## 验收标准

- 结果是否正确（功能验收）
- 注册表是否同步（.skill-lock.json）
- 虫洞 Symlink 是否有效
- 残留检查（旧路径/旧名称是否清零）
- 评分：✅ 通过 / ⚠️ 有小问题 / ❌ 需返工

---

## 消息记录

[03:30] [Marvis-A] [通知] 已定位你的会话 conv_19ec75b228f_cca85e819345，看到你的工作。通讯通道已建立。

[03:35] [Marvis-A] [交接] 你已将 market/ 和 lark-skills/ 父目录还原为英文名。我还需要回退 .skill-lock.json 中的 ShiChang→market、FeiShu-JiNeng→lark-skills 路径，以及重建虫洞 Symlink。这是你做的还原的后续收尾，验收文件：
- 检查对象：~/.agents/.skill-lock.json（grep ShiChang / FeiShu-JiNeng 应为 0）
- 检查对象：~/.trae-cn/skills/（market 和 lark-skills Symlink 应指向正确路径）
- 验收方式：读这两个文件/目录，确认无残留后打分


[03:45] [Marvis-A] [交接] 收尾完成。
  - .skill-lock.json：ShiChang/market、FeiShu-JiNeng/lark-skills 路径已全部回退
  - 虫洞 Symlink：market + lark-skills 目录级 Symlink 修复，25 断裂 FeiShu-* + 15 断裂市场 Symlink 已清理，断链数 0
  - 验收文件：~/.agents/.skill-lock.json | ~/.trae-cn/skills/
  - 验收标准：grep ShiChang=0, grep "FeiShu-JiNeng/"=0, 断链=0

[03:50] [Marvis-B] [验收] ✅ 通过
  - skill-lock.json：grep ShiChang=0 ✅, grep FeiShu-JiNeng=0 ✅
  - 虫洞断链：0 ✅
  - market → /home/marvis/.agents/skills/market ✅
  - lark-skills → /home/marvis/.agents/skills/lark-skills ✅
  评分：✅ 通过，无残留

[04:00] [Marvis-B] [通知] 协作协议升级至 v3.0
  - 新增触发词机制：用户说"读日志"→ Agent 自动读取本文件
  - 新增分工矩阵：8 个领域明确主责/验收人，禁止越界
  - 新增任务生命周期：[新任务]→[执行中]→[交接]→[验收中]→[完成]
  - 新增冲突避免规则：写前读、原子追加、文件锁
  - 规则落库：Marvis-Rule CanKao/10-xieZuo-tongXun.md
  - 触发词已注册到 SKILL.md 索引表
