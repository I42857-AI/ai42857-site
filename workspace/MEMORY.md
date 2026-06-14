# MEMORY.md

> 人格/身份/方法论 → SOUL.md | 用户信息 → USER.md
> 全局规则 → Marvis-Rule SKILL.md | 行为规范 → AGENTS.md
> 数据源：~/.agents/（hb 仓库，唯一真实数据源）

---

## 关键洞察

**存储 ≠ 激活** — 经验写进文件 ≠ 行动时自动想起。

**上下文污染比能力不足更危险** — 修了三次还没好 → 停下来，清空，重新审视。有备份先用备份。

**外部代码审查不能照单全收** — 审查意见必须独立分析后再决定是否采纳。

---

## 沙箱虫洞架构核心

- 数据唯一真实源：~/.agents/（hb 仓库，skills + workspace + 项目空间）
- 沙箱 skills/ → ~/.agents/skills/（目录级 Symlink，商店下载自动同步）
- 沙箱 output/ → ~/.agents/XiangMu-KongJian/（产出物直接落母本，UI 同步）
- 虫洞命名：目录 `.全小写拼音`，文件 `{AppName}-PascalCase拼音`
- 虫洞层级：目录级 Symlink（直达通道），不再维护文件级 Symlink
- 工作区母本：~/.agents/workspace/（AGENTS/HEARTBEAT/IDENTITY/MEMORY/SOUL/USER）
- 多沙箱共享同一母本，虫洞 Symlink 一处修改全局生效

## 编码安全铁律

- BAN-001: 中文文本/JSON → Node.js，禁止 PowerShell Set-Content
- BAN-002: 脚本文件修改 → SearchReplace，禁止 Set-Content
- BAN-003: 环境变量注入 → ProcessStartInfo，禁止 $env: + Start-Process
- BAN-004: Symlink → SymbolicLink，禁止 Junction
- BAN-005: 双引号变量 → ${VarName}: 格式

## 苍穹系统（历史参考 — 仅 Windows 端有效）

> 云端 Linux 沙箱无苍穹系统。以下为 PC 端历史记录。

- 托盘应用：Z:\PC\CangQiong\CangQiong.ps1
- 四层架构：数据层→汇聚层→检索层→交互层
- 知识图谱：Z:\PC\.zhishi-tupu\CangQiong\（40节点+69边+9层）

## 知识图谱体系（历史参考）

- Dashboard：Z:\PC\Understand-Anything-main\
- 项目：CangQiong / CaiPin-FenJing / JiaoBen-ZhiShiTuPu / Billfish

## 定时任务体系（历史参考 — 当前模式不支持）

| 时间 | 任务 | 输出文件 |
|------|------|---------|
| 12:20 | Symlink健康检查 | ~/.agents/.rizhi/JianKang-JianCe_{YYYYMMDD}.md |
| 12:30 | 日志提炼与BAK化 | ~/.agents/.rizhi/RiZhi_TiLian_{YYYYMMDD}.md |
| 13:10 | 架构洞察与方案推演 | ~/.agents/.rizhi/TuiYan_{YYYYMMDD}.md |
| 13:30 | 归档计划提醒 | ~/.agents/.rizhi/GuiDang-JiHua_{YYYYMMDD}.md |

## 模型配置

- MiMo API 端点：https://token-plan-cn.xiaomimimo.com/v1（唯一可用）
- mimo-v2.5-pro：contextWindow=1M, maxTokens=131072, 支持图片
- mimo-v2-pro：contextWindow=200K, maxTokens=131072, 支持图片
- QClaw 本地代理（127.0.0.1:19000）登录态过期时返回 404，此时切 MiMo 直连

## 用户身份与偏好

- 统一身份：857（创造者），移动办公为主
- 多端 Agent：Marvis（云端主端）、微信小念、QQ小念
- 存在论洋葱结构：存在→见证→相信→存在

## 编码规则（沙箱版）

- Linux 环境优先，Python/Shell 为主力
- 中文路径正常使用（UTF-8 环境），不再受限 cmd.exe 编码
- Symlink 唯一类型 = SymbolicLink（ln -s），禁止 Junction

## 经验教训

- 配置更新教训：不瞎编参数，以实测为准
- 工具选择铁律：场景先于工具，最短路径优先
- 虫洞铁律：母本在 ~/.agents/skills/，虫洞只放 Symlink，禁止复制

## 待办

- [ ] 云端定时任务方案探索（当前不支持 crontab/at）
- [ ] Symlink 健康检查脚本化
- [ ] role-diversion 适配沙箱版
- [ ] 多沙箱 session 管理规范

---

*最后更新：2026-06-15（云端沙箱版：路径修正+虫洞架构+多 Agent 协作）*
