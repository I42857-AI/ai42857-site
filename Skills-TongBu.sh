#!/usr/bin/env bash
# ==============================================================================
# Skills-TongBu.sh — 沙箱环境技能虫洞化同步脚本
# ==============================================================================
# 用途：从 GitHub 克隆 .agents 私有仓库，将技能同步到 Trae 技能库
# 架构：数据源 /workspace/.agents/skills/ → 实体层 /root/.agents/skills/ (Symlink) → 虫洞层 /root/.trae-cn/skills/ (Symlink)
# 遵循：JiaoBen-GuiFan 脚本规范（拼音字母化、安全操作、BAK 兜底）
# 平台：Linux 沙箱环境（非 Windows）
# ==============================================================================

set -euo pipefail

# ━━━ Section 1: 变量定义 ━━━
readonly SCRIPT_NAME="Skills-TongBu"
readonly SCRIPT_VERSION="1.2.0"
readonly SCRIPT_DATE="2026-06-13"

# GitHub 仓库
readonly GITHUB_USER="I42857-AI"
readonly GITHUB_REPO=".agents"
readonly GITHUB_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

# 沙箱路径
readonly WORKSPACE="/workspace"
readonly AGENTS_DIR="${WORKSPACE}/.agents"
readonly SKILLS_DIR="${AGENTS_DIR}/skills"
readonly ENTITY_DIR="/root/.agents/skills"       # 实体层
readonly WORMHOLE_DIR="/root/.trae-cn/skills"    # 虫洞层
readonly LOCK_FILE="/root/.agents/.skill-lock.json"

# 颜色
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# 计数器
SUCCESS_COUNT=0
SKIP_COUNT=0
ERROR_COUNT=0
ERRORS=()

# ━━━ Section 2: 工具函数 ━━━

log_info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); }
log_skip()    { echo -e "${YELLOW}[SKIP]${NC} $*"; SKIP_COUNT=$((SKIP_COUNT + 1)); }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; ERROR_COUNT=$((ERROR_COUNT + 1)); ERRORS+=("$*"); }
log_section() { echo ""; echo -e "${CYAN}━━━ $* ━━━${NC}"; }

# BAK 化：重命名已有目录（安全操作，不删除）
bak_directory() {
    local target="$1"
    if [ ! -e "$target" ]; then
        return 0
    fi

    local bak_name="${target}.bak_$(date +%Y%m%d)"
    local idx=0
    while [ -e "$bak_name" ]; do
        idx=$((idx + 1))
        bak_name="${target}.bak_${idx}"
    done

    mv "$target" "$bak_name"
    log_info "BAK: $(basename "$target") -> $(basename "$bak_name")"
}

# 检查命令是否存在
check_command() {
    command -v "$1" &>/dev/null
}

# ━━━ Section 3: 环境检测 ━━━

detect_environment() {
    log_section "Section 1: HuanJing-JianCe (环境检测)"

    # 检查 git
    if check_command git; then
        log_success "git: $(git --version)"
    else
        log_error "git not found, cannot clone repository"
        return 1
    fi

    # 检查 node
    if check_command node; then
        log_success "Node.js: $(node --version)"
    else
        log_error "Node.js not found, required for .skill-lock.json update"
        return 1
    fi

    # 检查虫洞目录
    if [ -d "$WORMHOLE_DIR" ]; then
        log_success "虫洞目录存在: ${WORMHOLE_DIR}"
    else
        log_info "创建虫洞目录: ${WORMHOLE_DIR}"
        mkdir -p "$WORMHOLE_DIR"
    fi

    # 检查实体目录
    if [ -d "$ENTITY_DIR" ]; then
        log_success "实体目录存在: ${ENTITY_DIR}"
    else
        log_info "创建实体目录: ${ENTITY_DIR}"
        mkdir -p "$ENTITY_DIR"
    fi

    log_success "环境检测通过"
    return 0
}

# ━━━ Section 4: 克隆仓库 ━━━

