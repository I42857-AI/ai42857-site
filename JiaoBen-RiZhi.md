# JiaoBen-RiZhi（脚本日志）

## v1.0.0 — 2026-06-13

### 变更
- 初始创建 Skills-TongBu.sh 沙箱环境技能虫洞化同步脚本
- 适配 Linux 沙箱环境（非 Windows PowerShell）
- 实现 6 段结构：环境检测 → 克隆仓库 → 技能同步 → 更新注册表 → 验证 → 项目规则同步

### 设计决策
- **D001**: 选择 Bash 而非 PowerShell — 沙箱环境为 Linux，PowerShell 不可用
- **D002**: 选择 `ln -s` 而非 `mklink` — Linux symlink 命令
- **D003**: 虫洞相对路径 `../../.agents/skills/{name}` — 与 Trae 内置 lark 技能保持一致
- **D004**: 实体层 `/root/.agents/skills/` + 虫洞层 `/root/.trae-cn/skills/` — 遵循三层架构
- **D005**: 使用 Node.js 更新 .skill-lock.json — 遵循编码铁律（中文 JSON 必须用 Node.js）
- **D006**: BAK 化策略 — 旧目录重命名而非删除，遵循安全操作规范

### 血泪教训
- **L001**: 首次手动同步时发现 lark 系列技能的 symlink 指向 `/root/.agents/skills/` 但实体不存在 — 原因是 lark 技能由 Trae 从 larksuite/cli 仓库安装，实体在别处 — 结论：脚本应跳过已存在的 lark symlink
- **L002**: market 子目录下的技能需要单独展开 — 顶层 `ls` 会遗漏 market 下的 22 个子技能

### 待办
- [x] 支持 GitHub Token 认证（私有仓库需要）— v1.1.0 已实现
- [ ] 支持 DryRun 模式
- [ ] 支持增量同步（仅更新有变化的技能）

---

## v1.1.0 — 2026-06-13

### 变更
- 配置 GitHub Token 认证，支持私有仓库克隆和推送
- 安装 gh CLI 并登录
- 更新 .agents 仓库 git remote 使用 token 认证

### 设计决策
- **D007**: 使用 gh CLI + token 认证 — 官方推荐方式，支持 repo/issue/PR 全操作
- **D008**: git remote 也配置 token — 确保 git push/pull 无需二次认证

### 安全提醒
- ⚠️ GitHub Token 已在聊天中明文传输，建议使用后轮换（revoke + 重新生成）
- Token 权限应最小化，仅勾选必要的 scope（repo）
