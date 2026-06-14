# 沙箱环境清理日志

**日期**: 2026-06-13
**操作者**: TRAE Agent (GLM-5.1)
**沙箱环境**: /workspace (virtiofs 挂载)

---

## 清理操作

### 1. 删除重复目录 /workspace/workspace/
- **原因**: 与 /workspace/.agents/workspace/ 完全重复，沙箱平台自动创建的映射副本
- **内容**: 身份文件 (SOUL/USER/MEMORY/IDENTITY/HEARTBEAT/AGENTS.md) + conv 会话临时文件
- **操作**: `rm -rf /workspace/workspace/`
- **保留**: /workspace/.agents/workspace/ (Git 数据源)

### 2. 删除旧版技能目录 /workspace/skills.bak_20260613
- **原因**: v1.0.0 同步脚本创建的 /workspace/skills/ 旧版残留，已 BAK 化
- **内容**: 旧版技能目录结构（空目录为主）
- **操作**: `rm -rf /workspace/skills.bak_20260613`

### 3. 删除实体层 BAK 目录 /root/.agents/skills/*.bak_*
- **原因**: v1.2.0 优化后，实体层从"复制文件"改为"Symlink 指向数据源"，旧版复制的实体目录已 BAK 化
- **数量**: 41 个 BAK 目录
- **操作**: `rm -rf /root/.agents/skills/*.bak_*`

---

## 架构变更记录

### Skills-TongBu.sh 版本演进

| 版本 | 实体层策略 | 虫洞层策略 | 问题 |
|------|-----------|-----------|------|
| v1.0.0 | 复制文件到 /root/.agents/skills/ | Symlink → 实体层 | 数据重复 |
| v1.1.0 | 同上 + 支持 lark-skills 子目录 | 同上 | 仍然重复 |
| v1.2.0 | Symlink → /workspace/.agents/skills/ | Symlink → 实体层 | 零重复，纯链接 |

### 当前架构（纯虫洞化）

```
/workspace/.agents/skills/          ← 唯一真实数据源 (Git 仓库)
       ↑ ln -s
/root/.agents/skills/               ← 实体层 (Symlink → 数据源)
       ↑ ln -s
/root/.trae-cn/skills/              ← 虫洞层 (Symlink → 实体层)
```

### 飞书技能虫洞化

- 26个飞书技能从 /app/pre/skills/lark-skills/ 复制到 /workspace/.agents/skills/lark-skills/
- 虫洞层 Symlink 修复：lark-* → ../../.agents/skills/lark-skills/{name}
- .skill-lock.json 更新：67个技能统一指向 I42857-AI/.agents 仓库

---

## GitHub 提交记录

1. `feat: 纳入飞书技能到 lark-skills/ 子目录` — 26个飞书技能 + .skill-lock.json
2. `chore: 更新 .skill-lock.json 飞书技能指向 lark-skills/ 子目录` — 注册表更新
3. `feat: Skills-TongBu v1.1.0 支持 lark-skills 子目录` — 脚本更新
4. `refactor: Skills-TongBu v1.2.0 实体层改为 Symlink 指向数据源` — 架构优化

---

## 清理后目录结构

```
/workspace/
├── .agents/                    ← Git 仓库（唯一数据源）
│   ├── skills/                 ← 技能源文件
│   │   ├── DouBao-ShengTu/     ← 自研技能（18个）
│   │   ├── market/             ← 市场技能（22个）
│   │   ├── lark-skills/        ← 飞书技能（26个）
│   │   └── TRAE-Rule/
│   ├── workspace/              ← 身份文件
│   ├── Skills-TongBu.sh        ← 同步脚本 v1.2.0
│   └── .skill-lock.json        ← 注册表
├── .trae/rules/                ← 项目规则
├── .rizhi/                     ← 日志总控
├── .jiaoben/                   ← 脚本入口
├── .qianzhi-gongju/            ← 工具安装
├── XiangMu-KongJian/           ← 项目空间
└── .zhuce-biao/                ← 注册表

/root/.agents/skills/           ← 实体层（Symlink → 数据源）
/root/.trae-cn/skills/          ← 虫洞层（Symlink → 实体层）
```