clone_repository() {
    log_section "Section 2: KeLong-CangKu (克隆仓库)"

    # 如果已存在，先 BAK 化
    if [ -d "$AGENTS_DIR" ]; then
        log_info ".agents 目录已存在"
        # 检查是否是 git 仓库
        if [ -d "${AGENTS_DIR}/.git" ]; then
            log_info "已是 git 仓库，执行 git pull 更新"
            (cd "$AGENTS_DIR" && git pull --ff-only 2>/dev/null && log_success "git pull 成功") || {
                log_info "git pull 失败，BAK 化后重新克隆"
                bak_directory "$AGENTS_DIR"
                do_clone
            }
            return 0
        else
            log_info "非 git 仓库，BAK 化后重新克隆"
            bak_directory "$AGENTS_DIR"
        fi
    fi

    do_clone
}

do_clone() {
    log_info "克隆仓库: ${GITHUB_URL}"
    if git clone "$GITHUB_URL" "$AGENTS_DIR" 2>/dev/null; then
        log_success "仓库克隆成功"
    else
        log_error "仓库克隆失败（可能需要认证或仓库不存在）"
        log_info "尝试公开仓库 agents..."
        if git clone "https://github.com/${GITHUB_USER}/agents.git" "${AGENTS_DIR}" 2>/dev/null; then
            log_success "公开仓库克隆成功（注意：不含自定义技能）"
        else
            log_error "公开仓库也克隆失败"
            return 1
        fi
    fi
}

# ━━━ Section 5: 技能同步（实体+虫洞） ━━━

