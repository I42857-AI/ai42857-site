# QClaw 账号管理技能

## 概述

管理 QClaw 桌面端的多账号切换。基于 SymbolicLink 符号链接（虫洞模式）实现完整账号数据（凭证、Local Storage、Cookies、Session）的一键切换。

## 核心原理

QClaw (Electron) 的账号凭证分布在 `~/.config/QClaw` 的多个位置：
- `app-store.json` — 加密的 JWT/API Key/userInfo
- `Local Storage/leveldb/` — jwt_token/userInfo 缓存（**QClaw 优先读取此处**）
- `Cookies` — 网页登录态
- `Session Storage` / `IndexedDB` — 会话和应用数据

**关键发现**：
- `app-store.json` 的 cipherText 是动态加密的，每次登录都变
- 解密密钥存在 Local Storage 的 LevelDB 中
- 只替换 app-store.json 不够，QClaw 优先读 Local Storage 缓存
- **必须整目录替换**（Symlink 虫洞方案）才能完整切换账号

## 文件结构

```
/workspace/XiangMu-KongJian/QClaw/
  QClaw-PingZheng/          ← 账号凭证库存
    PC-Home/                ← 账号 1
      Roaming-QClaw/        ← 完整 ~/.config/QClaw 备份（47+ 文件）
    PC-Home-Account2/       ← 账号 2
      Roaming-QClaw/
    PC-1/                   ← 待补全（仅 app-store.json）
      app-store.json

/workspace/.jiaoben/QClaw-JiaoBen/  ← Symlink 快速调用入口
/workspace/XiangMu-KongJian/QClaw/QClaw-JiaoBen/  ← 脚本实体目录
  BaoCun-ZhangHao.sh        ← 账号保存脚本
  QieHuan-ZhangHao.sh       ← 账号切换脚本
  QClaw-YiTi.sh             ← 一体化启动脚本
  11-QClaw-Symlink-Patch.js ← Symlink 路径修补
```

## 操作流程

### 保存新账号

**触发**：用户说"保存账号" / 运行 `QClaw-JiaoBen/BaoCun-ZhangHao.sh`

1. 确认 QClaw 正在运行且已登录目标账号
2. 运行 `BaoCun-ZhangHao.sh`
3. 输入账号名称（如 `PC-Home`、`PC-GongSi`）
4. 脚本用 rsync 复制 `~/.config/QClaw` → `QClaw-PingZheng/{账号名}/Roaming-QClaw/`
   - 排除：`Cache`, `Code Cache`, `Crashpad`, `DawnGraphiteCache`, `DawnWebGPUCache`, `GPUCache`, `logs`
5. 验证 `app-store.json` 中 `secure.jwtToken` 非空
6. 报告保存结果（成功 / jwtToken 缺失 = 未登录）

**必须运行中**：QClaw 必须已登录才能抓到完整加密上下文。

### 切换账号

**触发**：用户说"切换账号" / 运行 `QClaw-JiaoBen/QieHuan-ZhangHao.sh`

1. **先关闭 QClaw**（Symlink 切换会删除当前 config 目录）
2. 运行 `QieHuan-ZhangHao.sh`
3. 选择目标账号编号
4. 脚本自动：
   - 删除当前 `~/.config/QClaw`（Symlink 或真实目录）
   - 创建 Symlink → `QClaw-PingZheng/{账号名}/Roaming-QClaw`
5. 启动 QClaw 验证

### 便携启动

在新环境上：
1. 运行 `QClaw-JiaoBen/QClaw-YiTi.sh`
2. 脚本自动：检测环境 → source 公共模块 → 修补配置 → 重建 Symlink → 启动 QClaw

## Symlink 生命周期

| 场景 | 行为 |
|------|------|
| 首次创建 | `ln -s` 创建持久化 Symlink |
| 已持久化 Symlink + 关窗口 | 不受影响 |

Symlink 创建即持久化，无需担心关窗口丢失链接。

## 凭证状态

| 账号 | Roaming 完整数据 | 来源 |
|------|-----------------|------|
| Chen Xi | ✅ | 主账号 (2026-05-30) |
| PC-Home | ✅ | 家庭电脑主账号 |
| PC-Home-Account2 | ✅ | 家庭电脑副账号 |
| PC-1 | ❌ 待补全 | 公司电脑 |

**待补全**：回公司电脑运行 `BaoCun-ZhangHao.sh`，输入 `PC-1`。

## Symlink 路径修补（exec-safe-bin-trust 补丁）

### 问题

QClaw (OpenClaw) 的安全模块 `exec-safe-bin-trust-*.js` 在检查 exec 白名单时，只匹配 `resolvedPath`（Symlink路径），不匹配 `resolvedRealPath`（Symlink解析后的真实路径）。

当 QClaw 的数据目录通过 Symlink 虫洞化后（如 `~/.config/QClaw` → `/workspace/XiangMu-KongJian/QClaw/QClaw-PingZheng/...`），exec 请求的 `resolvedRealPath` 指向真实路径，但白名单中只有 Symlink 路径，导致 exec 被拦截。

### 补丁

`11-QClaw-Symlink-Patch.js` 修补 `matchAllowlist` 函数，在 `resolvedPath` 不匹配时，回退匹配 `resolvedRealPath`。

**运行方式**：
```bash
node "/workspace/XiangMu-KongJian/QClaw/QClaw-JiaoBen/11-QClaw-Symlink-Patch.js"
```

**重要**：每次 QClaw 更新版本后，必须重新运行此补丁！补丁会自动：
- 扫描所有版本目录（v0.2.x）
- 跳过已打补丁的版本（幂等）
- 备份原始文件（.bak）

### 补丁位置

```
QClaw/{版本号}/resources/openclaw/node_modules/openclaw/dist/exec-safe-bin-trust-*.js
```

---

*最后更新：2026-06-13*
