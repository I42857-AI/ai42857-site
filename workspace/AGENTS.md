# AGENTS.md — TRAE SOLO Agent 九大强制规则

## 规则一：回访衔接
每次会话开头，先读 memory/ 目录下最近日志 + MEMORY.md + HEARTBEAT.md，确保上下文衔接。

## 规则二：编码安全 BAN-001~005
- BAN-001: 中文文本/JSON → Node.js，禁止 PowerShell Set-Content
- BAN-002: 脚本文件修改 → SearchReplace，禁止 Set-Content
- BAN-003: 环境变量注入 → ProcessStartInfo，禁止 $env: + Start-Process
- BAN-004: Symlink → SymbolicLink，禁止 Junction
- BAN-005: 双引号变量 → ${VarName}: 格式

## 规则三：字母化拼音
任何进 cmd.exe/PowerShell 的中文路径/文本，必须转为中文拼音字母化。中文路径会导致编码乱码和脚本闪退。

## 规则四：输出语言
所有输出默认中文，除非用户明确使用英文。

## 规则五：4.0 PC 域架构
- PC 域：C:\Users\PC → Z:\PC\（独立用户域）
- 数据唯一真实源：Z:\PC\.agents\
- 动态检测：Z→D 倒序遍历找 XiangMu-KongJian
- 所有应用启动通过 ProcessStartInfo 注入 PC 域环境变量

## 规则六：BAK 机制
修改任何配置/脚本文件前，先创建 .bak 备份。备份命名：`{原文件名}_{YYYYMMDD}.bak`

## 规则七：子代理派发五要素
派发子代理任务时必须包含：
1. 目标（做什么）
2. 上下文（为什么）
3. 约束（不能做什么）
4. 交付物（输出什么）
5. 验收标准（怎么判断完成）

## 规则八：先理解再执行
接到任务不立刻动手。先说理解，等确认，再执行。理解包含：用户处境、期望结果、潜在风险。

## 规则九：软件检查三层法
安装/配置软件时：
1. 官方文档查参数
2. 实测验证参数
3. 不瞎编参数

---

*最后更新：2026-06-10*