sync_skills() {
    log_section "Section 3: JiNeng-TongBu (技能同步)"

    if [ ! -d "$SKILLS_DIR" ]; then
        log_error "技能目录不存在: ${SKILLS_DIR}"
        return 1
    fi

    # 收集所有技能名（顶层 + market 子目录 + lark-skills 子目录）
    local skill_names=()

    # 顶层技能（排除 market 和 lark-skills）
    for skill_dir in "${SKILLS_DIR}"/*/; do
        local name
        name=$(basename "$skill_dir")
        if [ "$name" != "market" ] && [ "$name" != "lark-skills" ]; then
            skill_names+=("$name")
        fi
    done

    # market 下的子技能
    if [ -d "${SKILLS_DIR}/market" ]; then
        for skill_dir in "${SKILLS_DIR}/market"/*/; do
            local name
            name=$(basename "$skill_dir")
            skill_names+=("$name")
        done
    fi

    # lark-skills 下的飞书技能
    if [ -d "${SKILLS_DIR}/lark-skills" ]; then
        for skill_dir in "${SKILLS_DIR}/lark-skills"/*/; do
            local name
            name=$(basename "$skill_dir")
            skill_names+=("$name")
        done
    fi

    log_info "发现 ${#skill_names[@]} 个技能"

    # 逐个同步
    for skill_name in "${skill_names[@]}"; do
        sync_single_skill "$skill_name"
    done
}

sync_single_skill() {
    local skill_name="$1"

    # 确定源路径（数据源：/workspace/.agents/skills/）
    local source_dir=""
    local source_subdir=""  # 子目录标记（market/lark-skills）
    if [ -d "${SKILLS_DIR}/${skill_name}" ]; then
        source_dir="${SKILLS_DIR}/${skill_name}"
    elif [ -d "${SKILLS_DIR}/market/${skill_name}" ]; then
        source_dir="${SKILLS_DIR}/market/${skill_name}"
        source_subdir="market"
    elif [ -d "${SKILLS_DIR}/lark-skills/${skill_name}" ]; then
        source_dir="${SKILLS_DIR}/lark-skills/${skill_name}"
        source_subdir="lark-skills"
    else
        log_skip "${skill_name}: 源目录不存在"
        return
    fi

    # 检查 SKILL.md
    if [ ! -f "${source_dir}/SKILL.md" ]; then
        log_skip "${skill_name}: 缺少 SKILL.md"
        return
    fi

    # Step 1: 实体层 = Symlink 指向数据源（沙箱优化：不复制，直接链接）
    # 沙箱环境中 /workspace 和 /root 在同一文件系统，Symlink 比复制更高效
    local entity_path="${ENTITY_DIR}/${skill_name}"
    local entity_target
    if [ -n "$source_subdir" ]; then
        entity_target="${SKILLS_DIR}/${source_subdir}/${skill_name}"
    else
        entity_target="${SKILLS_DIR}/${skill_name}"
    fi

    if [ -L "$entity_path" ]; then
        # 已是 symlink，检查指向
        local current_target
        current_target=$(readlink "$entity_path")
        if [ "$current_target" = "$entity_target" ]; then
            log_skip "${skill_name}: 实体层链接已正确"
        else
            rm "$entity_path"
            ln -s "$entity_target" "$entity_path"
            log_success "${skill_name}: 实体层链接已修正"
        fi
    elif [ -d "$entity_path" ]; then
        # 是实体目录（旧版复制残留），BAK 化后改为 Symlink
        bak_directory "$entity_path"
        ln -s "$entity_target" "$entity_path"
        log_success "${skill_name}: 实体目录已 BAK 化，改为链接"
    else
        ln -s "$entity_target" "$entity_path"
        log_success "${skill_name}: 实体层链接已创建"
    fi

    # Step 2: 创建虫洞 symlink（/root/.trae-cn/skills/ → /root/.agents/skills/）
    local wormhole_path="${WORMHOLE_DIR}/${skill_name}"
    # lark-skills 子目录下的技能指向 lark-skills/ 路径
    local relative_target
    if [ -n "$source_subdir" ]; then
        relative_target="../../.agents/skills/${source_subdir}/${skill_name}"
    else
        relative_target="../../.agents/skills/${skill_name}"
    fi

    if [ -L "$wormhole_path" ]; then
        # 已是 symlink，检查指向
        local current_target
        current_target=$(readlink "$wormhole_path")
        if [ "$current_target" = "$relative_target" ]; then
            log_skip "${skill_name}: 虫洞已存在且指向正确"
        else
            rm "$wormhole_path"
            ln -s "$relative_target" "$wormhole_path"
            log_success "${skill_name}: 虫洞指向已修正"
        fi
    elif [ -d "$wormhole_path" ]; then
        # 是实体目录，BAK 化后创建 symlink
        bak_directory "$wormhole_path"
        ln -s "$relative_target" "$wormhole_path"
        log_success "${skill_name}: 实体已 BAK 化，虫洞已创建"
    else
        ln -s "$relative_target" "$wormhole_path"
        log_success "${skill_name}: 虫洞已创建"
    fi
}

# ━━━ Section 6: 更新注册表 ━━━

update_lock_file() {
    log_section "Section 4: GengXin-ZhuCeBiao (更新注册表)"

    if [ ! -d "$ENTITY_DIR" ]; then
        log_error "实体目录不存在，跳过注册表更新"
        return 1
    fi

    # 确保 /root/.agents 目录存在
    mkdir -p "$(dirname "$LOCK_FILE")"

    # 用 Node.js 更新 .skill-lock.json（遵循编码铁律）
    node -e '
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const lockPath = "'"$LOCK_FILE"'";
const skillsDir = "'"$ENTITY_DIR"'";
const now = new Date().toISOString();

let lock = { version: 3, skills: {}, dismissed: {} };
try {
    lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
} catch(e) {
    console.log("Creating new .skill-lock.json");
}

const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
let added = 0;
let updated = 0;

function processSkillDir(name, skillPath, subDir) {
    const skillMdPath = path.join(skillPath, "SKILL.md");
    if (!fs.existsSync(skillMdPath)) return;

    let hash = "custom";
    try {
        const files = [];
        function walk(dir) {
            for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
                const fp = path.join(dir, f.name);
                if (f.isDirectory()) walk(fp);
                else if (f.isFile()) files.push(fs.readFileSync(fp));
            }
        }
        walk(skillPath);
        hash = crypto.createHash("sha256").update(Buffer.concat(files)).digest("hex");
    } catch(e) {}

    const skillPathStr = subDir ? "skills/" + subDir + "/" + name + "/SKILL.md" : "skills/" + name + "/SKILL.md";

    if (!lock.skills[name]) {
        lock.skills[name] = {
            source: "I42857-AI/.agents",
            sourceType: "github",
            sourceUrl: "https://github.com/I42857-AI/.agents.git",
            skillPath: skillPathStr,
            skillFolderHash: hash,
            installedAt: now,
            updatedAt: now
        };
        added++;
    } else if (lock.skills[name].skillFolderHash !== hash) {
        lock.skills[name].skillFolderHash = hash;
        lock.skills[name].skillPath = skillPathStr;
        lock.skills[name].updatedAt = now;
        updated++;
    }
}

for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    const skillPath = path.join(skillsDir, name);

    if (name === "lark-skills") {
        // 处理 lark-skills 子目录
        for (const sub of fs.readdirSync(skillPath, { withFileTypes: true })) {
            if (!sub.isDirectory()) continue;
            processSkillDir(sub.name, path.join(skillPath, sub.name), "lark-skills");
        }
    } else {
        processSkillDir(name, skillPath, null);
    }
}

fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2), "utf8");
console.log("注册表更新完成: 新增 " + added + " / 更新 " + updated + " / 总计 " + Object.keys(lock.skills).length);
' 2>&1

    if [ $? -eq 0 ]; then
        log_success "注册表更新成功"
    else
        log_error "注册表更新失败"
    fi
}

# ━━━ Section 7: 验证 ━━━

verify_sync() {
    log_section "Section 5: YanZheng (验证)"

    local valid=0
    local broken=0

    for link in "${WORMHOLE_DIR}"/*/; do
        local name
        name=$(basename "$link")
        if [ -f "${WORMHOLE_DIR}/${name}/SKILL.md" ]; then
            valid=$((valid + 1))
        else
            broken=$((broken + 1))
            log_error "无效虫洞: ${name}"
        fi
    done

    log_info "有效虫洞: ${valid} / 无效: ${broken}"

    # 检查实体与虫洞一致性
    local entity_count
    entity_count=$(ls -1d "${ENTITY_DIR}"/*/ 2>/dev/null | wc -l)
    local wormhole_count
    wormhole_count=$(ls -1d "${WORMHOLE_DIR}"*/ 2>/dev/null | wc -l)

    log_info "实体层: ${entity_count} 个技能 / 虫洞层: ${wormhole_count} 个技能"

    if [ "$valid" -gt 0 ]; then
        log_success "验证通过"
    fi
}

# ━━━ Section 8: 汇总报告 ━━━

final_report() {
    log_section "汇总报告"

    echo -e "  成功: ${GREEN}${SUCCESS_COUNT}${NC}"
    echo -e "  跳过: ${YELLOW}${SKIP_COUNT}${NC}"
    echo -e "  错误: ${RED}${ERROR_COUNT}${NC}"

    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}错误详情:${NC}"
        for err in "${ERRORS[@]}"; do
            echo -e "  ${RED}X${NC} ${err}"
        done
    fi

    echo ""
    if [ $ERROR_COUNT -eq 0 ]; then
        echo -e "${GREEN}ALL DONE!${NC} 技能虫洞化同步完成"
    else
        echo -e "${YELLOW}DONE with ${ERROR_COUNT} error(s)${NC}"
    fi
}

# ━━━ Section 9: TRAE-Rule 项目规则同步 ━━━

sync_trae_rules() {
    log_section "Section 6: TRAE-Rule-TongBu (项目规则同步)"

    local rules_dir="${WORKSPACE}/.trae/rules"
    local rule_file="${rules_dir}/project_rules.md"
    local skill_rule="${SKILLS_DIR}/Marvis-Rule/SKILL.md"

    if [ ! -f "$skill_rule" ]; then
        log_skip "Marvis-Rule SKILL.md 不存在"
        return
    fi

    mkdir -p "$rules_dir"

    # 检查是否需要更新
    if [ -f "$rule_file" ]; then
        log_info "项目规则文件已存在，检查是否需要更新"
        # 简单比较：如果 TRAE-Rule SKILL.md 更新时间比规则文件新，则重新生成
        if [ "$skill_rule" -nt "$rule_file" ]; then
            log_info "TRAE-Rule 有更新，需要重新生成项目规则"
        else
            log_skip "项目规则已是最新"
            return
        fi
    fi

    log_info "项目规则需要手动重新生成（路径映射需要适配沙箱环境）"
    log_info "请使用 Agent 执行：读取 TRAE-Rule SKILL.md → 适配路径 → 写入 .trae/rules/project_rules.md"
}

# ━━━ 主流程 ━━━

main() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Skills-TongBu v${SCRIPT_VERSION}                        ║${NC}"
    echo -e "${CYAN}║  沙箱环境技能虫洞化同步脚本                      ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    detect_environment || { log_error "环境检测失败，终止"; final_report; exit 1; }
    clone_repository   || { log_error "仓库克隆失败，终止"; final_report; exit 1; }
    sync_skills        || { log_error "技能同步失败"; }
    update_lock_file
    verify_sync
    sync_trae_rules
    final_report

    # 返回码
    if [ $ERROR_COUNT -gt 0 ]; then
        exit 1
    fi
    exit 0
}

main "$@"
